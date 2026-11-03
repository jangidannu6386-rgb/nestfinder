import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { requireLandlord } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/tenants — list the logged-in landlord's tenants
export async function GET() {
  const auth = await requireLandlord();
  if ("error" in auth) return auth.error;

  const rows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.landlordId, auth.user.id))
    .orderBy(desc(tenants.createdAt));

  return Response.json(rows);
}

// POST /api/tenants — add a new tenant
export async function POST(req: Request) {
  const auth = await requireLandlord();
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const tenantName = String(body.tenantName ?? "").trim();
  const roomNumber = String(body.roomNumber ?? "").trim();
  const contactNumber = String(body.contactNumber ?? "").replace(/[\s-]/g, "");
  const monthlyRent = Number(body.monthlyRent);

  if (!tenantName || !roomNumber) {
    return Response.json({ error: "Tenant name and room number are required." }, { status: 400 });
  }
  if (!Number.isInteger(monthlyRent) || monthlyRent <= 0) {
    return Response.json({ error: "Monthly rent must be a positive whole number." }, { status: 400 });
  }
  if (!/^(\+91)?\d{10}$/.test(contactNumber)) {
    return Response.json({ error: "Contact number must be a valid 10-digit number." }, { status: 400 });
  }

  const [tenant] = await db
    .insert(tenants)
    .values({ landlordId: auth.user.id, tenantName, roomNumber, monthlyRent, contactNumber, rentStatus: "Pending" })
    .returning();

  return Response.json(tenant, { status: 201 });
}
