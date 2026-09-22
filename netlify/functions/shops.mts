import type { Config, Context } from "@netlify/functions";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { shops } from "../../db/schema.js";

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };
const requestHeaders = {
  "user-agent": "TheNomadicBarberGlobal/1.0",
  referer: "https://thenomadicbarber1.netlify.app/guide.html",
  accept: "application/json",
};

type Coordinates = { latitude: number; longitude: number; label?: string };
type ShopResult = {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  textures: string[];
  specialties: string[];
  bookingUrl: string | null;
  websiteLabel: string | null;
  distance: number | null;
  shopType: "Barbershop" | "Hair salon";
  rating: number | null;
  reviewCount: number | null;
  photoUrl: string | null;
  photoCredit: string | null;
  // No public dataset records which hair types a shop can actually cut, so this
  // says whether the textures above were reviewed by us or still need asking.
  textureStatus: "verified" | "ask";
  source: "Nomadic Ready" | "OpenStreetMap";
};

// The rating floor a nearby search holds reviewed shops to: 4.3 stars up to the
// top of the scale. The client reads this back off the response so the on-page
// copy always names the bar actually applied.
const defaultMinRating = 4.3;

// OpenStreetMap records a shop's web presence under a spread of keys, and the
// values are hand-entered: full URLs, bare domains, or bare social handles.
const fallbackShopName = "Local barber shop";
const websiteTags = ["website", "contact:website", "website:official", "url", "brand:website"];
const socialTags: Array<{ key: string; host: string; label: string }> = [
  { key: "contact:facebook", host: "www.facebook.com", label: "Facebook page" },
  { key: "facebook", host: "www.facebook.com", label: "Facebook page" },
  { key: "contact:instagram", host: "www.instagram.com", label: "Instagram page" },
  { key: "instagram", host: "www.instagram.com", label: "Instagram page" },
  { key: "contact:yelp", host: "www.yelp.com", label: "Yelp listing" },
];

function normaliseUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const first = value.split(";")[0].trim();
  if (!first) return null;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(first) ? first : `https://${first}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.href;
  } catch {
    return null;
  }
}

function socialProfileUrl(host: string, value: string): string | null {
  const direct = normaliseUrl(value);
  if (direct) return direct;
  const handle = value.split(";")[0].trim().replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
  if (!handle || /[\s?#]/.test(handle)) return null;
  return `https://${host}/${encodeURIComponent(handle)}`;
}

// Plenty of shops list a social profile as their "website", so name the button
// after where the link actually goes.
function labelForUrl(url: string): string {
  const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  const match = socialTags.find((entry) => entry.host.replace(/^www\./, "") === host);
  return match ? match.label : "Shop website";
}

// A shop's own site first; a social or review page only when there is nothing better.
function webDestination(tags: Record<string, any>): { url: string; label: string } | null {
  for (const key of websiteTags) {
    const url = normaliseUrl(tags[key]);
    if (url) return { url, label: labelForUrl(url) };
  }
  for (const { key, host, label } of socialTags) {
    if (typeof tags[key] !== "string") continue;
    const url = socialProfileUrl(host, tags[key]);
    if (url) return { url, label };
  }
  return null;
}

// `hairdresser=barber` is the one capability tag OSM carries at scale (~15.7k
// uses). Everything else under shop=hairdresser is a salon until it says
// otherwise, and this search is for barbershops.
const barberValues = ["barber", "men", "barber;salon", "saloon"];
// The only texture-specific values OSM records — about 20 shops worldwide, so
// the shop's own name is the signal that actually shows up. A shop calling
// itself "Natural Hair" or "African Hair Braiding" is self-identifying; that is
// a lead worth surfacing to a 3A-4C traveller, not a promise, which is why the
// card still tells them to ask.
const texturedHairValues = ["african_hair_braiding", "african_braiding", "braiding", "extensions"];
const texturedHairNames = /natural hair|nappy|afro|braid|cornrow|dreadlock|\blocs\b|twist|curl|coil|kink|texture/i;

// The guide ships in English, French, Spanish, Italian and German, and the
// shops themselves are named in the local language, so read all five.
const barberNames = /barber|barbier|barbear|barber[ií]a|barbiere|friseur|frisor|coiffeur/i;

function shopKind(tags: Record<string, any>): "Barbershop" | "Hair salon" {
  const value = String(tags.hairdresser ?? "").toLowerCase();
  if (barberValues.includes(value)) return "Barbershop";
  if (barberNames.test(`${tags.name ?? ""} ${tags.brand ?? ""}`)) return "Barbershop";
  return "Hair salon";
}

function texturedHairSignal(tags: Record<string, any>): boolean {
  const value = String(tags.hairdresser ?? "").toLowerCase();
  if (texturedHairValues.some((entry) => value.includes(entry))) return true;
  return texturedHairNames.test(`${tags.name ?? ""} ${tags.brand ?? ""}`);
}

// Shop names reach this code from three directions that disagree about spelling:
// a traveller's typing, OpenStreetMap, and the reviewed directory. "Gentlemen's"
// is written with a straight or a curly apostrophe, "Parlour" is also spelled
// "Parlor", and "&" is also "and". Comparing raw strings means a search misses
// the shop it named, so compare the words the name is made of.
function nameWords(value: string): string[] {
  return value
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    // An apostrophe is dropped, not split on: "Gentlemen's" is one word whichever
    // way it is punctuated, and splitting it leaves a stray "s" matching nothing.
    .replace(/['\u2018\u2019\u02bc`]/g, "")
    // "Truefitt & Hill" is typed "Truefitt and Hill" just as often.
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

// One insertion, deletion, or substitution apart: "parlor"/"parlour", and the
// ordinary typo. Walks the two words together rather than building a matrix,
// because a single edit is all this needs to tell apart.
function withinOneEdit(first: string, second: string): boolean {
  if (first === second) return true;
  if (Math.abs(first.length - second.length) > 1) return false;
  const [shorter, longer] = first.length <= second.length ? [first, second] : [second, first];
  let shortIndex = 0;
  let longIndex = 0;
  let edits = 0;
  while (shortIndex < shorter.length && longIndex < longer.length) {
    if (shorter[shortIndex] === longer[longIndex]) {
      shortIndex += 1;
      longIndex += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (shorter.length === longer.length) shortIndex += 1;
    longIndex += 1;
  }
  return edits + (longer.length - longIndex) + (shorter.length - shortIndex) <= 1;
}

// Every word typed has to turn up somewhere in the name, in any order, so
// "gentlemens parlour" still finds "Groomed Gentlemen's Parlor". A typed word may
// be the start of a longer one, which is what makes partial typing work. The
// one-edit allowance is limited to words long enough for it to mean something —
// on three letters it would match most of the directory.
function matchesName(shopName: string, queryWords: string[]): boolean {
  if (!queryWords.length) return true;
  const words = nameWords(shopName);
  return queryWords.every((needle) => words.some((word) =>
    word.startsWith(needle) || (needle.length >= 5 && withinOneEdit(word, needle))));
}

// Two datasets describe the same shop, so a match is "same name, same corner".
function dedupeKey(shop: ShopResult): string {
  return `${shop.name.toLowerCase()}-${shop.latitude?.toFixed(4)}-${shop.longitude?.toFixed(4)}`;
}

function validCoordinates(latitude: number, longitude: number): Coordinates | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

function coordinatesFromValues(latitude: unknown, longitude: unknown): Coordinates | null {
  if (latitude == null || longitude == null || String(latitude).trim() === "" || String(longitude).trim() === "") return null;
  return validCoordinates(Number(latitude), Number(longitude));
}

function distanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = toRadians(lat2 - lat1);
  const longitudeDelta = toRadians(lon2 - lon1);
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

async function geocodePlace(place: string): Promise<Coordinates | null> {
  const params = new URLSearchParams({ q: place, format: "jsonv2", limit: "1", addressdetails: "1" });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: requestHeaders,
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const [result] = await response.json() as Array<{ lat: string; lon: string; display_name: string }>;
  if (!result) return null;
  return { latitude: Number(result.lat), longitude: Number(result.lon), label: result.display_name };
}

async function findOpenStreetMapShops(origin: Coordinates): Promise<ShopResult[]> {
  const query = `[out:json][timeout:18];(nwr["shop"="hairdresser"](around:40000,${origin.latitude},${origin.longitude});nwr["hairdresser"="barber"](around:40000,${origin.latitude},${origin.longitude}););out center tags;`;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "user-agent": requestHeaders["user-agent"], "content-type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) return [];
  const data = await response.json() as { elements?: Array<Record<string, any>> };

  return (data.elements ?? []).map((element): ShopResult | null => {
    const latitude = Number(element.lat ?? element.center?.lat);
    const longitude = Number(element.lon ?? element.center?.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    const tags = element.tags ?? {};
    const addressParts = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
    const city = tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "Nearby";
    const country = tags["addr:country"] || "";
    const details = [tags.hairdresser, tags.service].filter(Boolean).join(", ").replaceAll(";", ", ");
    const destination = webDestination(tags);
    return {
      id: `osm-${element.type}-${element.id}`,
      name: tags.name || tags.brand || fallbackShopName,
      city,
      country,
      address: addressParts || tags["addr:full"] || city,
      latitude,
      longitude,
      textures: texturedHairSignal(tags) ? ["Textured-hair focus"] : [],
      specialties: details ? details.split(",").map((item: string) => item.trim()).filter(Boolean) : ["Hair services"],
      bookingUrl: destination?.url ?? null,
      websiteLabel: destination?.label ?? null,
      shopType: shopKind(tags),
      textureStatus: "ask" as const,
      // No public listing carries a star rating — OSM's `rating` key is
      // electrical capacity in kVA — so these can never meet a rating bar.
      rating: null,
      reviewCount: null,
      photoUrl: normaliseUrl(tags.image),
      photoCredit: normaliseUrl(tags.image) ? "OpenStreetMap contributor" : null,
      distance: Math.round(distanceMiles(origin.latitude, origin.longitude, latitude, longitude) * 10) / 10,
      source: "OpenStreetMap",
    };
  }).filter((shop): shop is ShopResult => shop !== null);
}

// Nominatim reports a shop's OSM type as the `shop=*` value, so these are the
// two that mean hair; `hairdresser=barber` narrows it to a barbershop later.
const hairShopTypes = ["hairdresser", "barber"];

// The nearby search is bounded to a 25-mile ring, so it cannot answer "where is
// this shop?" about a shop somewhere else. Overpass cannot either: a planet-wide
// name search there has no bounding box to limit the work and times out. Nominatim
// indexes every named shop in OpenStreetMap worldwide, which is exactly that query.
async function findShopsByName(name: string, origin: Coordinates | null): Promise<ShopResult[]> {
  const params = new URLSearchParams({ q: name, format: "jsonv2", limit: "20", addressdetails: "1", extratags: "1" });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: requestHeaders,
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return [];
  const results = await response.json() as Array<Record<string, any>>;
  if (!Array.isArray(results)) return [];

  return results.map((result): ShopResult | null => {
    // jsonv2 reports the OSM key as `category`; the older format calls it `class`.
    const category = String(result.category ?? result.class ?? "");
    const type = String(result.type ?? "");
    const tags: Record<string, any> = { ...(result.extratags ?? {}), name: result.name || String(result.display_name ?? "").split(",")[0].trim() };
    // A hair shop, not a restaurant that happens to share the name.
    if (category !== "shop") return null;
    if (!hairShopTypes.includes(type) && !tags.hairdresser) return null;
    const coordinates = coordinatesFromValues(result.lat, result.lon);
    if (!coordinates) return null;

    const address = result.address ?? {};
    const street = [address.house_number, address.road].filter(Boolean).join(" ");
    const city = address.city || address.town || address.village || address.suburb || address.county || "";
    const details = [tags.hairdresser, tags.service].filter(Boolean).join(", ").replaceAll(";", ", ");
    const destination = webDestination(tags);
    const photoUrl = normaliseUrl(tags.image);
    return {
      id: `osm-${result.osm_type}-${result.osm_id}`,
      name: tags.name || fallbackShopName,
      city,
      country: address.country || "",
      address: street || city || String(result.display_name ?? "").split(",").slice(0, 2).join(", ").trim(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      textures: texturedHairSignal(tags) ? ["Textured-hair focus"] : [],
      specialties: details ? details.split(",").map((item: string) => item.trim()).filter(Boolean) : ["Hair services"],
      bookingUrl: destination?.url ?? null,
      websiteLabel: destination?.label ?? null,
      shopType: shopKind(tags),
      textureStatus: "ask" as const,
      rating: null,
      reviewCount: null,
      photoUrl,
      photoCredit: photoUrl ? "OpenStreetMap contributor" : null,
      // With nowhere to measure from, the honest answer is no distance at all.
      distance: origin ? Math.round(distanceMiles(origin.latitude, origin.longitude, coordinates.latitude, coordinates.longitude) * 10) / 10 : null,
      source: "OpenStreetMap" as const,
    };
  }).filter((shop): shop is ShopResult => shop !== null);
}

async function findReviewedShops(origin: Coordinates | null): Promise<ShopResult[]> {
  const results = await db.select().from(shops).where(eq(shops.isApproved, true)).orderBy(asc(shops.name)).catch(() => []);
  return results.filter((shop) => shop.latitude != null && shop.longitude != null).map((shop) => ({
    id: `ready-${shop.id}`,
    name: shop.name,
    city: shop.city,
    country: shop.country,
    address: shop.address,
    latitude: shop.latitude,
    longitude: shop.longitude,
    textures: shop.textures.split(",").map((item) => item.trim()).filter(Boolean),
    specialties: shop.specialties.split(",").map((item) => item.trim()).filter(Boolean),
    shopType: "Barbershop" as const,
    textureStatus: "verified" as const,
    rating: shop.rating,
    reviewCount: shop.reviewCount,
    photoUrl: normaliseUrl(shop.photoUrl),
    photoCredit: shop.photoCredit,
    bookingUrl: normaliseUrl(shop.bookingUrl),
    websiteLabel: normaliseUrl(shop.bookingUrl) ? labelForUrl(normaliseUrl(shop.bookingUrl)!) : null,
    distance: origin ? Math.round(distanceMiles(origin.latitude, origin.longitude, shop.latitude!, shop.longitude!) * 10) / 10 : null,
    source: "Nomadic Ready" as const,
  }));
}

export default async (request: Request, context: Context) => {
  if (request.method === "GET") {
    const url = new URL(request.url);
    const place = url.searchParams.get("place")?.trim().slice(0, 160);
    // Someone who already knows the shop's name is looking for that shop. Near an
    // origin the name narrows the nearby pool; on its own it is the whole search.
    const nameQuery = url.searchParams.get("name")?.trim().slice(0, 100) ?? "";
    let origin: Coordinates | null = null;

    if (place) {
      origin = await geocodePlace(place);
      if (!origin) {
        return new Response(JSON.stringify({ error: `We couldn't find “${place}”. Try a city with its state or country.` }), { status: 404, headers: jsonHeaders });
      }
    } else {
      const latitude = url.searchParams.get("lat") ?? context.geo.latitude;
      const longitude = url.searchParams.get("lng") ?? context.geo.longitude;
      origin = coordinatesFromValues(latitude, longitude);
    }
    // A named shop can be looked up anywhere in the world, so a name search needs
    // no starting point. With neither a name nor an origin there is nothing to search.
    if (!origin && !nameQuery) {
      return new Response(JSON.stringify({ error: "Enter a city, state, or country, share your location, or search a shop by name." }), { status: 400, headers: jsonHeaders });
    }

    // The directory bar: 4.3 stars and a photo, overridable for "show me everything".
    const requestedRating = Number(url.searchParams.get("minRating") ?? defaultMinRating);
    const minRating = Number.isFinite(requestedRating) ? Math.min(Math.max(requestedRating, 0), 5) : defaultMinRating;

    // The place lookup above has already returned, so this is the only Nominatim
    // request in flight — its usage policy allows one at a time.
    const [reviewed, openStreetMap, worldwide] = await Promise.all([
      findReviewedShops(origin),
      origin ? findOpenStreetMapShops(origin).catch(() => []) : [],
      nameQuery ? findShopsByName(nameQuery, origin).catch(() => []) : [],
    ]);
    const seen = new Set<string>();
    // A shop is worth a detour when a traveller can actually use it: somewhere to
    // click, a barbershop rather than a blow-dry bar, and a named listing. The
    // floor caps the total discount so "nearby" still means nearby.
    const detourScore = (shop: ShopResult) => {
      const weight = (shop.bookingUrl ? 0.25 : 1)
        * (shop.shopType === "Barbershop" ? 0.7 : 1)
        * (shop.textures.length ? 0.85 : 1)
        * (shop.name === fallbackShopName ? 1.5 : 1);
      return (shop.distance ?? Infinity) * Math.max(weight, 0.2);
    };
    const byDistance = (first: ShopResult, second: ShopResult) => (first.distance ?? Infinity) - (second.distance ?? Infinity);
    const nameWordsQueried = nameWords(nameQuery);
    const candidates = [...reviewed, ...openStreetMap]
      .sort(byDistance)
      .filter((shop) => matchesName(shop.name, nameWordsQueried))
      .filter((shop) => {
        const key = dedupeKey(shop);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    // Apply the rating bar before taking the top five, or a 4.8-rated shop just
    // outside the nearest five would be dropped before it was ever considered.
    const meetsBar = (shop: ShopResult) => shop.rating != null && shop.rating >= minRating && shop.photoUrl != null;
    const bestFive = (pool: ShopResult[]) => pool.sort((first, second) => detourScore(first) - detourScore(second)).slice(0, 5).sort(byDistance);
    const ranked = bestFive(candidates.filter(meetsBar));
    // Public listings hold no rating at all, so they can never clear the bar.
    // They are returned separately rather than silently dressed up as rated.
    const nearby = bestFive(candidates.filter((shop) => !meetsBar(shop)));

    // What the name search found outside the nearby ring. Nominatim has already
    // matched these against the same name, and answers an unknown name with
    // nothing rather than something unrelated, so its ranking stands. A shop
    // already listed above is near the traveller, so it is not repeated as far away.
    const nearbyIds = new Set(candidates.map((shop) => shop.id));
    const farther = worldwide
      .filter((shop) => !nearbyIds.has(shop.id))
      .filter((shop) => {
        const key = dedupeKey(shop);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    // Nearest first when there is somewhere to measure from; otherwise Nominatim's
    // own relevance order, which is the only ranking available.
    const elsewhere = (origin ? farther.sort(byDistance) : farther).slice(0, 5);

    const responseHeaders = new Headers(jsonHeaders);
    if (place || url.searchParams.has("lat") || url.searchParams.has("lng") || !origin) {
      responseHeaders.set("Netlify-CDN-Cache-Control", "public, durable, max-age=3600, stale-while-revalidate=86400");
    } else {
      responseHeaders.set("Cache-Control", "private, no-store");
    }

    return new Response(JSON.stringify({
      shops: ranked,
      nearby,
      worldwide: elsewhere,
      minRating,
      nameQuery: nameQuery || null,
      location: origin ? origin.label ?? null : "Worldwide",
      origin: origin ? { latitude: origin.latitude, longitude: origin.longitude } : null,
    }), {
      headers: responseHeaders,
    });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || body.website) {
      return new Response(JSON.stringify({ error: "Invalid submission." }), { status: 400, headers: jsonHeaders });
    }

    const required = ["name", "city", "country", "address", "textures", "specialties", "contactEmail"];
    if (required.some((field) => typeof body[field] !== "string" || !(body[field] as string).trim())) {
      return new Response(JSON.stringify({ error: "Complete all required fields." }), { status: 400, headers: jsonHeaders });
    }

    const city = String(body.city).trim().slice(0, 100);
    const country = String(body.country).trim().slice(0, 100);
    const address = String(body.address).trim().slice(0, 500);
    const submittedCoordinates = coordinatesFromValues(body.latitude, body.longitude);
    const shopCoordinates = submittedCoordinates ?? await geocodePlace(`${address}, ${city}, ${country}`).catch(() => null);

    await db.insert(shops).values({
      name: String(body.name).trim().slice(0, 140),
      city,
      country,
      address,
      textures: String(body.textures).trim().slice(0, 200),
      specialties: String(body.specialties).trim().slice(0, 500),
      bookingUrl: typeof body.bookingUrl === "string" ? body.bookingUrl.trim().slice(0, 500) || null : null,
      // `rating` and `reviewCount` are deliberately not read from the request:
      // a shop cannot rate itself, those are set during review.
      photoUrl: normaliseUrl(body.photoUrl),
      photoCredit: typeof body.photoCredit === "string" ? body.photoCredit.trim().slice(0, 140) || null : null,
      contactEmail: String(body.contactEmail).trim().slice(0, 254),
      latitude: shopCoordinates?.latitude ?? null,
      longitude: shopCoordinates?.longitude ?? null,
    });

    return new Response(JSON.stringify({ message: "Your shop is in review for the Nomadic Ready directory." }), { status: 201, headers: jsonHeaders });
  }

  return new Response(JSON.stringify({ error: "Method not allowed." }), { status: 405, headers: jsonHeaders });
};

export const config: Config = { path: "/api/shops" };
