import type { Config } from "@netlify/functions";
import OpenAI from "openai";

const openai = new OpenAI();
const allowedImage = /^data:image\/(jpeg|png|webp);base64,/;

export default async (request: Request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  const body = await request.json().catch(() => null) as { image?: string; goals?: string; routine?: string } | null;
  if (!body?.image || !allowedImage.test(body.image) || body.image.length > 7_000_000) {
    return Response.json({ error: "Add a JPG, PNG, or WebP photo under 5 MB." }, { status: 400 });
  }

  const goals = String(body.goals ?? "Open to recommendations").slice(0, 500);
  const routine = String(body.routine ?? "Not provided").slice(0, 300);

  const response = await openai.responses.create({
    model: "gpt-5.4-mini",
    input: [{
      role: "user",
      content: [
        {
          type: "input_text",
          text: `You are The Nomadic Barber's respectful haircut consultation assistant. Analyze only visible hair-related details: apparent curl pattern range, density, current length, growth direction, and face-shape-neutral style considerations. Never infer race, ethnicity, gender identity, age, health, attractiveness, or other sensitive traits. Do not diagnose scalp conditions. The client's goals are: ${goals}. Their routine is: ${routine}. Return concise JSON with keys texture_observation, three_styles (array of exactly 3 objects with name, why, barber_brief), maintenance, consultation_note. Be careful that texture identification from one photo is an estimate and recommend confirming with a barber in person.`,
        },
        { type: "input_image", image_url: body.image, detail: "low" },
      ],
    }],
    text: { format: { type: "json_object" } },
  });

  const result = JSON.parse(response.output_text);
  return Response.json(result, {
    headers: { "cache-control": "no-store" },
  });
};

export const config: Config = { path: "/api/style-consult" };
