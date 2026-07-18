import Database from "better-sqlite3";
import * as fs from "node:fs";
import * as path from "node:path";

export type SavedScenario = { id: number; name: string; payload: unknown; createdAt: string };

const databaseFile = path.join(process.cwd(), "data", "sentinel-va.db");
fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
const sqlite = new Database(databaseFile);
sqlite.pragma("journal_mode = WAL");
sqlite.exec(`CREATE TABLE IF NOT EXISTS scenarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

export function listScenarios(): SavedScenario[] {
  return sqlite.prepare("SELECT id, name, payload, created_at AS createdAt FROM scenarios ORDER BY id DESC LIMIT 30").all().map((row) => {
    const record = row as { id: number; name: string; payload: string; createdAt: string };
    return { ...record, payload: JSON.parse(record.payload) };
  });
}

export function createScenario(name: string, payload: unknown): SavedScenario {
  const result = sqlite.prepare("INSERT INTO scenarios (name, payload) VALUES (?, ?)").run(name.trim().slice(0, 80), JSON.stringify(payload));
  const row = sqlite.prepare("SELECT id, name, payload, created_at AS createdAt FROM scenarios WHERE id = ?").get(result.lastInsertRowid) as { id: number; name: string; payload: string; createdAt: string };
  return { ...row, payload: JSON.parse(row.payload) };
}
