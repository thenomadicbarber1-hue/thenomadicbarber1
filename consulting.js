/* Consulting page: the sample-session player and the booking inquiry form. */
const hairTypes = `
  <div class="stage-grid four">
    <div><small>Type 1</small><b>1A–1C</b><strong>Straight</strong><p>Often cut with shears; texture lies flat.</p></div>
    <div><small>Type 2</small><b>2A–2C</b><strong>Wavy</strong><p>Needs attention to the natural wave pattern.</p></div>
    <div><small>Type 3</small><b>3A–3C</b><strong>Curly</strong><p>Needs curl-aware cutting and shaping.</p></div>
    <div class="dark"><small>Type 4</small><b>4A–4C</b><strong>Coily</strong><p>Needs textured-hair tools and experience.</p></div>
  </div>
  <p class="stage-note">This is about specialization, not limitation. A barber who excels at one texture may use very different tools and techniques than one who excels at another.</p>`;

const identities = (prompt) => `
  <div class="stage-grid three">
    <div><strong>Corporate</strong><p>Clean, precise and polished. Precision fades, clean tapers, structured cuts.</p></div>
    <div><strong>Leisure</strong><p>Relaxed but well kept. Low-maintenance styles that hold across climates.</p></div>
    <div><strong>Disciplined professional</strong><p>Consistency and structure across every location.</p></div>
  </div>
  <p class="stage-note"><i>${prompt}</i></p>`;

const quizItems = [
  { q: "A shop with 5-star reviews is the right choice for every hair type.", a: "False. A great rating doesn't mean a shop is fluent in every texture. Fit matters more than stars." },
  { q: "The first step in finding a barber is searching online.", a: "False. The first step is Needs Awareness — know the hair type and the look before you search." },
  { q: "A portfolio showing only one style always means the barber lacks skill.", a: "False. It may simply mean they specialize. Match the specialty to the person in the chair." },
];

const quiz = `
  <div class="quiz">
    ${quizItems.map((item, index) => `
      <div class="quiz-item" data-quiz>
        <p><b>${index + 1}.</b> ${item.q}</p>
        <div class="quiz-actions">
          <button type="button" data-answer="true">True</button>
          <button type="button" data-answer="false">False</button>
        </div>
        <p class="quiz-reveal" hidden>${item.a}</p>
      </div>`).join("")}
  </div>`;

const researchRoutine = (activity) => `
  <div class="stage-grid two">
    <div><strong>1. Search smart</strong><p>Ask “Is this shop compatible with my needs?” not just “Is it highly rated?”</p></div>
    <div><strong>2. Study the portfolio</strong><p>Look for variety across 1A–4C, clean detailing and consistent results.</p></div>
    <div><strong>3. Read the cues</strong><p>Layout, clientele and styles on display reveal the shop's focus.</p></div>
    <div><strong>4. Read reviews for patterns</strong><p>Look for mentions of consultation, detail and hair type. One bad review isn't a pattern.</p></div>
  </div>
  <div class="stage-activity">
    <small>Activity · 5 minutes · Portfolio check</small>
    <p>${activity}</p>
    <ul><li>Do I see more than one hair texture?</li><li>Are the lines, fades and detail clean and consistent?</li><li>Are the photos recent?</li><li>What does this shop seem to specialize in?</li></ul>
  </div>`;

const scripts = (lines, photoTip) => `
  <div class="stage-scripts">
    ${lines.map(([label, line]) => `<div><small>${label}</small><blockquote>“${line}”</blockquote></div>`).join("")}
  </div>
  <p class="stage-note">Calm, clear and respectful. Not demanding, not vague. <b>A photo is a universal language</b> — ${photoTip}</p>`;

const redFlags = (split) => `
  <div class="stage-grid flags">
    <div><strong>No portfolio</strong><p>No recent photos of their work.</p></div>
    <div><strong>One-dimensional display</strong><p>Only one style or hair type shown.</p></div>
    <div><strong>Rushed consultation</strong><p>Starts cutting without asking.</p></div>
    <div><strong>Dismissive attitude</strong><p>Brushes off your questions.</p></div>
    <div><strong>Convenience over fit</strong><p>Chosen only because it's closest.</p></div>
  </div>
  <p class="stage-note">Safety: choose shops in active, well-reviewed areas, like business districts and busy shopping areas.</p>
  <div class="stage-split">
    ${split.map(([title, items], index) => `<div class="${index === 0 ? "dark" : ""}"><strong>${title}</strong><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></div>`).join("")}
  </div>`;

const method = [
  ["N", "Needs Awareness", "Know the hair type and style first"],
  ["O", "Online Research", "Read portfolios, not just stars"],
  ["M", "Multicultural Experience", "Favor shops fluent in 1A–4C"],
  ["A", "Ask the Right Questions", "Align calmly before the first cut"],
  ["D", "Discipline & Consistency", "One standard in every city"],
  ["I", "Image Alignment", "Match the cut to the setting"],
  ["C", "Cultural Awareness", "Read the room, keep the standard"],
];

const methodGrid = `<div class="stage-method">${method.map(([letter, name, note]) => `<div><b>${letter}</b><strong>${name}</strong><p>${note}</p></div>`).join("")}</div>`;

const roleplay = (scenarios, pairs) => `
  <div class="stage-split">
    ${scenarios.map(([title, body]) => `<div class="dark"><strong>${title}</strong><p>${body}</p></div>`).join("")}
  </div>
  <p class="stage-note">${pairs}</p>`;

const takeaways = (items) => `<ol class="stage-takeaways">${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;

const tracks = {
  hotel: {
    leaveWith: ["The 1A–4C hair type guide", "A 4-step shop research routine", "Guest conversation scripts", "A red-flag checklist", "The 3-step desk routine"],
    steps: [
      { tag: "Warm-up · 3 min", title: "Think back…", body: `<p class="stage-lede">Has a guest ever asked you where to get a haircut? How did you answer?</p><ul class="stage-list"><li>How did you decide where to send them?</li><li>Did you ever hear back how it went?</li><li>What would help you answer with confidence?</li></ul>` },
      { tag: "Module 1", title: "Every guest has a grooming identity", body: identities("Listen for: “Why are they traveling, and what look do they want to keep?”") + hairTypes },
      { tag: "Knowledge check", title: "True or false?", body: quiz },
      { tag: "Module 2", title: "The 4-step research routine", body: researchRoutine("Pull up a barbershop you already recommend to guests. Using its photos, answer:") },
      { tag: "Module 3", title: "What to say at the desk", body: scripts([["Ask the style", "What kind of cut are you looking for while you're here?"], ["Learn their routine", "Do you have a barber you like at home? What do they usually do for you?"], ["Offer a helpful tip", "Many guests find it helps to show the barber a photo of their usual cut."]], "suggesting a reference photo is an easy tip to share at check-in.") },
      { tag: "Module 4", title: "Red flags & why the guest is traveling", body: redFlags([["Business guest", ["Needs precision before meetings", "Tight schedule: hours matter", "Suggest shops near business districts"]], ["Leisure guest", ["More open to style", "Weddings, events, vacations", "Suggest easy-to-reach, well-reviewed shops"]]]) },
      { tag: "Module 5 · At the desk", title: "The guest conversation", body: `<div class="stage-grid three numbered"><div><b>1</b><strong>Ask</strong><p>“What kind of cut are you looking for? Do you have a barber you like at home?”</p></div><div><b>2</b><strong>Match</strong><p>Use your Local Barber Guide to find shops that fit the style they described.</p></div><div><b>3</b><strong>Recommend</strong><p>Offer two options, with location and hours. Suggest they bring a reference photo.</p></div></div><div class="stage-dodont"><p class="do"><b>Do</b> Ask about the style they want and let them describe it.</p><p class="dont"><b>Don't</b> Guess or comment on a guest's hair type or texture.</p></div>` + methodGrid },
      { tag: "Role play · 7 min", title: "Practice it", body: roleplay([["Scenario 1: The wedding guest", "A guest checks in at 7 p.m. They have a wedding tomorrow afternoon and ask where to get a fresh cut in the morning."], ["Scenario 2: The keynote speaker", "A business guest speaks at 10 a.m. tomorrow and asks for a shop that opens early near the convention center."]], "In pairs: one plays the guest, one walks through the desk routine. Then switch.") },
      { tag: "Key takeaways", title: "Remember these five things", body: takeaways(["Ask about the style the guest wants, never guess.", "Recommend by fit, not just rating or distance.", "Offer two options with hours and location.", "Suggest they bring a reference photo.", "Keep your Local Barber Guide up to date."]) },
    ],
  },
  corporate: {
    leaveWith: ["The 1A–4C hair type guide", "A 4-step research routine", "Consultation scripts", "A red-flag checklist", "A travel grooming checklist"],
    steps: [
      { tag: "Warm-up · 3 min", title: "Think back…", body: `<p class="stage-lede">Have you ever gotten a haircut away from home that didn't come out right?</p><ul class="stage-list"><li>How did you choose that shop?</li><li>What went wrong?</li><li>What would you do differently now?</li></ul>` },
      { tag: "Module 1", title: "Your haircut is part of your brand", body: identities("Ask yourself: “What does my hair need, and what image do I want to keep?”") + hairTypes },
      { tag: "Knowledge check", title: "True or false?", body: quiz },
      { tag: "Module 2", title: "The 4-step research routine", body: researchRoutine("Pull up one barbershop near this location on your phone. Using its photos, answer:") },
      { tag: "Module 3", title: "Say it like this", body: scripts([["Set the context", "I travel often, so I like to keep my haircut consistent. I usually keep a clean, professional look."], ["Check experience", "Before we start, do you have experience working with my hair type and similar styles?"], ["Invite their expertise", "Would you recommend any adjustments based on my hair and face shape?"]], "keep a reference photo on your phone, and take a new one right after a great cut.") },
      { tag: "Module 4", title: "Red flags & matching the trip", body: redFlags([["Business travel", ["Precision and consistency", "Book ahead of key meetings", "Keep your reference style"]], ["Leisure travel", ["More flexibility is fine", "Low-maintenance for climate", "Still intentional, still you"]]]) },
      { tag: "Module 5 · On the road", title: "Your travel grooming checklist", body: `<div class="stage-grid three"><div><strong>Before you fly</strong><ul><li>Time your cut 3–5 days before key meetings</li><li>Save a reference photo</li><li>Research 2 shops near your hotel</li></ul></div><div><strong>When you land</strong><ul><li>Check the portfolio and area</li><li>Book ahead if you can</li><li>Leave time before meetings</li></ul></div><div><strong>In the chair</strong><ul><li>Set context: “I travel often…”</li><li>Show your reference photo</li><li>Confirm before they start</li></ul></div></div>` + methodGrid },
      { tag: "Role play · 7 min", title: "Practice it", body: roleplay([["Scenario 1: The client pitch", "You land at 6 p.m. in a city you've never visited. You have a client pitch at 9 a.m. two days from now."], ["Scenario 2: The new hire abroad", "A new hire is heading to a conference overseas next month. Help them plan their grooming before they go."]], "In pairs: one plays the traveler, one coaches them through the checklist. Then switch.") },
      { tag: "Key takeaways", title: "Remember these five things", body: takeaways(["Know the hair type and image before you search.", "A portfolio tells you more than a rating.", "Consult calmly and bring a reference photo.", "Watch for red flags, and pick safe areas.", "Compatibility beats convenience."]) },
    ],
  },
};

const agenda = document.querySelector("#sessionAgenda");
const stage = document.querySelector("#sessionStage");
const counter = document.querySelector("#sessionCount");
const prevButton = document.querySelector("#sessionPrev");
const nextButton = document.querySelector("#sessionNext");
const leaveWith = document.querySelector("#leaveWith");
const trackButtons = document.querySelectorAll("[data-track]");
let currentTrack = "hotel";
let currentStep = 0;

function renderAgenda() {
  const { steps } = tracks[currentTrack];
  agenda.innerHTML = steps.map((step, index) => `
    <li><button type="button" data-step="${index}"${index === currentStep ? ' aria-current="step"' : ""}>
      <small>${step.tag}</small><span>${step.title}</span>
    </button></li>`).join("");
  leaveWith.innerHTML = tracks[currentTrack].leaveWith.map((item) => `<li>${item}</li>`).join("");
}

function renderStep() {
  const { steps } = tracks[currentTrack];
  const step = steps[currentStep];
  stage.innerHTML = `<p class="stage-tag">${step.tag}</p><h3>${step.title}</h3>${step.body}`;
  counter.textContent = `${currentStep + 1} / ${steps.length}`;
  prevButton.disabled = currentStep === 0;
  nextButton.disabled = currentStep === steps.length - 1;
  agenda.querySelectorAll("button").forEach((button) => {
    if (Number(button.dataset.step) === currentStep) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
}

function goTo(index) {
  currentStep = Math.max(0, Math.min(index, tracks[currentTrack].steps.length - 1));
  renderStep();
}

agenda.addEventListener("click", (event) => {
  const button = event.target.closest("[data-step]");
  if (button) goTo(Number(button.dataset.step));
});
prevButton.addEventListener("click", () => goTo(currentStep - 1));
nextButton.addEventListener("click", () => goTo(currentStep + 1));

trackButtons.forEach((button) => button.addEventListener("click", () => {
  currentTrack = button.dataset.track;
  trackButtons.forEach((other) => {
    const active = other === button;
    other.classList.toggle("active", active);
    other.setAttribute("aria-selected", String(active));
  });
  renderAgenda();
  renderStep();
}));

stage.addEventListener("click", (event) => {
  const answer = event.target.closest("[data-answer]");
  if (!answer) return;
  const item = answer.closest("[data-quiz]");
  const correct = answer.dataset.answer === "false";
  item.querySelectorAll("[data-answer]").forEach((button) => { button.disabled = true; });
  answer.classList.add(correct ? "correct" : "wrong");
  const reveal = item.querySelector(".quiz-reveal");
  reveal.hidden = false;
  reveal.classList.toggle("was-wrong", !correct);
});

renderAgenda();
renderStep();

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) entry.target.classList.add("visible");
}), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const inquiryForm = document.querySelector("#consultInquiry");
const inquiryMessage = document.querySelector("#inquiryMessage");

// Pricing stays closed until a client chooses to book, then it opens
// directly above the inquiry form.
const priceGate = document.querySelector("#priceGate");
const pricePanel = document.querySelector("#pricePanel");
const priceLocked = document.querySelector("#priceLocked");

function openPricing() {
  if (!pricePanel.hidden) return;
  pricePanel.hidden = false;
  priceLocked.hidden = true;
  document.querySelectorAll("[data-price-only]").forEach((element) => { element.hidden = false; });
  priceGate.setAttribute("aria-expanded", "true");
  priceGate.innerHTML = "Continue to booking <span>↓</span>";
  sessionStorage.setItem("consultPricing", "open");
}

priceGate.addEventListener("click", () => {
  if (pricePanel.hidden) {
    openPricing();
    pricePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    document.querySelector("#book").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
document.querySelectorAll("[data-open-pricing]").forEach((link) => link.addEventListener("click", openPricing));
pricePanel.querySelectorAll('a[href="#book"]').forEach((link) => link.addEventListener("click", () => {
  const pilot = inquiryForm.querySelector('[name="pilotOffer"]');
  if (pilot) pilot.checked = true;
}));
inquiryForm.program?.addEventListener("change", openPricing);
if (sessionStorage.getItem("consultPricing") === "open" || ["#pricing", "#book"].includes(location.hash)) openPricing();

inquiryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = inquiryForm.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Sending…";
  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(inquiryForm)).toString(),
    });
    if (!response.ok) throw new Error("Your inquiry could not be sent. Please email thenomadicbarber1@gmail.com instead.");
    inquiryMessage.style.color = "#7fc4a3";
    inquiryMessage.textContent = "Thank you — your inquiry is in. DeWayne will reply with dates and a quote within 2 business days.";
    inquiryForm.reset();
  } catch (error) {
    inquiryMessage.style.color = "#e0775f";
    inquiryMessage.textContent = error.message;
  } finally {
    button.disabled = false;
    button.innerHTML = "Send my inquiry <span>→</span>";
  }
});

