import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { and, eq } from "drizzle-orm";
import { mistakes, progress, streak } from "./schema";

/**
 * store 接口：进度 / 错题本 / 连续打卡统一入口。
 * B 阶段本地 SQLite；设置 DATABASE_URL 后切 Turso（托管 SQLite）；
 * C 阶段可替换为云端 API，UI 与刷题逻辑不感知存储实现。
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
  recordActivity(): Promise<number>;
  getStreak(): Promise<number>;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeStore(db: any): Store {
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
      return rows.map((r: { chapterSlug: string }) => r.chapterSlug);
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
            .set({
              wrongCount: row.wrongCount + 1,
              lastWrongAt: new Date().toISOString(),
            })
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
      return rows.map(
        (r: { chapterSlug: string; questionId: string; wrongCount: number }) => ({
          chapterSlug: r.chapterSlug,
          questionId: r.questionId,
          wrongCount: r.wrongCount,
        }),
      );
    },

    async recordActivity() {
      const date = today();
      const existing = await db
        .select()
        .from(streak)
        .where(eq(streak.date, date));
      const row = existing[0];
      if (row) {
        await db.update(streak).set({ count: row.count + 1 }).where(eq(streak.id, row.id));
      } else {
        await db.insert(streak).values({ date, count: 1 });
      }
      return this.getStreak();
    },

    async getStreak() {
      const rows = await db.select().from(streak).orderBy(streak.date);
      let days = 0;
      const dates = new Set(rows.map((r: { date: string }) => r.date));
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

const DDL = `
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
`;

function createSqliteStore(dbPath = "data/d2a.db"): Store {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  const db = drizzleSqlite(sqlite);
  sqlite.exec(DDL);
  return makeStore(db);
}

function createLibsqlStore(url: string, authToken?: string): Store {
  const client = createClient({ url, authToken });
  const db = drizzleLibsql(client);
  void (async () => {
    for (const stmt of DDL.split(";").map((s) => s.trim()).filter(Boolean)) {
      await client.execute(stmt);
    }
  })();
  return makeStore(db);
}

// 单例
let _store: Store | undefined;
export function getStore(): Store {
  if (!_store) {
    const url = process.env.DATABASE_URL;
    _store = url
      ? createLibsqlStore(url, process.env.DATABASE_AUTH_TOKEN)
      : createSqliteStore();
  }
  return _store;
}
