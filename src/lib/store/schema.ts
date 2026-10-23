import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** 章节进度 */
export const progress = sqliteTable("progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chapterSlug: text("chapter_slug").notNull().unique(),
  completedAt: text("completed_at").notNull(),
});

/** 错题本 */
export const mistakes = sqliteTable("mistakes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chapterSlug: text("chapter_slug").notNull(),
  questionId: text("question_id").notNull(),
  wrongCount: integer("wrong_count").notNull().default(1),
  lastWrongAt: text("last_wrong_at").notNull(),
  resolved: integer("resolved").notNull().default(0),
});

/** 连续打卡（每天一行） */
export const streak = sqliteTable("streak", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  count: integer("count").notNull().default(0),
});

export type Progress = typeof progress.$inferSelect;
export type Mistake = typeof mistakes.$inferSelect;
export type Streak = typeof streak.$inferSelect;
