document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("notify-form");
const input = document.getElementById("email");
const button = document.getElementById("notify-btn");
const label = button.querySelector(".btn-label");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = input.value.trim();
  if (!email || !email.includes("@")) {
    setStatus("error", "Enter a valid email address.");
    return;
  }

  setLoading(true);
  setStatus(null, "");

  try {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    input.value = "";
    setStatus("ok", "Done — we'll email you the moment we launch.");
  } catch (err) {
    setStatus("error", "Couldn't save your email. Please try again.");
  } finally {
    setLoading(false);
  }
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
