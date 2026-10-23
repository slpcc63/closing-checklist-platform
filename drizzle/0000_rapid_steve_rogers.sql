CREATE TYPE "public"."attempt_outcome" AS ENUM('requested', 'succeeded', 'rejected', 'failed');--> statement-breakpoint
CREATE TYPE "public"."item_status" AS ENUM('open', 'done', 'exception');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'manager', 'employee');--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('locked', 'ready', 'requested', 'closed', 'fallback');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('active', 'ready', 'closed', 'manager_review');--> statement-breakpoint
CREATE TYPE "public"."square_environment" AS ENUM('sandbox', 'production');--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"run_id" uuid,
	"actor_user_id" text,
	"event_type" text NOT NULL,
	"entity_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"status" "run_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "checklist_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clock_out_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_participant_id" uuid NOT NULL,
	"confirmation_nonce_hash" text NOT NULL,
	"outcome" "attempt_outcome" NOT NULL,
	"failure_code" text,
	"square_request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"timezone" text NOT NULL,
	"square_location_id" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"organization_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "member_role" DEFAULT 'employee' NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_members_organization_id_user_id_pk" PRIMARY KEY("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"primary_color" text DEFAULT '#e84d25' NOT NULL,
	"timezone" text DEFAULT 'America/Los_Angeles' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "run_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"template_item_id" uuid,
	"station" text NOT NULL,
	"time_block" text NOT NULL,
	"title" text NOT NULL,
	"required" boolean NOT NULL,
	"status" "item_status" DEFAULT 'open' NOT NULL,
	"exception_reason" text,
	"resolved_by_user_id" text,
	"resolved_at" timestamp with time zone,
	"revision" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "run_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"square_timecard_id" text NOT NULL,
	"square_timecard_version" integer NOT NULL,
	"clock_out_status" "participant_status" DEFAULT 'locked' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "square_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"merchant_id" text NOT NULL,
	"environment" "square_environment" NOT NULL,
	"access_token_encrypted" text NOT NULL,
	"refresh_token_encrypted" text NOT NULL,
	"authorized_scopes" text[] DEFAULT '{}' NOT NULL,
	"expires_at" timestamp with time zone,
	"connected_by_user_id" text NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_member_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"location_id" uuid,
	"user_id" text NOT NULL,
	"square_team_member_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"station" text NOT NULL,
	"time_block" text NOT NULL,
	"title" text NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"day_of_week" integer,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_run_id_checklist_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."checklist_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_runs" ADD CONSTRAINT "checklist_runs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_runs" ADD CONSTRAINT "checklist_runs_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_runs" ADD CONSTRAINT "checklist_runs_template_id_checklist_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."checklist_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clock_out_attempts" ADD CONSTRAINT "clock_out_attempts_run_participant_id_run_participants_id_fk" FOREIGN KEY ("run_participant_id") REFERENCES "public"."run_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_items" ADD CONSTRAINT "run_items_run_id_checklist_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."checklist_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_items" ADD CONSTRAINT "run_items_template_item_id_template_items_id_fk" FOREIGN KEY ("template_item_id") REFERENCES "public"."template_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_participants" ADD CONSTRAINT "run_participants_run_id_checklist_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."checklist_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "square_connections" ADD CONSTRAINT "square_connections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member_mappings" ADD CONSTRAINT "team_member_mappings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member_mappings" ADD CONSTRAINT "team_member_mappings_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_items" ADD CONSTRAINT "template_items_template_id_checklist_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."checklist_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_org_run_occurred_idx" ON "audit_events" USING btree ("organization_id","run_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "runs_location_date_key" ON "checklist_runs" USING btree ("location_id","business_date");--> statement-breakpoint
CREATE INDEX "runs_org_status_date_idx" ON "checklist_runs" USING btree ("organization_id","status","business_date");--> statement-breakpoint
CREATE INDEX "templates_org_active_idx" ON "checklist_templates" USING btree ("organization_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "clockout_nonce_key" ON "clock_out_attempts" USING btree ("confirmation_nonce_hash");--> statement-breakpoint
CREATE INDEX "clockout_participant_created_idx" ON "clock_out_attempts" USING btree ("run_participant_id","created_at");--> statement-breakpoint
CREATE INDEX "locations_organization_idx" ON "locations" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_org_square_key" ON "locations" USING btree ("organization_id","square_location_id");--> statement-breakpoint
CREATE INDEX "organization_members_user_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "run_items_run_required_status_idx" ON "run_items" USING btree ("run_id","required","status");--> statement-breakpoint
CREATE UNIQUE INDEX "run_participants_run_user_key" ON "run_participants" USING btree ("run_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "run_participants_timecard_key" ON "run_participants" USING btree ("square_timecard_id");--> statement-breakpoint
CREATE UNIQUE INDEX "square_connections_organization_key" ON "square_connections" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "square_connections_environment_merchant_key" ON "square_connections" USING btree ("environment","merchant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_mapping_org_user_key" ON "team_member_mappings" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_mapping_org_square_key" ON "team_member_mappings" USING btree ("organization_id","square_team_member_id");--> statement-breakpoint
CREATE INDEX "template_items_template_sort_idx" ON "template_items" USING btree ("template_id","sort_order");