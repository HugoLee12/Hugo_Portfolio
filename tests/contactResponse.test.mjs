import assert from "node:assert/strict";
import { readContactResponse } from "../src/lib/contactResponse.ts";

const okResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
assert.deepEqual(await readContactResponse(okResponse), { ok: true, error: undefined });

const jsonErrorResponse = new Response(
  JSON.stringify({ ok: false, error: "Contact service is not configured." }),
  { status: 500 },
);
assert.deepEqual(await readContactResponse(jsonErrorResponse), {
  ok: false,
  error: "Contact service is not configured.",
});

const textErrorResponse = new Response("A server error has occurred.", {
  status: 500,
});
assert.deepEqual(await readContactResponse(textErrorResponse), {
  ok: false,
  error: "Contact service failed on the server. Check Vercel Function logs.",
});
