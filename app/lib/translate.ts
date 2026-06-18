import "server-only";

export type ProductTranslations = {
  name_en: string;
  name_id: string;
  description_en: string;
  description_id: string;
};

// Gemini structured-output schema (OpenAPI subset, uppercase types)
const SCHEMA = {
  type: "OBJECT",
  properties: {
    name_en: { type: "STRING" },
    name_id: { type: "STRING" },
    description_en: { type: "STRING" },
    description_id: { type: "STRING" },
  },
  required: ["name_en", "name_id", "description_en", "description_id"],
  propertyOrdering: ["name_en", "name_id", "description_en", "description_id"],
};

const SYSTEM = `You localize bakery product listings between English (en) and Indonesian (id).
You are given a product name and description written in EITHER language. Detect the language and produce both the English and Indonesian versions.
Rules:
- Keep translations natural, concise, and appetizing — write like a real bakery menu, not a literal word-for-word translation.
- Preserve meaning. Do not invent details, prices, or ingredients that are not present.
- Keep product names short; translate them only when there is a natural equivalent, otherwise keep the original name.
- If the description is empty, return empty strings for both description fields.`;

// Translate one product into both languages using the Google Gemini API.
// Returns null if no API key is configured or the call fails, so callers can
// fall back gracefully (saving never breaks).
export async function translateProduct(input: {
  name: string;
  description: string;
}): Promise<ProductTranslations | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  name: input.name,
                  description: input.description,
                }),
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: SCHEMA,
        },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    return JSON.parse(text) as ProductTranslations;
  } catch {
    return null;
  }
}
