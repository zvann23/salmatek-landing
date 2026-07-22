import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email = (req.body?.email || "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const { error } = await supabase
    .from("landing_signups")
    .insert({ email, source: "salmatek" });

  if (error) {
    if (error.code === "23505") {
      return res.status(200).json({ ok: true, already: true });
    }
    console.error("landing_signups insert failed:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(200).json({ ok: true });
}
