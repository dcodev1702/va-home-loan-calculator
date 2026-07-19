import { createScenario, deleteScenario, listScenarios, renameScenario, storageStatus, StorageFullError } from "@/lib/scenarios";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ scenarios: listScenarios(), storage: storageStatus() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: unknown; payload?: unknown };
    if (typeof body.name !== "string" || !body.name.trim() || body.payload === undefined) {
      return Response.json({ error: "A scenario name and payload are required." }, { status: 400 });
    }
    return Response.json({ scenario: createScenario(body.name, body.payload), storage: storageStatus() }, { status: 201 });
  } catch (error) {
    if (error instanceof StorageFullError) {
      return Response.json({ error: "Storage is full — the 1 GB local database limit has been reached. Delete saved scenarios to free space.", storage: storageStatus() }, { status: 507 });
    }
    return Response.json({ error: "Unable to save this scenario." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { id?: unknown; name?: unknown };
    if (!Number.isInteger(body.id) || typeof body.name !== "string" || !body.name.trim()) {
      return Response.json({ error: "A scenario id and name are required." }, { status: 400 });
    }
    const scenario = renameScenario(body.id as number, body.name);
    return scenario ? Response.json({ scenario }) : Response.json({ error: "Scenario not found." }, { status: 404 });
  } catch {
    return Response.json({ error: "Unable to rename this scenario." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json() as { id?: unknown };
    if (!Number.isInteger(body.id)) return Response.json({ error: "A scenario id is required." }, { status: 400 });
    return deleteScenario(body.id as number) ? Response.json({ deleted: true }) : Response.json({ error: "Scenario not found." }, { status: 404 });
  } catch {
    return Response.json({ error: "Unable to delete this scenario." }, { status: 400 });
  }
}
