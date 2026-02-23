import Replicate from "replicate";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing ID" }, { status: 400 });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    const prediction = await replicate.predictions.get(id);

    let url = "";

    if (prediction.output) {
      url = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;
    }

    return Response.json({
      status: prediction.status,
      outputUrl: url
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
