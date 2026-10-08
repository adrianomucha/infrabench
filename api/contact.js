/* The contact form's other end: a Vercel function that checks a message and emails it to
   Adrian through Resend. No dependencies; Node's own fetch talks to Resend's API.

   Environment, set in the Vercel project (Settings > Environment Variables):
     RESEND_API_KEY   required. Without it every message is refused, so nothing is lost
                      silently and the form says it could not send.
     CONTACT_TO       where messages go. Defaults to hello@adrianmucha.us.
     CONTACT_FROM     the sender Resend uses. Defaults to Resend's onboarding address, which
                      only delivers to the email the Resend account was opened with; verify
                      adrianmucha.us in Resend and set this to an address on it to send to
                      anyone, e.g. "Infrabench <contact@adrianmucha.us>".

   Spam, without a captcha: a hidden field people never see but form-filling bots do, a
   minimum time on the form, size limits, and requests from other sites turned away. A
   message that trips the first two is answered as if it were sent, so a bot learns nothing. */

const TO = process.env.CONTACT_TO || "hello@adrianmucha.us";
const FROM = process.env.CONTACT_FROM || "Infrabench <onboarding@resend.dev>";
const LIMITS = { name: 100, email: 200, message: 5000, page: 200 };
const MIN_MS = 3000;          // nobody reads the form and writes a message in under three seconds
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// the site itself, its Vercel previews, and local development
function allowedOrigin(origin) {
  if (!origin) return true;   // same-origin requests and non-browser clients send none
  try {
    const host = new URL(origin).hostname;
    return host === "infrabench.dev" || host.endsWith(".infrabench.dev") ||
      host.endsWith(".vercel.app") || host === "localhost" || host === "127.0.0.1";
  } catch (e) { return false; }
}

function clean(v, max) { return typeof v === "string" ? v.trim().slice(0, max) : ""; }

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch (e) { return null; } }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch (e) { return null; }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false, error: "Use POST." }); }
  if (!allowedOrigin(req.headers.origin)) return res.status(403).json({ ok: false, error: "Not from this site." });

  const body = await readBody(req);
  if (!body) return res.status(400).json({ ok: false, error: "That message could not be read." });

  // the traps: answered as a success so a bot has nothing to adjust to
  if (clean(body.company, 200) || !(Number(body.elapsed) >= MIN_MS)) return res.status(200).json({ ok: true });

  const name = clean(body.name, LIMITS.name).replace(/[\r\n]+/g, " ");
  const email = clean(body.email, LIMITS.email);
  const message = clean(body.message, LIMITS.message);
  const page = clean(body.page, LIMITS.page);
  if (!EMAIL.test(email)) return res.status(400).json({ ok: false, field: "email", error: "Add an email address Adrian can reply to." });
  if (message.length < 2) return res.status(400).json({ ok: false, field: "message", error: "Write a message first." });

  const key = process.env.RESEND_API_KEY;
  if (!key) { console.error("contact: RESEND_API_KEY is not set"); return res.status(503).json({ ok: false, error: "The form is not set up yet." }); }

  const who = name || email;
  const lines = ["From: " + (name ? name + " <" + email + ">" : email)];
  if (page) lines.push("Sent from: https://infrabench.dev" + page);
  lines.push("", message, "", "Reply to this email to answer them directly.");
  const text = lines.join("\n");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [TO], reply_to: email, subject: "Infrabench: a message from " + who, text: text }),
    });
    if (!r.ok) {
      console.error("contact: Resend answered " + r.status + " " + (await r.text()).slice(0, 300));
      return res.status(502).json({ ok: false, error: "The message could not be delivered. Try again in a moment." });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("contact: " + e.message);
    return res.status(502).json({ ok: false, error: "The message could not be delivered. Try again in a moment." });
  }
};
