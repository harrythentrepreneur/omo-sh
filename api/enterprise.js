// Vercel serverless function: POST /api/enterprise
// Captures the Enterprise page form. No dependencies.
//
// Storage: Upstash Redis / Vercel KV over its REST API. Connect a store to the Vercel project
// (Storage -> Upstash Redis or KV) and Vercel adds KV_REST_API_URL + KV_REST_API_TOKEN
// (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN) automatically.
// Each lead is pushed to the Redis list "omo:enterprise:leads" and stored as "omo:enterprise:lead:<id>".
//
// Until a store is connected this returns 503, and the page falls back to a prefilled email,
// so a visitor's request is never silently dropped.

const SIZES = new Set(["1-49", "50-249", "250-999", "1,000-4,999", "5,000+"]);
const FIELDS = {
  name: [true, 120], email: [true, 200], company: [true, 160], role: [false, 120],
  size: [true, 40], agents: [false, 40], interest: [false, 400], timeline: [false, 40],
  message: [false, 4000], consent: [true, 10],
};
const EMAIL = /^[^@\s<>]{1,64}@[^@\s<>]{1,190}\.[A-Za-z]{2,24}$/;

function store() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redis(s, cmd) {
  const r = await fetch(s.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${s.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error(`store ${r.status}`);
  return r.json();
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  let data = req.body;
  if (typeof data === "string") { try { data = JSON.parse(data); } catch { data = null; } }
  if (!data || typeof data !== "object") return res.status(400).json({ ok: false, error: "Could not read the form." });
  if (String(data.website || "").trim()) return res.status(200).json({ ok: true, id: "ok" }); // honeypot

  const lead = {}, errors = {};
  for (const [k, [req_, max]] of Object.entries(FIELDS)) {
    let v = data[k];
    if (Array.isArray(v)) v = v.join(", ");
    v = String(v ?? "").trim().slice(0, max);
    if (req_ && !v) errors[k] = "Required.";
    lead[k] = v;
  }
  if (lead.email && !EMAIL.test(lead.email)) errors.email = "Enter a valid work email.";
  if (lead.size && !SIZES.has(lead.size)) errors.size = "Pick a size.";
  if (Object.keys(errors).length) return res.status(422).json({ ok: false, error: "Please check the highlighted fields.", fields: errors });

  const s = store();
  if (!s) return res.status(503).json({ ok: false, error: "not configured" });

  const id = Math.random().toString(16).slice(2, 14);
  const rec = { id, received: new Date().toISOString(), page: String(data.page || "/enterprise").slice(0, 100), ...lead };
  try {
    const line = JSON.stringify(rec);
    await redis(s, ["SET", `omo:enterprise:lead:${id}`, line]);
    await redis(s, ["LPUSH", "omo:enterprise:leads", line]);
  } catch (e) {
    console.error("lead save failed", id, String(e));
    return res.status(503).json({ ok: false, error: "not saved" });
  }
  console.log("lead saved", id);
  return res.status(200).json({ ok: true, id });
};
