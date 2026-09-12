export function GET() {
  return Response.json(
    { ok: true, data: { status: "healthy" }, requestId: crypto.randomUUID() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
