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

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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
      return JSON.parse(req.body);
    }
    return req.body;
  }

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
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
  } catch {
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

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `Portfolio inquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        message,
      ].join("\n"),
    });

    if (error) {
      sendJson(res, 502, { ok: false, error: "Message could not be sent." });
      return;
    }

    sendJson(res, 200, { ok: true });
  } catch {
    sendJson(res, 502, { ok: false, error: "Message could not be sent." });
  }
}
