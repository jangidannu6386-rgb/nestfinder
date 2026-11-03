import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { requireLandlord } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// PATCH /api/tenants/:id — update rent status ('Paid' | 'Pending')
export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireLandlord();
  if ("error" in auth) return auth.error;

  const id = Number(params.id);
  if (!Number.isInteger(id)) return Response.json({ error: "Invalid tenant id." }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const rentStatus = body?.rentStatus;
  if (rentStatus !== "Paid" && rentStatus !== "Pending") {
    return Response.json({ error: "rentStatus must be 'Paid' or 'Pending'." }, { status: 400 });
  }

  const [updated] = await db
    .update(tenants)
    .set({ rentStatus, updatedAt: new Date() })
    .where(and(eq(tenants.id, id), eq(tenants.landlordId, auth.user.id)))
    .returning();

  if (!updated) return Response.json({ error: "Tenant not found." }, { status: 404 });
  return Response.json(updated);
}

// DELETE /api/tenants/:id — remove a tenant
export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireLandlord();
  if ("error" in auth) return auth.error;

  const id = Number(params.id);
  if (!Number.isInteger(id)) return Response.json({ error: "Invalid tenant id." }, { status: 400 });

  const [deleted] = await db
    .delete(tenants)
    .where(and(eq(tenants.id, id), eq(tenants.landlordId, auth.user.id)))
    .returning({ id: tenants.id });

  if (!deleted) return Response.json({ error: "Tenant not found." }, { status: 404 });
  return Response.json({ ok: true });
}
