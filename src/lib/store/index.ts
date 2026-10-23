import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and } from "drizzle-orm";
import { mistakes, progress, streak } from "./schema";

/**
 * store 接口：进度 / 错题本 / 连续打卡统一入口。
 * B 阶段用 SQLite 实现；C 阶段可替换为云端 API，UI 与刷题逻辑不感知存储实现。
 */
export interface Store {
  markChapterComplete(slug: string): Promise<void>;
  getCompletedChapters(): Promise<string[]>;
  recordAnswer(
    chapterSlug: string,
    questionId: string,
    correct: boolean,
  ): Promise<void>;
  getMistakes(): Promise<{ chapterSlug: string; questionId: string; wrongCount: number }[]>;
  recordActivity(): Promise<number>; // 返回当前连续打卡天数
  getStreak(): Promise<number>;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createSqliteStore(dbPath = "data/d2a.db"): Store {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite);

  // 建表（幂等）
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_slug TEXT NOT NULL UNIQUE,
      completed_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS mistakes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_slug TEXT NOT NULL,
      question_id TEXT NOT NULL,
      wrong_count INTEGER NOT NULL DEFAULT 1,
      last_wrong_at TEXT NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS streak (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      count INTEGER NOT NULL DEFAULT 0
    );
  `);

  return {
    async markChapterComplete(slug) {
      await db
        .insert(progress)
        .values({ chapterSlug: slug, completedAt: new Date().toISOString() })
        .onConflictDoUpdate({
          target: progress.chapterSlug,
          set: { completedAt: new Date().toISOString() },
        });
    },

    async getCompletedChapters() {
      const rows = await db.select().from(progress);
      return rows.map((r) => r.chapterSlug);
    },

    async recordAnswer(chapterSlug, questionId, correct) {
      if (!correct) {
        const existing = await db
          .select()
          .from(mistakes)
          .where(
            and(
              eq(mistakes.chapterSlug, chapterSlug),
              eq(mistakes.questionId, questionId),
            ),
          );
        const row = existing[0];
        if (row) {
          await db
            .update(mistakes)
            .set({ wrongCount: row.wrongCount + 1, lastWrongAt: new Date().toISOString() })
            .where(eq(mistakes.id, row.id));
        } else {
          await db.insert(mistakes).values({
            chapterSlug,
            questionId,
            wrongCount: 1,
            lastWrongAt: new Date().toISOString(),
            resolved: 0,
          });
        }
      } else {
        // 答对则标记已解决
        await db
          .update(mistakes)
          .set({ resolved: 1 })
          .where(
            and(
              eq(mistakes.chapterSlug, chapterSlug),
              eq(mistakes.questionId, questionId),
            ),
          );
      }
    },

    async getMistakes() {
      const rows = await db
        .select()
        .from(mistakes)
        .where(eq(mistakes.resolved, 0));
      return rows.map((r) => ({
        chapterSlug: r.chapterSlug,
        questionId: r.questionId,
        wrongCount: r.wrongCount,
      }));
    },

    async recordActivity() {
      const date = today();
      const existing = await db
        .select()
        .from(streak)
        .where(eq(streak.date, date));
      const row = existing[0];
      if (row) {
        await db
          .update(streak)
          .set({ count: row.count + 1 })
          .where(eq(streak.id, row.id));
      } else {
        await db.insert(streak).values({ date, count: 1 });
      }
      return this.getStreak();
    },

    async getStreak() {
      const rows = await db.select().from(streak).orderBy(streak.date);
      let days = 0;
      // 从今天往前数连续天数
      const dates = new Set(rows.map((r) => r.date));
      const d = new Date();
      for (;;) {
        const key = d.toISOString().slice(0, 10);
        if (dates.has(key)) {
          days += 1;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
      return days;
    },
  };
}

// 单例（开发环境）
let _store: Store | undefined;
export function getStore(): Store {
  if (!_store) _store = createSqliteStore();
  return _store;
}
