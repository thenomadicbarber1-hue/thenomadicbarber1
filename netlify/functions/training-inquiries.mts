import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { trainingInquiries } from "../../db/schema.js";

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

// The two decks the program runs from, and the three ways a session is delivered.
// Anything outside these lists is a malformed submission rather than a new option.
const tracks = ["corporate", "hotel"] as const;
const formats = ["onsite", "virtual", "either"] as const;

const trackNames: Record<string, string> = {
  corporate: "Corporate & HR",
  hotel: "Hotels & Concierge",
};

function text(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function optionalText(value: unknown, limit: number): string | null {
  return text(value, limit) || null;
}

// One @ with something either side of it, and a dot in the domain. Anything
// stricter rejects real addresses; anything looser lets a typo through as a lead
// that can never be answered.
function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// A roomful, not a stadium. Out-of-range or non-numeric group sizes are dropped
// rather than rejected, so a typo in an optional field cannot lose the enquiry.
function groupSize(value: unknown): number | null {
  const size = Math.round(Number(value));
  if (!Number.isFinite(size) || size < 1 || size > 2000) return null;
  return size;
}

export default async (request: Request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), { status: 405, headers: jsonHeaders });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  // `website` is the honeypot field: hidden from people, filled in by bots.
  if (!body || body.website) {
    return new Response(JSON.stringify({ error: "Invalid submission." }), { status: 400, headers: jsonHeaders });
  }

  const organization = text(body.organization, 160);
  const contactName = text(body.contactName, 140);
  const contactEmail = text(body.contactEmail, 254);
  const track = text(body.track, 24).toLowerCase();
  const format = text(body.format, 24).toLowerCase();

  if (!organization || !contactName || !contactEmail) {
    return new Response(JSON.stringify({ error: "Add your organization, your name, and an email we can reply to." }), { status: 400, headers: jsonHeaders });
  }
  if (!validEmail(contactEmail)) {
    return new Response(JSON.stringify({ error: "That email address looks incomplete. Check it and send again." }), { status: 400, headers: jsonHeaders });
  }
  if (!tracks.includes(track as typeof tracks[number]) || !formats.includes(format as typeof formats[number])) {
    return new Response(JSON.stringify({ error: "Choose a training track and a delivery format." }), { status: 400, headers: jsonHeaders });
  }

  try {
    await db.insert(trainingInquiries).values({
      organization,
      contactName,
      contactEmail,
      phone: optionalText(body.phone, 40),
      track,
      format,
      groupSize: groupSize(body.groupSize),
      city: optionalText(body.city, 120),
      country: optionalText(body.country, 100),
      targetTiming: optionalText(body.targetTiming, 120),
      notes: optionalText(body.notes, 2000),
      // `status` is deliberately not read from the request: follow-up state is
      // set during review, not by whoever submitted the form.
    });
  } catch {
    return new Response(JSON.stringify({ error: "We couldn't save that request. Email thenomadicbarber1@gmail.com and it will be picked up directly." }), { status: 502, headers: jsonHeaders });
  }

  return new Response(JSON.stringify({
    message: `Your ${trackNames[track]} session request is in. DeWayne replies to training enquiries within two business days.`,
  }), { status: 201, headers: jsonHeaders });
};

export const config: Config = { path: "/api/training-inquiries" };
