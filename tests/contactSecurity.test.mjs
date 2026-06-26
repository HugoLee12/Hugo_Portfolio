import assert from "node:assert/strict";
import { Readable } from "node:stream";
import handler, {
  CONTACT_BODY_LIMIT_BYTES,
  sanitizeEmailSubjectValue,
} from "../api/contact.ts";
import vercelConfig from "../vercel.json" with { type: "json" };

function createRequest({ method = "POST", body = "" } = {}) {
  const req = Readable.from(body ? [body] : []);
  req.method = method;
  return req;
}

function createResponse() {
  const headers = new Map();
  return {
    statusCode: 200,
    body: "",
    setHeader(name, value) {
      headers.set(name.toLowerCase(), value);
    },
    end(chunk = "") {
      this.body += chunk;
    },
    getHeader(name) {
      return headers.get(name.toLowerCase());
    },
  };
}

assert.equal(
  sanitizeEmailSubjectValue("  Hugo\r\nBcc: attacker@example.com\tLee  "),
  "Hugo Bcc: attacker@example.com Lee",
);

const oversizedRequest = createRequest({
  body: "x".repeat(CONTACT_BODY_LIMIT_BYTES + 1),
});
const oversizedResponse = createResponse();
await handler(oversizedRequest, oversizedResponse);
assert.equal(oversizedResponse.statusCode, 413);
assert.deepEqual(JSON.parse(oversizedResponse.body), {
  ok: false,
  error: "Request payload is too large.",
});

const securityHeaders = new Map(
  vercelConfig.headers
    ?.find((entry) => entry.source === "/(.*)")
    ?.headers.map((header) => [header.key, header.value]),
);

assert.equal(securityHeaders.get("X-Content-Type-Options"), "nosniff");
assert.equal(
  securityHeaders.get("Referrer-Policy"),
  "strict-origin-when-cross-origin",
);
assert.match(
  securityHeaders.get("Permissions-Policy") || "",
  /camera=\(\), microphone=\(\), geolocation=\(\)/,
);
assert.equal(securityHeaders.get("X-Frame-Options"), "DENY");
