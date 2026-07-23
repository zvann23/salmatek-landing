import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Salmatek's own Supabase project (separate from Phelo's). The
// publishable/anon key is safe to ship in client code — RLS on
// landing_signups only allows INSERT for the anon role, nothing else.
const SUPABASE_URL = "https://ggtlnuhdjueqknragrlx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_nXDEhM0y6gd_L1qiSIfGGg_veq3P1zU";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("notify-form");
const input = document.getElementById("email");
const button = document.getElementById("notify-btn");
const label = button.querySelector(".btn-label");
const status = document.getElementById("status");

// Simple client-side format check — the real guard is the UNIQUE
// constraint + NOT NULL on the email column in Postgres.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = input.value.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    setStatus("error", "Enter a valid email address.");
    return;
  }

  setLoading(true);
  setStatus(null, "");

  const { error } = await supabase.from("landing_signups").insert({ email });

  if (error) {
    if (error.code === "23505") {
      setStatus("error", "That email is already on the list.");
    } else {
      console.error("landing_signups insert failed:", error);
      setStatus("error", "Couldn't save your email. Please try again.");
    }
    setLoading(false);
    return;
  }

  input.value = "";
  setStatus("ok", "Done — we'll email you the moment we launch.");
  setLoading(false);
});

function setLoading(isLoading) {
  button.disabled = isLoading;
  button.classList.toggle("loading", isLoading);
  label.textContent = isLoading ? "Sending…" : "Notify me";
}

function setStatus(state, message) {
  status.dataset.state = state || "";
  status.textContent = message;
}
