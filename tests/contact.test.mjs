import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createContactHandler, sendContactEmail } from "../server/contact.mjs";

const enquiry = { name: "Test Client", email: "client@example.com", service: "Website", budget: "EUR 300-750", message: "A new website for our small business.", website: "" };
async function withServer(options, run) {
  const server = createServer(createContactHandler(options));
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const post = body => fetch(`http://127.0.0.1:${server.address().port}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });
  try { await run(post); } finally { await new Promise(resolve => server.close(resolve)); }
}
test("unconfigured form reports unavailable instead of fake success", async () => {
  await withServer({ env: {} }, async post => { assert.equal((await post(enquiry)).status, 503); });
});
test("validation rejects malformed, spam, invalid email and oversized submissions", async () => {
  await withServer({ env: {} }, async post => {
    for (const data of ["{", { ...enquiry, email: "bad" }, { ...enquiry, website: "spam" }, { ...enquiry, service: "Injected" }, { ...enquiry, message: "short" }]) assert.equal((await post(data)).status, 400);
    assert.equal((await post({ ...enquiry, message: "x".repeat(17000) })).status, 413);
  });
});
test("valid enquiry is delivered exactly once with reply details, then rate limited", async () => {
  const delivered = [];
  await withServer({ env: { RESEND_API_KEY: "test-only", CONTACT_FROM_EMAIL: "sender@example.com", CONTACT_TO_EMAIL: "owner@example.com" }, deliver: async fields => { delivered.push(fields); } }, async post => {
    for (let i = 0; i < 5; i++) assert.equal((await post(enquiry)).status, 200);
    assert.equal(delivered[0].email, enquiry.email);
    assert.equal(delivered[0].message, enquiry.message);
    assert.equal((await post(enquiry)).status, 429);
    assert.equal(delivered.length, 5);
  });
});
test("provider failure never returns a successful submission", async () => {
  await withServer({ env: { RESEND_API_KEY: "test-only", CONTACT_FROM_EMAIL: "sender@example.com", CONTACT_TO_EMAIL: "owner@example.com" }, deliver: async () => { throw new Error("provider unavailable"); } }, async post => { assert.equal((await post(enquiry)).status, 502); });
});
test("Resend receives the configured sender, recipient and visitor as reply-to", async context => {
  let payload;
  context.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    payload = JSON.parse(options.body);
    return { ok: true, json: async () => ({ id: "mock-email-id" }) };
  });
  await sendContactEmail(enquiry, { RESEND_API_KEY: "test-only", CONTACT_FROM_EMAIL: "sender@example.com", CONTACT_TO_EMAIL: "owner@example.com" });
  assert.equal(payload.from, "sender@example.com");
  assert.deepEqual(payload.to, ["owner@example.com"]);
  assert.equal(payload.reply_to, enquiry.email);
  assert.ok(payload.text.includes(enquiry.message));
});
