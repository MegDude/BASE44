export default async function handler(request: Request) {
  if (!["GET", "POST"].includes(request.method)) {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return Response.json({
    status: "ready",
    message: "Pending survey export retry endpoint is available. Wire this to stored SurveyExportLog rows in the production database.",
  });
}
