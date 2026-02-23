import Replicate from "replicate";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get("image");

    if (!file) {
      return new Response("No image uploaded", { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const mime = file.type || "image/jpeg";

    const image = `data:${mime};base64,${base64}`;

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    const model = process.env.REPLICATE_MODEL_REF;

    if (!model) {
      return new Response("Missing model ref", { status: 500 });
    }

    const prediction = await replicate.predictions.create({
      model,
      input: {
        image,
        prompt:
          "F1 inspired cartoon portrait, elegant red and black racing theme, professional illustration, smooth shading",
        negative_prompt:
          "blurry, watermark, low quality, deformed, extra fingers"
      }
    });

    return Response.json({
      predictionId: prediction.id
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
