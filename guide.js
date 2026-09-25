const textureData = [
  { code: "1A", family: "Straight", name: "Fine straight", note: "Very little bend; can show oil quickly. Precision and lightweight products matter.", path: "M2 21 C25 21 50 21 74 21" },
  { code: "1B", family: "Straight", name: "Straight with body", note: "Mostly straight with natural fullness and a slight curve through the ends.", path: "M2 21 C20 16 42 26 74 20" },
  { code: "1C", family: "Straight", name: "Coarse straight", note: "Thicker strands with subtle bends; often holds shape but can resist styling.", path: "M2 24 C18 8 35 34 52 13 S67 25 74 18" },
  { code: "2A", family: "Wavy", name: "Loose wave", note: "A soft S pattern, often flatter near the root and easy to weigh down.", path: "M2 21 C14 5 26 37 38 21 S62 5 74 21" },
  { code: "2B", family: "Wavy", name: "Defined wave", note: "A clearer S shape with moderate texture and a tendency toward frizz.", path: "M2 21 C10 3 20 39 29 21 S47 3 56 21 S66 38 74 21" },
  { code: "2C", family: "Wavy", name: "Strong wave", note: "Deep S waves that may form loose spirals; benefits from layered shape control.", path: "M2 22 C8 1 16 42 24 21 S40 1 48 21 S64 42 72 20" },
  { code: "3A", family: "Curly", name: "Wide curl", note: "Large, springy loops. Shape and curl-by-curl awareness help protect movement.", path: "M2 28 C2 4 24 3 24 21 C24 39 45 39 45 20 C45 2 72 2 72 25" },
  { code: "3B", family: "Curly", name: "Spring curl", note: "Medium ringlets with visible volume and shrinkage that changes the finished length.", path: "M2 30 C-1 4 18 1 18 21 C18 41 36 41 36 20 C36 1 55 1 55 21 C55 41 73 38 73 13" },
  { code: "3C", family: "Curly", name: "Tight corkscrew", note: "Dense, pencil-sized curls with significant volume and shrinkage.", path: "M2 34 C-2 8 13 3 13 21 C13 39 27 39 27 20 C27 2 42 2 42 21 C42 40 56 40 56 20 C56 2 72 5 72 31" },
  { code: "4A", family: "Coily", name: "Defined coil", note: "Small visible S coils. Hydration, shrinkage, and tension should guide the cut.", path: "M2 32 C-2 12 9 6 9 21 C9 36 19 36 19 20 C19 5 29 5 29 21 C29 37 39 37 39 20 C39 4 49 4 49 21 C49 38 59 38 59 20 C59 4 72 7 72 31" },
  { code: "4B", family: "Coily", name: "Z-pattern coil", note: "Sharp bends with less visible ringlet definition; delicate handling helps retain length.", path: "M2 33 L10 8 L18 34 L26 8 L34 34 L42 8 L50 34 L58 8 L66 34 L74 8" },
  { code: "4C", family: "Coily", name: "Tightest coil", note: "Very tight zig-zag pattern with the greatest shrinkage; cut length must be planned carefully.", path: "M2 32 L7 10 L12 33 L17 9 L22 34 L27 8 L32 33 L37 9 L42 34 L47 8 L52 33 L57 9 L62 34 L67 8 L72 31" },
];

const textureList = document.querySelector("#textureList");
textureList.innerHTML = textureData.map((texture) => `
  <article class="texture-row reveal">
    <div class="texture-code">${texture.code}<small>${texture.family}</small></div>
    <div class="strand" aria-hidden="true"><svg viewBox="0 0 76 42"><path d="${texture.path}"/></svg></div>
    <div class="texture-info"><b>${texture.name}</b><p>${texture.note}</p></div>
  </article>`).join("");

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) entry.target.classList.add("visible");
}), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

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

let currentPosition = null;
let currentShops = [];
let nearbyShops = [];
// Name matches from outside the nearby ring — a shop the traveller named that
// sits in another city or another country.
let worldwideShops = [];
let activeFilter = "all";
// The directory bar the guide holds shops to: 4.3 stars and up, with a photo on
// file. The server owns the number and echoes it back on every search, so the
// copy below is written from that value rather than hard-coding it here.
let ratedOnly = true;
let ratingBar = 4.3;
const barLabel = () => ratingBar.toFixed(1);
// Set from the server's echo of the name filter, so the UI and the results
// always describe the same search even if the server trimmed the input.
let nameQuery = "";
const results = document.querySelector("#shopResults");
const status = document.querySelector("#locationStatus");
const locateButton = document.querySelector("#locateButton");
const resultLocation = document.querySelector("#resultLocation");
const worldSearchForm = document.querySelector("#worldSearchForm");
const shopNameField = document.querySelector("#shopNameInput");
const mapPins = [...document.querySelectorAll(".map-pin")];

function shopNameInput() {
  return shopNameField ? shopNameField.value.trim().slice(0, 100) : "";
}

// Every search carries the shop name if one was typed, so "is this shop near
// me?" works from the search box, from precise location, and on first load.
function shopsUrl(params) {
  const query = new URLSearchParams(params);
  const name = shopNameInput();
  if (name) query.set("name", name);
  const suffix = query.toString();
  return suffix ? `/api/shops?${suffix}` : "/api/shops";
}

// A plain Google web search, not a map: a shop with no map listing is still
// findable, and so is a shop we have never heard of.
function googleWebSearch(terms) {
  const link = document.querySelector("#googleSearchLink");
  if (link) link.href = `https://www.google.com/search?q=${encodeURIComponent(terms)}`;
}

function mapsLinks(latitude, longitude) {
  const name = shopNameInput();
  const query = encodeURIComponent(name ? `${name} barber shop` : "barber shops");
  document.querySelector("#googleMapsLink").href = `https://www.google.com/maps/search/?api=1&query=${query}&center=${latitude},${longitude}`;
  document.querySelector("#appleMapsLink").href = `https://maps.apple.com/?q=${query}&ll=${latitude},${longitude}`;
  googleWebSearch(name ? `${name} barbershop near me` : "barber shops near me");
}

function mapsPlaceLinks(place) {
  const name = shopNameInput();
  const query = encodeURIComponent(name ? `${name} barber shop ${place}` : `barber shops in ${place}`);
  document.querySelector("#googleMapsLink").href = `https://www.google.com/maps/search/?api=1&query=${query}`;
  document.querySelector("#appleMapsLink").href = `https://maps.apple.com/?q=${query}`;
  googleWebSearch(name ? `${name} barbershop in ${place}` : `barber shops in ${place}`);
}

// The fallback for when the listings come up short: hand the traveller's own
// words to Google, which knows shops no public map has recorded. "Near me" lets
// Google use its own idea of where they are; a searched city is named instead.
const googleFallbackForm = document.querySelector("#googleFallbackForm");
const googleShopNameField = document.querySelector("#googleShopName");
let searchedPlace = "";

function googleFallbackUrl(target) {
  const name = googleShopNameField ? googleShopNameField.value.trim().slice(0, 100) : "";
  const where = searchedPlace ? `in ${searchedPlace}` : "near me";
  const terms = name ? `${name} barber ${where}` : `barbers ${where}`;
  if (target === "maps") {
    const center = !searchedPlace && currentPosition ? `&center=${currentPosition.latitude},${currentPosition.longitude}` : "";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(terms)}${center}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(terms)}`;
}

// A name that came up empty in the listings is the one to try on Google.
function offerGoogleFallback(name) {
  if (googleShopNameField && name) googleShopNameField.value = name;
}

if (googleFallbackForm) {
  googleFallbackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const target = event.submitter?.dataset.target || "search";
    window.open(googleFallbackUrl(target), "_blank", "noopener");
  });
}

function setSearchLoading(label) {
  status.textContent = label;
  results.innerHTML = `<div class="shop-skeletons" aria-label="Searching for nearby shops">${Array.from({ length: 5 }, () => "<i></i>").join("")}</div>`;
}

async function loadShops(url, fallbackLabel) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Shop search is unavailable right now.");
  currentShops = data.shops || [];
  nearbyShops = data.nearby || [];
  worldwideShops = data.worldwide || [];
  nameQuery = data.nameQuery || "";
  if (Number.isFinite(data.minRating)) {
    ratingBar = data.minRating;
    syncRatedToggle();
  }
  if (data.origin) mapsLinks(data.origin.latitude, data.origin.longitude);
  const area = data.location || fallbackLabel;
  resultLocation.textContent = area;
  // Now that the area has a name, the Google link can say where to look.
  googleWebSearch(`${nameQuery || "barber shops"} ${area && area !== "Your current area" ? `in ${area}` : "near me"}`);
  const matches = currentShops.length + nearbyShops.length + worldwideShops.length;
  const shown = ratedOnly && !nameQuery ? currentShops.length : matches;
  if (nameQuery) {
    // A name search answers one question, so report it as a count of matches
    // rather than as a directory result.
    status.textContent = matches
      ? `${matches} match${matches === 1 ? "" : "es"} for “${nameQuery}”`
      : `No shop named “${nameQuery}” nearby — try Google below`;
    if (!matches) offerGoogleFallback(nameQuery);
  } else {
    status.textContent = ratedOnly && !currentShops.length
      ? `No ${barLabel()}★ reviewed shops here yet — ${nearbyShops.length} to vet yourself`
      : `${shown} shop${shown === 1 ? "" : "s"} found`;
  }
  mapPins.forEach((pin, index) => pin.classList.toggle("hidden", index >= Math.max(shown, nearbyShops.length)));
  renderShops();
}

async function loadApproximateLocation() {
  setSearchLoading("Finding shops near your current area…");
  try {
    await loadShops(shopsUrl({}), "Your current area");
  } catch (error) {
    status.textContent = "Choose how you want to search";
    resultLocation.textContent = "Search a destination or share location";
    results.innerHTML = `<div class="empty-state"><span>⌖</span><h3>Where are you headed?</h3><p>${escapeHtml(error.message)} Search a city, state, or country above, or use precise location.</p></div>`;
  }
}

// A shop found by name can be on the far side of the world, and when the search
// had no origin there is no distance to state at all.
function distanceLabel(shop) {
  if (shop.distance == null) return shop.country || shop.city || "See map";
  return `${shop.distance.toLocaleString()} mi`;
}

function shopCard(shop, index) {
  const shopMap = shop.latitude != null && shop.longitude != null ? `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}` : document.querySelector("#googleMapsLink").href;
  const websiteAction = shopWebsiteAction(shop);
  const tags = [...shop.textures, ...shop.specialties].slice(0, 4);
  const family = textureFamilies[activeFilter];
  const verified = shop.textureStatus === "verified";
  const textureLine = verified
    ? `<p class="shop-texture verified"><b>Texture-reviewed</b> ${escapeHtml(tags.length ? tags.join(", ") : "range on file")}</p>`
    : `<p class="shop-texture ask"><b>Ask before you sit</b> ${escapeHtml(family ? family.ask : generalAsk)}</p>`;
  const photo = safeExternalUrl(shop.photoUrl);
  const media = photo ? `<img class="shop-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(shop.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : "";
  const rating = shop.rating != null
    ? `<span class="shop-rating"><b>${shop.rating.toFixed(1)}</b><i aria-hidden="true">★</i>${shop.reviewCount ? `<small>${shop.reviewCount} reviews</small>` : ""}</span>`
    : `<span class="shop-rating none">Not yet rated</span>`;
  const credit = photo && shop.photoCredit ? `<small class="shop-credit">Photo: ${escapeHtml(shop.photoCredit)}</small>` : "";
  return `<article class="shop-card${photo ? " has-photo" : ""}"><div class="shop-rank">0${index + 1}</div>${media}<div><div class="shop-title"><h3>${escapeHtml(shop.name)}</h3><span>${escapeHtml(shop.shopType || shop.source)}</span></div><p>${escapeHtml(shop.address)}${shop.city ? ` \u00b7 ${escapeHtml(shop.city)}` : ""}${shop.country ? `, ${escapeHtml(shop.country)}` : ""}</p><div class="tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("") || "<span>Public listing</span>"}</div>${textureLine}${credit}</div><div class="shop-side">${rating}<b>${escapeHtml(distanceLabel(shop))}</b>${websiteAction}<a class="shop-map-link" href="${escapeHtml(shopMap)}" target="_blank" rel="noopener" aria-label="View ${escapeHtml(shop.name)} on a map">Map \u2197</a></div></article>`;
}

function renderShops() {
  // A reviewed listing states the range it serves, so it can be filtered out. A
  // public listing has no hair-type data in any dataset, so hiding it would
  // invent a fact; it stays, labelled as needing the question asked.
  const applyFilter = (list) => activeFilter === "all"
    ? list
    : list.filter((shop) => shop.textureStatus !== "verified" || textureMatches(shop, activeFilter));
  const rated = applyFilter(currentShops);
  const unrated = applyFilter(nearbyShops);
  const elsewhere = applyFilter(worldwideShops);

  const named = nameQuery ? `\u201c${escapeHtml(nameQuery)}\u201d ` : "";
  const groups = [];
  if (rated.length) {
    groups.push(`<p class="result-group"><b>${named}Rated ${barLabel()}\u2605 and up</b> reviewed and photographed for the directory</p>`);
    groups.push(rated.map((shop, index) => shopCard(shop, index)).join(""));
  }
  // The reviewed directory is thin, so a bar with no matches must not leave the
  // visitor staring at a dead page. Fall through to the public listings, but keep
  // them under their own heading so nothing here reads as rated.
  // Someone searching by name wants that shop, rated or not, so a name search
  // always shows the match rather than hiding it behind the rating bar.
  const showUnrated = unrated.length > 0 && (!ratedOnly || rated.length === 0 || Boolean(nameQuery));
  if (showUnrated) {
    groups.push(nameQuery
      ? `<p class="result-group secondary"><b>${named}nearby, not yet reviewed</b> matched by name in the public listings \u2014 no rating exists for these, so ask before you sit down</p>`
      : rated.length
        ? `<p class="result-group secondary"><b>Nearby, not yet reviewed</b> no rating exists for these \u2014 ask before you sit down</p>`
        : `<p class="result-group secondary"><b>No ${barLabel()}\u2605 reviewed shops here yet</b> the directory only lists shops we have reviewed and photographed. These nearby barbershops carry no rating at all, so ask before you sit down.</p>`);
    groups.push(unrated.map((shop, index) => shopCard(shop, index)).join(""));
  }
  // A shop the traveller named is worth showing wherever it turned out to be, so
  // these are never hidden behind the rating bar or the nearby radius. They are
  // kept in their own group so nothing here reads as being around the corner.
  if (elsewhere.length) {
    groups.push(`<p class="result-group secondary"><b>${named}found elsewhere in the world</b> matched by name outside your area \u2014 no rating exists for these, so ask before you sit down</p>`);
    groups.push(elsewhere.map((shop, index) => shopCard(shop, index)).join(""));
  }
  if (!groups.length) {
    // No match for a name is a real answer, not a failure. Say so, and hand the
    // search to Google rather than pretending the shop does not exist.
    const webSearch = `https://www.google.com/search?q=${encodeURIComponent(`${nameQuery} barbershop`)}`;
    results.innerHTML = nameQuery
      ? `<div class="empty-state"><span>\u2316</span><h3>No shop named \u201c${escapeHtml(nameQuery)}\u201d found.</h3><p>This search reads the public OpenStreetMap listings, and no shop there carries that name \u2014 plenty of real shops simply have not been added to it yet. <a href="${escapeHtml(webSearch)}" target="_blank" rel="noopener">Look it up on Google \u2197</a> (or use the Google search just below), put its street address in the search box above to see what is mapped around it, or <a href="#business">add it to the Nomadic Ready directory</a>.</p></div>`
      : `<div class="empty-state"><span>\u2316</span><h3>No shops found in this area.</h3><p>Try a nearby city, or type the shop you are looking for into the Google search below to find barbers near you.</p></div>`;
    return;
  }
  results.innerHTML = groups.join("");
  // A shop's photo is its own URL and can rot; drop the frame rather than
  // leaving a broken-image icon in the card.
  results.querySelectorAll(".shop-photo").forEach((image) => {
    image.addEventListener("error", () => {
      image.closest(".shop-card")?.classList.remove("has-photo");
      image.remove();
    }, { once: true });
  });
}

// The guide's premise: no directory can promise a shop cuts your hair type, so
// it teaches you to ask before you sit down. These mirror the texture atlas
// notes — weight for 1A-1C, S-pattern for 2A-2C, curl-by-curl for 3A-3C,
// shrinkage and tension for 4A-4C.
const textureFamilies = {
  straight: { codes: "1A-1C", label: "Straight", ask: "Which hair types do you cut every day, and how do you blend fine straight hair without a weight line?" },
  wavy: { codes: "2A-2C", label: "Wavy", ask: "Do you cut waves wet or dry, and how do you keep the S-pattern from being weighed down?" },
  curly: { codes: "3A-3C", label: "Curly", ask: "Do you cut curls dry and curl-by-curl, and how do you keep the shape as it grows out?" },
  coily: { codes: "4A-4C", label: "Coily", ask: "How do you allow for shrinkage, and do you cut 4A-4C with low tension?" },
};
const generalAsk = "Which hair types do you cut every day, and who on the team cuts mine?";

function textureMatches(shop, filter) {
  const family = textureFamilies[filter];
  if (!family) return true;
  const haystack = [...shop.textures, ...shop.specialties].join(" ").toLowerCase();
  if (haystack.includes(family.label.toLowerCase())) return true;
  const wanted = Number(family.codes[0]);
  // Reviewed shops state their range in the guide's codes: "1A-4C", "3B, 4C", "4a".
  const range = haystack.match(/([1-4])\s*[a-c]?\s*[-\u2013]\s*([1-4])\s*[a-c]?/);
  if (range) return wanted >= Number(range[1]) && wanted <= Number(range[2]);
  return new RegExp(`${wanted}\\s*[a-c]`).test(haystack);
}

function shopWebsiteAction(shop) {
  const website = safeExternalUrl(shop.bookingUrl);
  if (website) {
    const label = shop.websiteLabel && shop.websiteLabel !== "Shop website" ? `Go to ${shop.websiteLabel}` : "Go to barbershop website";
    return `<a class="shop-link" href="${escapeHtml(website)}" target="_blank" rel="noopener" aria-label="${escapeHtml(label)} for ${escapeHtml(shop.name)}">${escapeHtml(label)} <span>↗</span></a>`;
  }
  const named = shop.name && shop.name !== "Local barber shop";
  const terms = [named ? shop.name : "barber shop", shop.address, shop.city, shop.country].filter(Boolean).join(" ");
  const lookup = `https://www.google.com/search?q=${encodeURIComponent(terms)}`;
  return `<a class="shop-link lookup" href="${escapeHtml(lookup)}" target="_blank" rel="noopener" aria-label="Search the web for ${escapeHtml(named ? shop.name : "barber shops at this address")}">Search for this shop <span>↗</span></a>`;
}

function safeExternalUrl(value) {
  if (!value) return null;
  try {
    const candidate = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
    const url = new URL(candidate);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

locateButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    status.textContent = "Location is not supported by this browser";
    return;
  }
  locateButton.disabled = true;
  locateButton.textContent = "Locating…";
  setSearchLoading("Reading your live location…");
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    const latitude = Math.round(coords.latitude * 1000) / 1000;
    const longitude = Math.round(coords.longitude * 1000) / 1000;
    currentPosition = { latitude, longitude };
    searchedPlace = "";
    mapsLinks(latitude, longitude);
    document.querySelector('[name="latitude"]').value = latitude;
    document.querySelector('[name="longitude"]').value = longitude;
    try {
      await loadShops(shopsUrl({ lat: latitude, lng: longitude }), "Your current area");
    } catch (error) {
      status.textContent = "Search unavailable";
      results.innerHTML = `<div class="empty-state"><span>!</span><h3>Live listings are resting.</h3><p>${escapeHtml(error.message)} Your map links are still ready below.</p></div>`;
    } finally {
      locateButton.disabled = false;
      locateButton.innerHTML = "Refresh location <span>◎</span>";
    }
  }, () => {
    status.textContent = "Location permission was not granted";
    locateButton.disabled = false;
    locateButton.innerHTML = "Try location again <span>◎</span>";
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
});

worldSearchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const place = document.querySelector("#worldSearchInput").value.trim();
  const name = shopNameInput();
  if (!place && !name) {
    status.textContent = "Enter a city, or a shop name to search anywhere";
    return;
  }
  // A name on its own narrows the area already on screen and searches the public
  // listings worldwide, so it never demands a city as well.
  const params = place
    ? { place }
    : currentPosition
      ? { lat: currentPosition.latitude, lng: currentPosition.longitude }
      : {};
  if (place) searchedPlace = place;
  if (name) offerGoogleFallback(name);
  const label = place || resultLocation.textContent || "Your current area";
  setSearchLoading(place ? `Searching ${name ? `for ${name} in ` : ""}${place}…` : `Looking for ${name} near you and worldwide…`);
  if (place) mapsPlaceLinks(place);
  else if (currentPosition) mapsLinks(currentPosition.latitude, currentPosition.longitude);
  else googleWebSearch(`${name} barbershop`);
  try {
    await loadShops(shopsUrl(params), label);
  } catch (error) {
    status.textContent = place ? "Place not found" : "Search unavailable";
    resultLocation.textContent = label;
    results.innerHTML = `<div class="empty-state"><span>!</span><h3>Try another location.</h3><p>${escapeHtml(error.message)}</p></div>`;
  }
});

document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  activeFilter = button.dataset.filter;
  renderShops();
}));

const ratedToggle = document.querySelector("#ratedToggle");
function syncRatedToggle() {
  if (!ratedToggle) return;
  ratedToggle.classList.toggle("active", ratedOnly);
  ratedToggle.setAttribute("aria-pressed", String(ratedOnly));
  ratedToggle.textContent = ratedOnly ? `${barLabel()}\u2605 and up` : "Showing all nearby";
  const note = ratedToggle.parentElement?.querySelector("small");
  if (note) note.textContent = `Reviewed shops only \u2014 ${barLabel()} stars or better, with a photo on file. Tap to include nearby listings that carry no rating.`;
}
function setRatedOnly(value) {
  ratedOnly = value;
  syncRatedToggle();
  renderShops();
}
if (ratedToggle) ratedToggle.addEventListener("click", () => setRatedOnly(!ratedOnly));

loadApproximateLocation();

const careData = {
  hair: [
    { number: "01", title: "Protect the shape overnight", time: "Daily · 2 min", steps: ["Use a satin or silk bonnet, scarf, or pillowcase.", "Loosely gather longer curls or coils at the crown without pulling the hairline.", "In the morning, reshape with damp hands before adding more product."] },
    { number: "02", title: "Refresh without buildup", time: "As needed · 5 min", steps: ["Mist lightly with water instead of soaking the hair.", "Emulsify a small amount of leave-in or styling cream between your palms.", "Work from ends upward and stop before the hair feels coated."] },
    { number: "03", title: "Keep edges clean safely", time: "Weekly · 5 min", steps: ["Brush loose hairs away and work only in strong light.", "Use a clean detail trimmer on obvious strays—never redesign the line.", "Keep the corners natural so your barber can restore the full shape."] },
  ],
  beard: [
    { number: "01", title: "Wash without stripping", time: "2–3× weekly", steps: ["Use lukewarm water and a gentle beard or face cleanser.", "Massage the skin underneath rather than scrubbing the hair aggressively.", "Pat dry and apply moisturizer or a few drops of beard oil while damp."] },
    { number: "02", title: "Control the outline", time: "Weekly · 10 min", steps: ["Comb the beard into its natural resting position first.", "Trim only hairs that clearly sit outside the established shape.", "Avoid raising the neckline or lowering the cheek line between visits."] },
    { number: "03", title: "Handle travel dryness", time: "Daily · 3 min", steps: ["Rinse out saltwater, chlorine, sweat, and heavy dust promptly.", "Use a light balm to reduce friction and flyaways.", "Comb gently from the ends toward the root to avoid unnecessary breakage."] },
  ],
  kit: [
    { number: "01", title: "The five-piece carry kit", time: "Pack once", steps: ["Wide-tooth comb or texture-appropriate brush.", "Travel-size leave-in conditioner or beard moisturizer.", "Satin scarf or compact bonnet, detail trimmer, and disinfecting wipes."] },
    { number: "02", title: "Before using hotel products", time: "30 sec", steps: ["Check for strong fragrance or unfamiliar active ingredients.", "Use a small amount first, especially on sensitive skin or color-treated hair.", "When unsure, water and your own trusted leave-in are the safer reset."] },
    { number: "03", title: "Document your barber's work", time: "After each cut", steps: ["Take front, side, and back photos in even light.", "Note guard lengths, products, and how the cut looked after two weeks.", "Keep the information in your phone for the next barber consultation."] },
  ],
};

function renderCare(category) {
  document.querySelector("#careGuides").innerHTML = careData[category].map((guide) => `<article class="care-card"><div class="care-card-head"><span>${guide.number}</span><small>${guide.time}</small></div><h3>${guide.title}</h3><ol>${guide.steps.map((step) => `<li>${step}</li>`).join("")}</ol></article>`).join("");
}

document.querySelectorAll(".care-tab").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".care-tab").forEach((tab) => { tab.classList.remove("active"); tab.setAttribute("aria-selected", "false"); });
  button.classList.add("active");
  button.setAttribute("aria-selected", "true");
  renderCare(button.dataset.care);
}));
renderCare("hair");

const photoInput = document.querySelector("#photoInput");
const photoDrop = document.querySelector("#photoDrop");
const photoPreview = document.querySelector("#photoPreview");
let photoData = "";
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;
  if (file.size > 5_000_000) {
    document.querySelector("#consultError").textContent = "Choose a photo under 5 MB.";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    photoData = reader.result;
    photoPreview.src = photoData;
    photoDrop.classList.add("has-photo");
    document.querySelector("#consultError").textContent = "";
  };
  reader.readAsDataURL(file);
});

document.querySelector("#consultForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const error = document.querySelector("#consultError");
  const loading = document.querySelector("#consultLoading");
  const result = document.querySelector("#consultResult");
  if (!photoData) {
    error.textContent = "Add a clear photo first.";
    return;
  }
  error.textContent = "";
  form.style.display = "none";
  loading.classList.add("active");
  try {
    const response = await fetch("/api/style-consult", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image: photoData, goals: document.querySelector("#goalsInput").value, routine: document.querySelector("#routineInput").value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Consultation unavailable");
    result.innerHTML = `<div class="result-head"><small>Your Nomadic Ready brief</small><h3>${escapeHtml(data.texture_observation || "Visible hair assessment")}</h3></div>${(data.three_styles || []).map((style, index) => `<div class="style-result"><b>0${index + 1}</b><div><h4>${escapeHtml(style.name)}</h4><p>${escapeHtml(style.why)}</p><div class="barber-script">“${escapeHtml(style.barber_brief)}”</div></div></div>`).join("")}<div class="result-footer"><b>Maintenance:</b> ${escapeHtml(data.maintenance || "Discuss your daily routine with your barber.")}<br><br>${escapeHtml(data.consultation_note || "Confirm the plan with a professional in person.")}</div><button class="button button-dark" id="restartConsult" type="button">Try another photo <span>↻</span></button>`;
    result.classList.add("active");
    document.querySelector("#restartConsult").addEventListener("click", () => { result.classList.remove("active"); form.style.display = "block"; });
  } catch (caughtError) {
    form.style.display = "block";
    error.textContent = caughtError.message;
  } finally {
    loading.classList.remove("active");
  }
});

document.querySelector("#copyBrief").addEventListener("click", async (event) => {
  const checklist = "MY BARBER BRIEF\n1. Reference I want: [add link/photo]\n2. Reference I do not want: [add link/photo]\n3. Keep this: [length / hairline / beard / other]\n4. My routine: [products + daily styling time]\n5. Before we start: Please repeat the plan and confirm the starting length.";
  await navigator.clipboard.writeText(checklist);
  event.currentTarget.innerHTML = "Checklist copied <span>✓</span>";
});

document.querySelector("#shopForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.querySelector("#shopMessage");
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Submitting…";
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch("/api/shops", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to submit shop");
    message.style.color = "#1f6f52";
    message.textContent = data.message;
    form.reset();
    if (currentPosition) {
      form.querySelector('[name="latitude"]').value = currentPosition.latitude;
      form.querySelector('[name="longitude"]').value = currentPosition.longitude;
    }
  } catch (error) {
    message.style.color = "#c53720";
    message.textContent = error.message;
  } finally {
    button.disabled = false;
    button.innerHTML = "Submit my shop <span>→</span>";
  }
});
