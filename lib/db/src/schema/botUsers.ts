import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const botUsersTable = pgTable("bot_users", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username").notNull().default(""),
  firstName: text("first_name").notNull().default(""),
  points: integer("points").notNull().default(0),
  vipLevel: integer("vip_level").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredById: integer("referred_by_id"),
  shareCount: integer("share_count").notNull().default(0),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  lastWheelSpin: timestamp("last_wheel_spin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBotUserSchema = createInsertSchema(botUsersTable).omit({ id: true, createdAt: true });
export type InsertBotUser = z.infer<typeof insertBotUserSchema>;
export type BotUser = typeof botUsersTable.$inferSelect;
