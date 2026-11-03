CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY,
	"landlord_id" text NOT NULL,
	"tenant_name" text NOT NULL,
	"room_number" text NOT NULL,
	"monthly_rent" integer NOT NULL,
	"contact_number" text NOT NULL,
	"rent_status" text DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "tenants_landlord_id_idx" ON "tenants" ("landlord_id");