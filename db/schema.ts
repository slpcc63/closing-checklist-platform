import { boolean, date, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const memberRole = pgEnum("member_role", ["owner", "admin", "manager", "employee"]);
export const itemStatus = pgEnum("item_status", ["open", "done", "exception"]);
export const runStatus = pgEnum("run_status", ["active", "ready", "closed", "manager_review"]);
export const participantStatus = pgEnum("participant_status", ["locked", "ready", "requested", "closed", "fallback"]);
export const squareEnvironment = pgEnum("square_environment", ["sandbox", "production"]);
export const attemptOutcome = pgEnum("attempt_outcome", ["requested", "succeeded", "rejected", "failed"]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#e84d25"),
  timezone: text("timezone").notNull().default("America/Los_Angeles"),
  createdByUserId: text("created_by_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("organizations_slug_key").on(table.slug)]);

export const organizationMembers = pgTable("organization_members", {
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  role: memberRole("role").notNull().default("employee"),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.organizationId, table.userId] }),
  index("organization_members_user_idx").on(table.userId),
]);

export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  timezone: text("timezone").notNull(),
  squareLocationId: text("square_location_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("locations_organization_idx").on(table.organizationId),
  uniqueIndex("locations_org_square_key").on(table.organizationId, table.squareLocationId),
]);

export const squareConnections = pgTable("square_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  merchantId: text("merchant_id").notNull(),
  environment: squareEnvironment("environment").notNull(),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
  authorizedScopes: text("authorized_scopes").array().notNull().default([]),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  connectedByUserId: text("connected_by_user_id").notNull(),
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("square_connections_organization_key").on(table.organizationId),
  uniqueIndex("square_connections_environment_merchant_key").on(table.environment, table.merchantId),
]);

export const teamMemberMappings = pgTable("team_member_mappings", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  locationId: uuid("location_id").references(() => locations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  squareTeamMemberId: text("square_team_member_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("team_mapping_org_user_key").on(table.organizationId, table.userId),
  uniqueIndex("team_mapping_org_square_key").on(table.organizationId, table.squareTeamMemberId),
]);

export const checklistTemplates = pgTable("checklist_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  version: integer("version").notNull().default(1),
  active: boolean("active").notNull().default(true),
  createdByUserId: text("created_by_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("templates_org_active_idx").on(table.organizationId, table.active)]);

export const templateItems = pgTable("template_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").notNull().references(() => checklistTemplates.id, { onDelete: "cascade" }),
  station: text("station").notNull(),
  timeBlock: text("time_block").notNull(),
  title: text("title").notNull(),
  required: boolean("required").notNull().default(true),
  dayOfWeek: integer("day_of_week"),
  sortOrder: integer("sort_order").notNull(),
}, (table) => [index("template_items_template_sort_idx").on(table.templateId, table.sortOrder)]);

export const checklistRuns = pgTable("checklist_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  locationId: uuid("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").notNull().references(() => checklistTemplates.id),
  businessDate: date("business_date").notNull(),
  status: runStatus("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("runs_location_date_key").on(table.locationId, table.businessDate),
  index("runs_org_status_date_idx").on(table.organizationId, table.status, table.businessDate),
]);

export const runItems = pgTable("run_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  runId: uuid("run_id").notNull().references(() => checklistRuns.id, { onDelete: "cascade" }),
  templateItemId: uuid("template_item_id").references(() => templateItems.id),
  station: text("station").notNull(),
  timeBlock: text("time_block").notNull(),
  title: text("title").notNull(),
  required: boolean("required").notNull(),
  status: itemStatus("status").notNull().default("open"),
  exceptionReason: text("exception_reason"),
  resolvedByUserId: text("resolved_by_user_id"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(0),
}, (table) => [index("run_items_run_required_status_idx").on(table.runId, table.required, table.status)]);

export const runParticipants = pgTable("run_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  runId: uuid("run_id").notNull().references(() => checklistRuns.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  squareTimecardId: text("square_timecard_id").notNull(),
  squareTimecardVersion: integer("square_timecard_version").notNull(),
  clockOutStatus: participantStatus("clock_out_status").notNull().default("locked"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("run_participants_run_user_key").on(table.runId, table.userId),
  uniqueIndex("run_participants_timecard_key").on(table.squareTimecardId),
]);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  runId: uuid("run_id").references(() => checklistRuns.id, { onDelete: "cascade" }),
  actorUserId: text("actor_user_id"),
  eventType: text("event_type").notNull(),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("audit_org_run_occurred_idx").on(table.organizationId, table.runId, table.occurredAt)]);

export const clockOutAttempts = pgTable("clock_out_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  runParticipantId: uuid("run_participant_id").notNull().references(() => runParticipants.id, { onDelete: "cascade" }),
  confirmationNonceHash: text("confirmation_nonce_hash").notNull(),
  outcome: attemptOutcome("outcome").notNull(),
  failureCode: text("failure_code"),
  squareRequestId: text("square_request_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("clockout_nonce_key").on(table.confirmationNonceHash),
  index("clockout_participant_created_idx").on(table.runParticipantId, table.createdAt),
]);
