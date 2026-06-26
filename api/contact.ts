import type { IncomingMessage, ServerResponse } from "node:http";
import { Resend } from "resend";

type ContactRequest = IncomingMessage & {
  body?: unknown;
  method?: string;
};

interface ContactPayload {
  name: string;
  email: string;
  message: string;
  website?: string;
}

type ContactValidationResult =
  | {
      ok: true;
      data: ContactPayload;
      spam?: boolean;
    }
  | {
      ok: false;
      error: string;
    };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CONTACT_BODY_LIMIT_BYTES = 10 * 1024;

class PayloadTooLargeError extends Error {}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function sanitizeEmailSubjectValue(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>,
) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readBody(req: ContactRequest): Promise<unknown> {
  if (req.body) {
    if (typeof req.body === "string") {
      if (Buffer.byteLength(req.body, "utf8") > CONTACT_BODY_LIMIT_BYTES) {
        throw new PayloadTooLargeError();
      }
      return JSON.parse(req.body);
    }
    return req.body;
  }

  let raw = "";
  for await (const chunk of req) {
    raw += String(chunk);
    if (Buffer.byteLength(raw, "utf8") > CONTACT_BODY_LIMIT_BYTES) {
      throw new PayloadTooLargeError();
    }
  }
  return raw ? JSON.parse(raw) : {};
}

function validateContactPayload(payload: unknown): ContactValidationResult {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid request payload." };
  }

  const source = payload as Record<string, unknown>;
  const data: ContactPayload = {
    name: readString(source.name),
    email: readString(source.email),
    message: readString(source.message),
  };
  const website = readString(source.website);

  if (website) {
    return {
      ok: true,
      data: { ...data, website },
      spam: true,
    };
  }

  if (!data.name) {
    return { ok: false, error: "Name is required." };
  }
  if (data.name.length > 80) {
    return { ok: false, error: "Name must be 80 characters or less." };
  }
  if (!EMAIL_PATTERN.test(data.email) || data.email.length > 160) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (data.message.length < 10) {
    return { ok: false, error: "Message must be at least 10 characters." };
  }
  if (data.message.length > 2000) {
    return { ok: false, error: "Message must be 2000 characters or less." };
  }

  return { ok: true, data };
}

export default async function handler(req: ContactRequest, res: ServerResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  let payload: unknown;
  try {
    payload = await readBody(req);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      sendJson(res, 413, { ok: false, error: "Request payload is too large." });
      return;
    }
    sendJson(res, 400, { ok: false, error: "Invalid JSON payload." });
    return;
  }

  const validation = validateContactPayload(payload);
  if (validation.ok === false) {
    sendJson(res, 400, { ok: false, error: validation.error });
    return;
  }

  if (validation.spam) {
    sendJson(res, 200, { ok: true });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

  if (!apiKey || !toEmail) {
    sendJson(res, 500, { ok: false, error: "Contact service is not configured." });
    return;
  }

  const { name, email, message } = validation.data;
  const resend = new Resend(apiKey);
  const subjectName = sanitizeEmailSubjectValue(name) || "Portfolio visitor";

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `Portfolio inquiry from ${subjectName}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend contact email rejected", { error });
      sendJson(res, 502, { ok: false, error: "Message could not be sent." });
      return;
    }

    sendJson(res, 200, { ok: true });
  } catch {
    console.error("Resend contact email failed");
    sendJson(res, 502, { ok: false, error: "Message could not be sent." });
  }
}
