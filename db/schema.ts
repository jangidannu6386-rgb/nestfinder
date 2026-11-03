import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";

// One row per tenant, owned by the landlord (Netlify Identity user id) who added them.
export const tenants = pgTable(
  "tenants",
  {
    id: serial().primaryKey(),
    landlordId: text("landlord_id").notNull(),
    tenantName: text("tenant_name").notNull(),
    roomNumber: text("room_number").notNull(),
    monthlyRent: integer("monthly_rent").notNull(),
    contactNumber: text("contact_number").notNull(),
    rentStatus: text("rent_status").notNull().default("Pending"), // 'Paid' | 'Pending'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("tenants_landlord_id_idx").on(t.landlordId)],
);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
