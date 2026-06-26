import assert from "node:assert/strict";
import { validateContactPayload } from "../src/lib/contactValidation.ts";

const validPayload = {
  name: "Hugo Lee",
  email: "sender@example.com",
  message: "Hello, I would like to talk about a portfolio opportunity.",
};

assert.deepEqual(validateContactPayload(validPayload), {
  ok: true,
  data: validPayload,
});

assert.deepEqual(validateContactPayload({ ...validPayload, name: "  Hugo Lee  " }), {
  ok: true,
  data: { ...validPayload, name: "Hugo Lee" },
});

assert.deepEqual(validateContactPayload({ ...validPayload, message: "short" }), {
  ok: false,
  error: "Message must be at least 10 characters.",
});

assert.deepEqual(validateContactPayload({ ...validPayload, email: "not-an-email" }), {
  ok: false,
  error: "Enter a valid email address.",
});

assert.deepEqual(validateContactPayload({ ...validPayload, website: "spam.example" }), {
  ok: true,
  data: { ...validPayload, website: "spam.example" },
  spam: true,
});
