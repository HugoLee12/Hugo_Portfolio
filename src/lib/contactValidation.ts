export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  website?: string;
}

export type ContactValidationResult =
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

export function validateContactPayload(payload: unknown): ContactValidationResult {
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
