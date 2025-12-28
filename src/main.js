const ideaBox = document.querySelector("#idea-box");
const generateBtn = document.querySelector("#generate-btn");
const copyBtn = document.querySelector("#copy-btn");
const statusEl = document.querySelector("#status");
const favoritesList = document.querySelector("#favorites-list");
const clearBtn = document.querySelector("#clear-btn");
const saveBtn = document.querySelector("#save-btn");

const audiences = [
  "HOA managers",
  "small gyms",
  "dentist offices",
  "property managers",
  "restaurants",
  "wedding photographers",
  "real estate agents",
  "ecommerce brands",
  "manufactured housing communities",
  "local contractors",
];

const problems = [
  "reduce no-shows",
  "increase referrals",
  "track leads",
  "collect payments",
  "respond faster to inquiries",
  "standardize onboarding",
  "improve review ratings",
  "simplify scheduling",
  "cut admin time",
  "reduce churn",
];

const formats = [
  "a simple calculator",
  "a checklist generator",
  "a one-page dashboard",
  "a lightweight CRM",
  "an email template builder",
  "a weekly audit tool",
  "a quote generator",
  "a mini analytics widget",
  "a client onboarding portal",
  "a pricing estimator",
];

const monetization = [
  "free tool → email capture",
  "$9/mo subscription",
  "$29 one-time purchase",
  "$49/mo pro tier",
  "paid templates pack ($19)",
  "done-for-you upsell",
  "affiliate partnerships",
  "lead-gen for service providers",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIdea() {
  const a = pick(audiences);
  const p = pick(problems);
  const f = pick(formats);
  const m = pick(monetization);

  return `Build ${f} for ${a} to help them ${p}. Monetize via: ${m}.`;
}

function setIdea(text) {
  ideaBox.textContent = text;
}

// --- Status + Copy ---
let statusTimer;

function setStatus(msg) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    statusEl.textContent = "";
  }, 1200);
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.top = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

async function copyIdea() {
  const text = ideaBox.textContent?.trim() || "";
  if (!text) {
    setStatus("Nothing to copy.");
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      setStatus("Copied ✅");
      return;
    }
  } catch (err) {
    console.error("Clipboard API failed:", err);
  }

  const ok = fallbackCopy(text);
  setStatus(ok ? "Copied ✅" : "Copy failed.");
}
const STORAGE_KEY = "idea_forge_favorites_v1";

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderFavorites() {
  const items = loadFavorites();

  favoritesList.innerHTML = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "favorite empty";
    li.textContent = "No favorites yet. Generate an idea and click Save.";
    favoritesList.appendChild(li);
    return;
  }

  items.forEach((text, idx) => {
    const li = document.createElement("li");
    li.className = "favorite";

    const p = document.createElement("p");
    p.textContent = text;

    const actions = document.createElement("div");
    actions.className = "favorite-actions";

    const copy = document.createElement("button");
    copy.className = "secondary small";
    copy.textContent = "Copy";
    copy.addEventListener("click", async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          setStatus("Copied ✅");
          return;
        }
      } catch {}
      fallbackCopy(text);
      setStatus("Copied ✅");
    });

    const remove = document.createElement("button");
    remove.className = "secondary small";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      const next = loadFavorites().filter((_, i) => i !== idx);
      saveFavorites(next);
      renderFavorites();
      setStatus("Removed");
    });

    actions.appendChild(copy);
    actions.appendChild(remove);

    li.appendChild(p);
    li.appendChild(actions);

    favoritesList.appendChild(li);
  });
}

function addFavorite(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return;

  const items = loadFavorites();
  if (items.includes(trimmed)) {
    setStatus("Already saved");
    return;
  }

  items.unshift(trimmed);
  saveFavorites(items.slice(0, 25));
  renderFavorites();
  setStatus("Saved ⭐️");
}
// --- Events ---
generateBtn.addEventListener("click", () => {
  setIdea(generateIdea());
});

copyBtn.addEventListener("click", () => {
  copyIdea();
});

// Generate one immediately on load
setIdea(generateIdea());
renderFavorites();

saveBtn.addEventListener("click", () => addFavorite(ideaBox.textContent));
clearBtn.addEventListener("click", () => {
  saveFavorites([]);
  renderFavorites();
  setStatus("Cleared");
});
