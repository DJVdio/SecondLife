import {
  pgTable,
  varchar,
  text,
  integer,
  serial,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const lifeResults = pgTable("life_results", {
  id: serial("id").primaryKey(),
  shareId: varchar("share_id", { length: 24 }).notNull().unique(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  userName: varchar("user_name", { length: 128 }).notNull(),
  userAvatar: varchar("user_avatar", { length: 512 }),
  initialAttributes: jsonb("initial_attributes").notNull(),
  finalAttributes: jsonb("final_attributes").notNull(),
  deathAge: integer("death_age").notNull(),
  deathCause: varchar("death_cause", { length: 256 }).notNull(),
  epitaph: varchar("epitaph", { length: 512 }).notNull(),
  lifeRating: varchar("life_rating", { length: 2 }).notNull(),
  finalSummary: text("final_summary").notNull(),
  stageNarratives: jsonb("stage_narratives").notNull(),
  choicesMade: jsonb("choices_made").notNull(),
  keyEvents: jsonb("key_events").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
