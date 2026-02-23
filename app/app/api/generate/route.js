import Replicate from "replicate";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get("image");

    if (!file) {
      return new Response("Missing image", { status: 400 });
    }

    // Convert upload to base64 data URL (Replicate accepts data URLs for many models)
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = file.type || "image/jpeg";
    const imageDataUrl = `data:${mime};base64,${base64}`;

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    // IMPORTANT: Set this in Vercel env vars
    // Example format: "owner/model:version"
    const modelRef = process.env.REPLICATE_MODEL_REF;

    if (!modelRef) {
      return new Response("Missing REPLICATE_MODEL_REF env var", { status: 500 });
    }

    // 🔒 Locked F1 theme prompts (edit anytime in Vercel env vars)
    const EVENT_STYLE =
      process.env.EVENT_STYLE_PROMPT ||
      "clean vector cartoon portrait, smooth shading, consistent line weight, high detail, flattering likeness";
    const EVENT_THEME =
      process.env.EVENT_THEME_PROMPT ||
      "Formula 1 inspired elegant red and black theme, subtle racing graphics, checkered flag accents, studio background";
    const NEGATIVE =
      process.env.NEGATIVE_PROMPT ||
      "text, watermark, logo, blurry, low quality, deformed, extra fingers, bad anatomy";

    // NOTE: Input keys vary by model. This is the most common pattern.
    // If your model uses different keys, we’ll adjust after you pick the model.
    const prediction = await replicate.predictions.create({
      model: modelRef,
      input: {
        image: imageDataUrl,
        prompt: `${EVENT_STYLE}. ${EVENT_THEME}.`,
        negative_prompt: NEGATIVE
      }
    });

    return Response.json({ predictionId: prediction.id });
  } catch (err) {
    return new Response(err?.message || "Server error", { status: 500 });
  }
}
