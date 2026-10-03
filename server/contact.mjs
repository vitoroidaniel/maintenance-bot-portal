import { createHash } from "node:crypto";

const services = new Set(["Telegram bot", "Website", "Mobile app", "Presentation", "Something else"]);
const budgets = new Set(["Under EUR 300", "EUR 300-750", "EUR 750-1,500", "EUR 1,500+", "Let's discuss"]);
const fail = (message, status) => Object.assign(new Error(message), { status });
const respond = (response, status, body) => response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" }).end(JSON.stringify(body));

function readJson(request) {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const chunks = [];
    request.on("data", chunk => {
      bytes += chunk.length;
      if (bytes > 16384) { reject(fail("Your message is too long.", 413)); return; }
      chunks.push(chunk);
    });
    request.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); } catch { reject(fail("Please send a valid enquiry.", 400)); } });
    request.on("error", () => reject(fail("The connection was interrupted. Please try again.", 400)));
  });
}

export function validateEnquiry(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw fail("Please send a valid enquiry.", 400);
  const text = key => typeof data[key] === "string" ? data[key].trim() : "";
  const fields = { name: text("name"), email: text("email"), service: text("service"), budget: text("budget"), message: text("message"), website: text("website") };
  if (fields.website) throw fail("We couldn't verify this enquiry. Please try again.", 400);
  if (fields.name.length < 2 || fields.name.length > 80) throw fail("Please enter your name (2-80 characters).", 400);
  if (fields.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) throw fail("Please enter a valid email address.", 400);
  if (!services.has(fields.service) || !budgets.has(fields.budget)) throw fail("Please choose a service and budget.", 400);
  if (fields.message.length < 15 || fields.message.length > 4000) throw fail("Tell me a little about your idea (15-4,000 characters).", 400);
  return fields;
}

export async function sendContactEmail(fields, env) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({ from: env.CONTACT_FROM_EMAIL, to: [env.CONTACT_TO_EMAIL], reply_to: fields.email,
      subject: `New ${fields.service} enquiry - Daniel Portfolio`,
      text: [`Name: ${fields.name}`, `Email: ${fields.email}`, `Service: ${fields.service}`, `Budget: ${fields.budget}`, "", fields.message].join("\n") }),
  });
  if (!response.ok) throw fail("Couldn't deliver your message right now. Please try again shortly.", 502);
  const result = await response.json();
  if (!result.id) throw fail("Couldn't confirm delivery. Please try again shortly.", 502);
}

export function createContactHandler({ env = process.env, deliver = sendContactEmail } = {}) {
  const attempts = new Map();
  return async (request, response) => {
    if (request.method !== "POST") { response.setHeader("Allow", "POST"); respond(response, 405, { error: "Please submit the contact form." }); return; }
    try {
      if (request.headers["sec-fetch-site"] === "cross-site") throw fail("Please submit your enquiry from this website.", 403);
      if (!request.headers["content-type"]?.startsWith("application/json")) throw fail("Please submit a valid enquiry.", 415);
      const fields = validateEnquiry(await readJson(request));
      if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL) throw fail("Message delivery is temporarily unavailable. Your details haven't been sent. Please try again later.", 503);
      const now = Date.now();
      for (const [key, attempt] of attempts) if (attempt.expires <= now) attempts.delete(key);
      const key = createHash("sha256").update(`${request.socket.remoteAddress}:${fields.email.toLowerCase()}`).digest("hex");
      const attempt = attempts.get(key) || { count: 0, expires: now + 600000 };
      if (attempt.count >= 5 || attempts.size >= 10000) { response.setHeader("Retry-After", "600"); throw fail("You've sent a few enquiries already. Please try again in 10 minutes.", 429); }
      attempt.count++; attempts.set(key, attempt);
      await deliver(fields, env);
      respond(response, 200, { ok: true });
    } catch (error) { respond(response, error.status || 502, { error: error.status ? error.message : "Couldn't send your enquiry. Please try again shortly." }); }
  };
}
