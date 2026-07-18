import { createScenario, listScenarios } from "@/lib/scenarios";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ scenarios: listScenarios() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: unknown; payload?: unknown };
    if (typeof body.name !== "string" || !body.name.trim() || body.payload === undefined) {
      return Response.json({ error: "A scenario name and payload are required." }, { status: 400 });
    }
    return Response.json({ scenario: createScenario(body.name, body.payload) }, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to save this scenario." }, { status: 400 });
  }
}
