/* The consultant program: two tracks over one five-module spine, a session
   console that keeps its place, and the timed activities the facilitator runs. */

/* ---- Content shared by both tracks ---------------------------------------- */

const hairTypes = [
  { type: "Type 1", range: "1A–1C", name: "Straight", note: "Often cut with shears; texture lies flat.", path: "M2 21 C20 16 42 26 74 20" },
  { type: "Type 2", range: "2A–2C", name: "Wavy", note: "Needs attention to the natural wave pattern.", path: "M2 21 C10 3 20 39 29 21 S47 3 56 21 S66 38 74 21" },
  { type: "Type 3", range: "3A–3C", name: "Curly", note: "Needs curl-aware cutting and shaping.", path: "M2 30 C-1 4 18 1 18 21 C18 41 36 41 36 20 C36 1 55 1 55 21 C55 41 73 38 73 13" },
  { type: "Type 4", range: "4A–4C", name: "Coily", note: "Needs textured-hair tools and experience.", path: "M2 32 C-2 12 9 6 9 21 C9 36 19 36 19 20 C19 5 29 5 29 21 C29 37 39 37 39 20 C39 4 49 4 49 21 C49 38 59 38 59 20 C59 4 72 7 72 31" },
];

const identities = [
  { name: "Corporate", note: "Clean, precise and polished. Precision fades, clean tapers, structured cuts." },
  { name: "Leisure", note: "Relaxed but well kept. Low-maintenance styles that hold across climates." },
  { name: "Disciplined professional", note: "Consistency and structure across every location." },
];

// Every statement in the deck's knowledge check is false, and the explanation is
// the point of the module it sits in — so the answer is shown with its reason.
const knowledgeCheck = [
  { statement: "A shop with 5-star reviews is the right choice for every hair type.", answer: false, explain: "Ratings measure satisfaction, not range. Ask whether the shop is compatible with your needs, not only whether it is highly rated." },
  { statement: "The first step in finding a barber is searching online.", answer: false, explain: "Before research comes self-awareness. Know your hair type and the image you want to keep, then start searching." },
  { statement: "A portfolio showing only one style always means the barber lacks skill.", answer: false, explain: "It usually means specialization, not limitation. The real question is whether their specialty matches your hair." },
];

const researchSteps = [
  { title: "Search smart", note: "Ask “Is this shop compatible with my needs?” not just “Is it highly rated?”" },
  { title: "Study the portfolio", note: "Look for variety across 1A–4C, clean detailing, and consistent results." },
  { title: "Read the cues", note: "Layout, clientele and styles on display reveal the shop’s focus." },
  { title: "Read reviews for patterns", note: "Look for mentions of consultation, detail and hair type. One bad review isn’t a pattern." },
];

const portfolioChecks = [
  "Do I see more than one hair texture?",
  "Are the lines, fades and detail clean and consistent?",
  "Are the photos recent?",
  "What does this shop seem to specialize in?",
];

const redFlags = [
  { flag: "No portfolio", note: "No recent photos of their work." },
  { flag: "One-dimensional display", note: "Only one style or hair type shown." },
  { flag: "Rushed consultation", note: "Starts cutting without asking." },
  { flag: "Dismissive attitude", note: "Brushes off your questions." },
  { flag: "Convenience over fit", note: "Chosen only because it’s closest." },
];

const photoBullets = [
  "Shows your usual cut faster than words",
  "Works across language barriers",
  "Solves haircut names that differ by region",
];

const nomadicMethod = [
  { letter: "N", title: "Needs Awareness", note: "Know the hair type and style first." },
  { letter: "O", title: "Online Research", note: "Read portfolios, not just stars." },
  { letter: "M", title: "Multicultural Experience", note: "Favor shops fluent in 1A–4C." },
  { letter: "A", title: "Ask the Right Questions", note: "Align calmly before the first cut." },
  { letter: "D", title: "Discipline & Consistency", note: "One standard in every city." },
  { letter: "I", title: "Image Alignment", note: "Match the cut to the setting." },
  { letter: "C", title: "Cultural Awareness", note: "Read the room, keep the standard." },
];

/* ---- What changes between the two rooms ----------------------------------- */

const trackContent = {
  corporate: {
    eyebrow: "Corporate &amp; HR training",
    lede: "Executive presence in every city, for every hair type. A working session that turns grooming from a travel-day gamble into a method your team can repeat anywhere.",
    summary: "Built for HR, mobility and travel-heavy teams whose people land in a new city and still need to look like themselves.",
    leaveWith: ["The 1A–4C hair type guide", "A 4-step research routine", "Consultation scripts", "A red-flag checklist", "A travel grooming checklist"],
    fifthModule: "On the Road",
    fifthTagline: "Turning the method into habits.",
    warmupTitle: "Think back…",
    warmupPrompt: "Have you ever gotten a haircut away from home that didn’t come out right?",
    warmupQuestions: ["How did you choose that shop?", "What went wrong?", "What would you do differently now?"],
    identityTitle: "Your haircut is part of your brand",
    identityClose: "Ask yourself: “What does my hair need, and what image do I want to keep?”",
    activityPrompt: "Pull up one barbershop near this location on your phone. Using its photos, answer:",
    scriptsTitle: "Say it like this",
    scripts: [
      { label: "Set the context", line: "I travel often, so I like to keep my haircut consistent. I usually keep a clean, professional look." },
      { label: "Check experience", line: "Before we start, do you have experience working with my hair type and similar styles?" },
      { label: "Invite their expertise", line: "Would you recommend any adjustments based on my hair and face shape?" },
    ],
    photoTitle: "Keep a reference photo on your phone",
    photoExtra: "Take a new one right after a great cut",
    matchTitle: "Match the strategy to the trip",
    matchColumns: [
      { title: "Business travel", items: ["Precision and consistency", "Book ahead of key meetings", "Keep your reference style"] },
      { title: "Leisure travel", items: ["More flexibility is fine", "Low-maintenance for climate", "Still intentional, still you"] },
    ],
    fifthTitle: "Your travel grooming checklist",
    fifthColumns: [
      { title: "Before you fly", items: ["Time your cut 3–5 days before key meetings", "Save a reference photo", "Research 2 shops near your hotel"] },
      { title: "When you land", items: ["Check the portfolio and the area", "Book ahead if you can", "Leave time before meetings"] },
      { title: "In the chair", items: ["Set context: “I travel often…”", "Show your reference photo", "Confirm before they start"] },
    ],
    practiceNote: "In pairs: one plays the traveller, one coaches them through the checklist. Then switch.",
    scenarios: [
      { name: "The client pitch", note: "You land at 6 p.m. in a city you’ve never visited. You have a client pitch at 9 a.m. two days from now." },
      { name: "The new hire abroad", note: "A new hire is heading to a conference overseas next month. Help them plan their grooming before they go." },
    ],
    takeaways: [
      "Know the hair type and image before you search.",
      "A portfolio tells you more than a rating.",
      "Consult calmly and bring a reference photo.",
      "Watch for red flags, and pick safe areas.",
      "Compatibility beats convenience.",
    ],
  },
  hotel: {
    eyebrow: "Concierge training",
    lede: "Helping every guest find the right barber, for every hair type. A working session that turns “where can I get a haircut?” into an answer your desk gives with confidence.",
    summary: "Built for front desk, concierge and guest services teams who field grooming questions every week and want a routine behind the answer.",
    leaveWith: ["The 1A–4C hair type guide", "A 4-step shop research routine", "Guest conversation scripts", "A red-flag checklist", "The 3-step desk routine"],
    fifthModule: "At the Guest Desk",
    fifthTagline: "Turning the method into service.",
    warmupTitle: "Think back…",
    warmupPrompt: "Has a guest ever asked you where to get a haircut? How did you answer?",
    warmupQuestions: ["How did you decide where to send them?", "Did you ever hear back how it went?", "What would help you answer with confidence?"],
    identityTitle: "Every guest has a grooming identity",
    identityClose: "Listen for: “Why are they traveling, and what look do they want to keep?”",
    activityPrompt: "Pull up a barbershop you already recommend to guests. Using its photos, answer:",
    scriptsTitle: "What to say at the desk",
    scripts: [
      { label: "Ask the style", line: "What kind of cut are you looking for while you’re here?" },
      { label: "Learn their routine", line: "Do you have a barber you like at home? What do they usually do for you?" },
      { label: "Offer a helpful tip", line: "Many guests find it helps to show the barber a photo of their usual cut." },
    ],
    photoTitle: "Suggest guests bring a reference photo",
    photoExtra: "An easy tip to share at check-in",
    matchTitle: "Why is the guest traveling?",
    matchColumns: [
      { title: "Business guest", items: ["Needs precision before meetings", "Tight schedule: hours matter", "Suggest shops near business districts"] },
      { title: "Leisure guest", items: ["More open to style", "Weddings, events, vacations", "Suggest easy-to-reach, well-reviewed shops"] },
    ],
    fifthTitle: "The guest conversation",
    fifthColumns: [
      { title: "Ask", items: ["“What kind of cut are you looking for? Do you have a barber you like at home?”"] },
      { title: "Match", items: ["Use your Local Barber Guide to find shops that fit the style they described."] },
      { title: "Recommend", items: ["Offer two options, with location and hours.", "Suggest they bring a reference photo."] },
    ],
    deskRules: {
      do: "Ask about the style they want and let them describe it.",
      dont: "Guess or comment on a guest’s hair type or texture.",
    },
    practiceNote: "In pairs: one plays the guest, one walks through the desk routine. Then switch.",
    scenarios: [
      { name: "The wedding guest", note: "A guest checks in at 7 p.m. They have a wedding tomorrow afternoon and ask where to get a fresh cut in the morning." },
      { name: "The keynote speaker", note: "A business guest speaks at 10 a.m. tomorrow and asks for a shop that opens early near the convention center." },
    ],
    takeaways: [
      "Ask about the style the guest wants, never guess.",
      "Recommend by fit, not just rating or distance.",
      "Offer two options with hours and location.",
      "Suggest they bring a reference photo.",
      "Keep your Local Barber Guide up to date.",
    ],
  },
};

const moduleSpine = [
  { id: "identity", title: "Grooming Identity & Hair Types", tagline: "Before research comes self-awareness." },
  { id: "research", title: "Researching Shops Anywhere", tagline: "Strategy over speed." },
  { id: "questions", title: "Asking the Right Questions", tagline: "The consultation is a collaboration, not a command." },
  { id: "flags", title: "Red Flags & Safety", tagline: "Calm observation, not judgment." },
  { id: "field", title: "", tagline: "" },
];

/* ---- Module bodies -------------------------------------------------------- */

function columnBlock(columns) {
  return `<div class="column-set" data-columns="${columns.length}">${columns.map((column, index) => `
    <div class="column-card">
      <b>${String(index + 1).padStart(2, "0")}</b>
      <h4>${column.title}</h4>
      <ul>${column.items.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>`).join("")}</div>`;
}

function moduleBody(id, track) {
  if (id === "identity") {
    return `
      <h3>${track.identityTitle}</h3>
      <div class="identity-set">${identities.map((identity) => `
        <article class="identity-card"><b>${identity.name}</b><p>${identity.note}</p></article>`).join("")}</div>
      <p class="module-close">${track.identityClose}</p>
      <h3 class="module-subhead">Hair types 1A–4C, made simple</h3>
      <div class="type-board">
        <div class="type-row" id="typeRow" role="tablist" aria-label="Hair type families">${hairTypes.map((entry, index) => `
          <button class="type-tile${index === 0 ? " active" : ""}" type="button" role="tab" data-type="${index}" aria-selected="${index === 0}">
            <span class="type-strand" aria-hidden="true"><svg viewBox="0 0 76 42"><path d="${entry.path}"/></svg></span>
            <b>${entry.range}</b><small>${entry.name}</small>
          </button>`).join("")}</div>
        <div class="type-detail" id="typeDetail" aria-live="polite"></div>
      </div>
      <p class="module-note">This is about specialization, not limitation. A barber who excels at one texture may use very different tools and techniques than one who excels at another.</p>
      <div class="quiz" id="quiz">
        <div class="quiz-head">
          <p class="block-label">Knowledge check · True or false?</p>
          <span class="quiz-score" id="quizScore">0 of 3 answered</span>
        </div>
        ${knowledgeCheck.map((item, index) => `
          <article class="quiz-item" data-quiz="${index}">
            <p class="quiz-statement"><i>${index + 1}</i>${item.statement}</p>
            <div class="quiz-actions">
              <button class="quiz-button" type="button" data-answer="true">True</button>
              <button class="quiz-button" type="button" data-answer="false">False</button>
            </div>
            <p class="quiz-explain" hidden><b>False.</b> ${item.explain}</p>
          </article>`).join("")}
      </div>`;
  }

  if (id === "research") {
    return `
      <h3>The 4-step research routine</h3>
      <ol class="research-list">${researchSteps.map((step) => `
        <li><b>${step.title}</b><span>${step.note}</span></li>`).join("")}</ol>
      <div class="activity">
        <div class="activity-head">
          <div>
            <p class="block-label">Activity · 5 minutes</p>
            <h4>Portfolio check</h4>
          </div>
          <div class="timer timer-light" data-timer="300">
            <span class="timer-readout">05:00</span>
            <button class="timer-button" type="button" data-timer-toggle>Start <span aria-hidden="true">▷</span></button>
            <button class="timer-reset" type="button" data-timer-reset aria-label="Reset the activity timer">↺</button>
          </div>
        </div>
        <p>${track.activityPrompt}</p>
        <ul class="check-list" data-checklist>${portfolioChecks.map((check, index) => `
          <li><label><input type="checkbox" id="portfolio-${index}"><span>${check}</span></label></li>`).join("")}</ul>
      </div>`;
  }

  if (id === "questions") {
    return `
      <h3>${track.scriptsTitle}</h3>
      <div class="script-set">${track.scripts.map((script) => `
        <article class="script-card">
          <p class="block-label">${script.label}</p>
          <blockquote>${script.line}</blockquote>
          <button class="copy-button" type="button" data-copy="${script.line.replace(/"/g, "&quot;")}">Copy line <span aria-hidden="true">⧉</span></button>
        </article>`).join("")}</div>
      <p class="module-close">Calm, clear and respectful. Not demanding, not vague.</p>
      <div class="photo-panel">
        <div class="photo-panel-copy">
          <p class="block-label">A photo is a universal language</p>
          <h4>${track.photoTitle}</h4>
          <ul>${[...photoBullets, track.photoExtra].map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
        <div class="photo-frame" aria-hidden="true"><span>REF</span><i></i></div>
      </div>`;
  }

  if (id === "flags") {
    return `
      <h3>Five red flags to watch for</h3>
      <ul class="flag-list check-list" data-checklist>${redFlags.map((item, index) => `
        <li><label><input type="checkbox" id="flag-${index}"><span><b>${item.flag}</b>${item.note}</span></label></li>`).join("")}</ul>
      <p class="safety-note"><b>Safety</b> Choose shops in active, well-reviewed areas, like business districts and busy shopping areas.</p>
      <h3 class="module-subhead">${track.matchTitle}</h3>
      ${columnBlock(track.matchColumns)}
      <p class="module-close">Structured when necessary. Flexible when appropriate. Consistent in identity.</p>`;
  }

  const deskRules = track.deskRules
    ? `<div class="rule-set">
        <div class="rule do"><b>Do</b><span>${track.deskRules.do}</span></div>
        <div class="rule dont"><b>Don’t</b><span>${track.deskRules.dont}</span></div>
      </div>`
    : "";
  return `
    <h3>${track.fifthTitle}</h3>
    ${columnBlock(track.fifthColumns)}
    ${deskRules}
    <p class="module-close">The seven letters of the N.O.M.A.D.I.C. Method™ are what carries all of this home — <a href="#method">walk through them below</a>.</p>`;
}

/* ---- Rendering ------------------------------------------------------------ */

const storageKeys = { track: "nb-consulting-track", progress: "nb-consulting-progress" };
const ringCircumference = 2 * Math.PI * 54;

let activeTrack = "corporate";
let completed = new Set();

function readStored(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Private browsing refuses writes; the session still runs, it just forgets. */
  }
}

const moduleStack = document.querySelector("#moduleStack");
const consolePips = document.querySelector("#consolePips");
const ringValue = document.querySelector("#ringValue");
const ringPercent = document.querySelector("#ringPercent");
const ringCount = document.querySelector("#ringCount");
const consoleState = document.querySelector("#consoleState");
const consoleNote = document.querySelector("#consoleNote");

function moduleTitle(index, track) {
  return index === 4 ? track.fifthModule : moduleSpine[index].title;
}

function moduleTagline(index, track) {
  return index === 4 ? track.fifthTagline : moduleSpine[index].tagline;
}

function renderTrack(name) {
  const track = trackContent[name];
  activeTrack = name;
  writeStored(storageKeys.track, name);
  document.body.dataset.track = name;

  document.querySelectorAll("[data-track-field]").forEach((element) => {
    const key = element.dataset.trackField;
    if (key === "eyebrow") element.innerHTML = track.eyebrow;
    else if (key === "lede") element.textContent = track.lede;
    else if (key === "summary") element.textContent = track.summary;
    else if (key === "warmupTitle") element.textContent = track.warmupTitle;
    else if (key === "warmupPrompt") element.textContent = track.warmupPrompt;
    else if (key === "practiceNote") element.textContent = track.practiceNote;
  });

  document.querySelectorAll(".track-button").forEach((button) => {
    const isActive = button.dataset.track === name;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  const trackField = document.querySelector("#trackField");
  if (trackField) trackField.value = name;

  document.querySelector("#leaveWith").innerHTML = track.leaveWith.map((item) => `<li>${item}</li>`).join("");
  document.querySelector("#warmupQuestions").innerHTML = track.warmupQuestions.map((item) => `<li>${item}</li>`).join("");
  document.querySelector("#roadmapTrack").innerHTML = moduleSpine.map((_, index) => `
    <li class="roadmap-step reveal">
      <b>${index + 1}</b>
      <div><h3>${moduleTitle(index, track)}</h3><p>${moduleTagline(index, track)}</p></div>
      <a href="#module-${moduleSpine[index].id}" aria-label="Open module ${index + 1}">Open <span aria-hidden="true">↓</span></a>
    </li>`).join("");
  document.querySelector("#scenarioGrid").innerHTML = track.scenarios.map((scenario, index) => `
    <article class="scenario-card reveal delay-${index}">
      <p class="block-label">Scenario ${index + 1}</p>
      <h3>${scenario.name}</h3>
      <p>${scenario.note}</p>
    </article>`).join("");
  document.querySelector("#takeawayList").innerHTML = track.takeaways.map((item, index) => `
    <li class="reveal"><b>${index + 1}</b><span>${item}</span></li>`).join("");

  moduleStack.innerHTML = moduleSpine.map((module, index) => `
    <article class="module-card reveal" id="module-${module.id}" data-module="${module.id}">
      <div class="module-head">
        <span class="module-number">Module ${index + 1}</span>
        <h3>${moduleTitle(index, track)}</h3>
        <p>${moduleTagline(index, track)}</p>
        <div class="module-controls">
          <button class="module-toggle" type="button" data-module-toggle aria-expanded="false" aria-controls="body-${module.id}">
            <span class="toggle-label">Open module</span> <i aria-hidden="true"></i>
          </button>
          <button class="module-done" type="button" data-module-done aria-pressed="false">Mark complete</button>
        </div>
      </div>
      <div class="module-body" id="body-${module.id}" hidden>${moduleBody(module.id, track)}</div>
    </article>`).join("");

  bindModules();
  syncProgress();
  observeReveals();
}

/* ---- Session console ------------------------------------------------------ */

function syncProgress() {
  const done = moduleSpine.filter((module) => completed.has(module.id)).length;
  const share = done / moduleSpine.length;
  ringValue.style.strokeDasharray = String(ringCircumference);
  ringValue.style.strokeDashoffset = String(ringCircumference * (1 - share));
  ringPercent.innerHTML = `${Math.round(share * 100)}<i>%</i>`;
  ringCount.textContent = `${done} of ${moduleSpine.length}`;

  consolePips.innerHTML = moduleSpine.map((module, index) => `
    <li class="${completed.has(module.id) ? "lit" : ""}">
      <a href="#module-${module.id}"><b>${index + 1}</b><span>${completed.has(module.id) ? "Done" : "Open"}</span></a>
    </li>`).join("");

  if (done === moduleSpine.length) {
    consoleState.textContent = "Complete";
    consoleNote.textContent = "All five modules run. The role play and the takeaways close the session out.";
  } else if (done > 0) {
    consoleState.textContent = "In session";
    consoleNote.textContent = `${moduleSpine.length - done} module${moduleSpine.length - done === 1 ? "" : "s"} left. Your place is kept on this device.`;
  } else {
    consoleState.textContent = "Ready";
    consoleNote.textContent = "Work through the modules below — the console keeps your place on this device.";
  }

  document.querySelectorAll("[data-module-done]").forEach((button) => {
    const id = button.closest(".module-card").dataset.module;
    const isDone = completed.has(id);
    button.classList.toggle("is-done", isDone);
    button.setAttribute("aria-pressed", String(isDone));
    button.textContent = isDone ? "Completed" : "Mark complete";
    button.closest(".module-card").classList.toggle("is-done", isDone);
  });

  writeStored(storageKeys.progress, [...completed].join(","));
}

/* ---- Module interactions -------------------------------------------------- */

function openModule(card, open) {
  const body = card.querySelector(".module-body");
  const toggle = card.querySelector("[data-module-toggle]");
  body.hidden = !open;
  card.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector(".toggle-label").textContent = open ? "Close module" : "Open module";
  if (open) requestAnimationFrame(() => body.classList.add("shown"));
  else body.classList.remove("shown");
}

function bindModules() {
  moduleStack.querySelectorAll("[data-module-toggle]").forEach((button) => button.addEventListener("click", () => {
    const card = button.closest(".module-card");
    openModule(card, card.querySelector(".module-body").hidden);
  }));

  moduleStack.querySelectorAll("[data-module-done]").forEach((button) => button.addEventListener("click", () => {
    const id = button.closest(".module-card").dataset.module;
    if (completed.has(id)) completed.delete(id);
    else completed.add(id);
    syncProgress();
  }));

  bindTypeBoard();
  bindQuiz();
  bindChecklists();
  bindCopyButtons();
  bindTimers(moduleStack);
}

function bindTypeBoard() {
  const row = moduleStack.querySelector("#typeRow");
  const detail = moduleStack.querySelector("#typeDetail");
  if (!row || !detail) return;
  const show = (index) => {
    const entry = hairTypes[index];
    detail.innerHTML = `<b>${entry.type} · ${entry.range}</b><h5>${entry.name}</h5><p>${entry.note}</p>`;
    row.querySelectorAll(".type-tile").forEach((tile) => {
      const isActive = Number(tile.dataset.type) === index;
      tile.classList.toggle("active", isActive);
      tile.setAttribute("aria-selected", String(isActive));
    });
  };
  row.querySelectorAll(".type-tile").forEach((tile) => tile.addEventListener("click", () => show(Number(tile.dataset.type))));
  show(0);
}

function bindQuiz() {
  const quiz = moduleStack.querySelector("#quiz");
  if (!quiz) return;
  const score = quiz.querySelector("#quizScore");
  const answered = new Set();
  quiz.querySelectorAll(".quiz-item").forEach((item) => {
    const index = Number(item.dataset.quiz);
    item.querySelectorAll(".quiz-button").forEach((button) => button.addEventListener("click", () => {
      const chose = button.dataset.answer === "true";
      const correct = chose === knowledgeCheck[index].answer;
      item.querySelectorAll(".quiz-button").forEach((other) => {
        other.classList.toggle("chosen", other === button);
        other.classList.toggle("is-correct", other.dataset.answer === String(knowledgeCheck[index].answer));
      });
      item.classList.toggle("answered-right", correct);
      item.classList.toggle("answered-wrong", !correct);
      item.querySelector(".quiz-explain").hidden = false;
      answered.add(index);
      score.textContent = `${answered.size} of ${knowledgeCheck.length} answered`;
    }));
  });
}

function bindChecklists() {
  moduleStack.querySelectorAll("[data-checklist]").forEach((list) => {
    const boxes = [...list.querySelectorAll("input[type=checkbox]")];
    boxes.forEach((box) => box.addEventListener("change", () => {
      box.closest("li").classList.toggle("ticked", box.checked);
      list.classList.toggle("all-ticked", boxes.every((entry) => entry.checked));
    }));
  });
}

function bindCopyButtons() {
  moduleStack.querySelectorAll("[data-copy]").forEach((button) => button.addEventListener("click", async () => {
    const original = button.innerHTML;
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.innerHTML = "Copied <span aria-hidden=\"true\">✓</span>";
    } catch {
      button.innerHTML = "Press ⌘/Ctrl+C <span aria-hidden=\"true\">⧉</span>";
    }
    window.setTimeout(() => { button.innerHTML = original; }, 2200);
  }));
}

/* ---- Facilitator timers --------------------------------------------------- */

function clockFace(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function bindTimers(root) {
  root.querySelectorAll("[data-timer]").forEach((timer) => {
    if (timer.dataset.bound === "true") return;
    timer.dataset.bound = "true";
    const total = Number(timer.dataset.timer);
    const readout = timer.querySelector(".timer-readout");
    const toggle = timer.querySelector("[data-timer-toggle]");
    const reset = timer.querySelector("[data-timer-reset]");
    let remaining = total;
    let ticker = null;

    const paint = () => { readout.textContent = remaining === 0 ? "Time" : clockFace(remaining); };
    const stop = () => {
      window.clearInterval(ticker);
      ticker = null;
      toggle.innerHTML = "Start <span aria-hidden=\"true\">▷</span>";
      timer.classList.remove("running");
    };

    toggle.addEventListener("click", () => {
      if (ticker) { stop(); return; }
      if (remaining === 0) remaining = total;
      timer.classList.remove("done");
      timer.classList.add("running");
      toggle.innerHTML = "Pause <span aria-hidden=\"true\">❙❙</span>";
      ticker = window.setInterval(() => {
        remaining -= 1;
        paint();
        if (remaining <= 0) {
          remaining = 0;
          stop();
          timer.classList.add("done");
        }
      }, 1000);
    });

    reset.addEventListener("click", () => {
      stop();
      remaining = total;
      timer.classList.remove("done");
      paint();
    });

    paint();
  });
}

/* ---- The method board ----------------------------------------------------- */

function renderMethod() {
  const letters = document.querySelector("#methodLetters");
  const detail = document.querySelector("#methodDetail");
  letters.innerHTML = nomadicMethod.map((entry, index) => `
    <button class="method-letter${index === 0 ? " active" : ""}" type="button" role="tab" data-letter="${index}" aria-selected="${index === 0}">
      <b>${entry.letter}</b><small>${entry.title.split(" ")[0]}</small>
    </button>`).join("");
  const show = (index) => {
    const entry = nomadicMethod[index];
    detail.innerHTML = `<span class="method-mark" aria-hidden="true">${entry.letter}</span><div><b>${entry.title}</b><p>${entry.note}</p></div>`;
    letters.querySelectorAll(".method-letter").forEach((button) => {
      const isActive = Number(button.dataset.letter) === index;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
  };
  letters.querySelectorAll(".method-letter").forEach((button) => button.addEventListener("click", () => show(Number(button.dataset.letter))));
  show(0);
}

/* ---- Scroll reveals ------------------------------------------------------- */

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  }
}), { threshold: 0.12 });

function observeReveals() {
  document.querySelectorAll(".reveal:not(.visible)").forEach((element) => revealObserver.observe(element));
}

/* ---- Background music, shared with the rest of the collection -------------- */

const globalTrack = document.querySelector("#globalTrack");
const globalSound = document.querySelector("#globalSound");
if (globalTrack && globalSound) {
  globalTrack.volume = 0.45;
  const soundLabel = globalSound.querySelector(".sound-label");
  const syncGlobalSound = () => {
    const playing = !globalTrack.paused;
    globalSound.classList.toggle("playing", playing);
    globalSound.setAttribute("aria-pressed", String(playing));
    globalSound.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
    soundLabel.textContent = playing ? "Music on" : "Music off";
  };
  globalSound.addEventListener("click", () => {
    if (globalTrack.paused) globalTrack.play().catch(() => {});
    else globalTrack.pause();
  });
  globalTrack.addEventListener("play", syncGlobalSound);
  globalTrack.addEventListener("pause", syncGlobalSound);
}

/* ---- The booking form ----------------------------------------------------- */

document.querySelector("#trainingForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.querySelector("#trainingMessage");
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Sending…";
  message.classList.remove("is-good", "is-bad");
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch("/api/training-inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "We couldn't send that request. Try again in a moment.");
    message.classList.add("is-good");
    message.textContent = data.message;
    form.reset();
    document.querySelector("#trackField").value = activeTrack;
  } catch (error) {
    message.classList.add("is-bad");
    message.textContent = error.message;
  } finally {
    button.disabled = false;
    button.innerHTML = "Request this session <span>→</span>";
  }
});

/* ---- Boot ----------------------------------------------------------------- */

document.querySelectorAll(".track-button").forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.track === activeTrack) return;
  renderTrack(button.dataset.track);
}));

document.querySelector("#resetProgress").addEventListener("click", () => {
  completed = new Set();
  syncProgress();
});

document.querySelector("#startSession").addEventListener("click", () => {
  const first = moduleStack.querySelector(".module-card");
  if (!first) return;
  openModule(first, true);
  first.scrollIntoView({ behavior: "smooth", block: "start" });
});

const storedProgress = readStored(storageKeys.progress, "");
completed = new Set(storedProgress.split(",").filter((id) => moduleSpine.some((module) => module.id === id)));
const storedTrack = readStored(storageKeys.track, "corporate");
renderTrack(trackContent[storedTrack] ? storedTrack : "corporate");
renderMethod();
bindTimers(document);

// The opening choreography runs once the content is in place, so the staggered
// entrance animates real panels rather than empty ones.
requestAnimationFrame(() => document.body.classList.add("is-ready"));
