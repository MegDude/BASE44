import { answerAskMap, parseAskMapIntent } from "@/lib/intelligence/askMapService";

export { answerAskMap, parseAskMapIntent };

async function readPayload(request: any) {
  if (request?.json) return request.json();
  if (request?.body && typeof request.body === "object") return request.body;
  return request || {};
}

export default async function handler(request: any) {
  const payload = await readPayload(request);
  const answer = await answerAskMap(payload);
  const body = JSON.stringify(answer);

  if (typeof Response !== "undefined") {
    return new Response(body, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { statusCode: 200, body };
}
