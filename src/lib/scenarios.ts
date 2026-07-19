import Database from "better-sqlite3";
import * as fs from "node:fs";
import * as path from "node:path";

export type SavedScenario = { id: number; name: string; payload: unknown; createdAt: string };

// Hard cap on the SQLite data volume (/app/data). Once the on-disk footprint
// reaches this, writes are refused so the mounted volume can't grow unbounded.
// Overridable via STORAGE_LIMIT_BYTES (used for testing the full-state path).
export const STORAGE_LIMIT_BYTES = Number(process.env.STORAGE_LIMIT_BYTES) || 1024 * 1024 * 1024; // 1 GB

// Thrown by createScenario when the data volume is at/over the limit.
export class StorageFullError extends Error {
  constructor() {
    super("Storage limit reached.");
    this.name = "StorageFullError";
  }
}

const databaseFile = path.join(process.cwd(), "data", "sentinel-va.db");
const dataDir = path.dirname(databaseFile);
fs.mkdirSync(dataDir, { recursive: true });
const sqlite = new Database(databaseFile);
sqlite.pragma("journal_mode = WAL");
sqlite.exec(`CREATE TABLE IF NOT EXISTS scenarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

// Sum the bytes of every file in the data dir (db + WAL/SHM sidecars) so the
// cap reflects the real volume footprint, not just the main db file.
function dataDirBytes(): number {
  let total = 0;
  for (const entry of fs.readdirSync(dataDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    try {
      total += fs.statSync(path.join(dataDir, entry.name)).size;
    } catch {
      // File may vanish (e.g. WAL checkpoint) mid-scan; ignore.
    }
  }
  return total;
}

export type StorageStatus = { bytesUsed: number; limitBytes: number; full: boolean };

export function storageStatus(): StorageStatus {
  const bytesUsed = dataDirBytes();
  return { bytesUsed, limitBytes: STORAGE_LIMIT_BYTES, full: bytesUsed >= STORAGE_LIMIT_BYTES };
}

export function listScenarios(): SavedScenario[] {
  return sqlite.prepare("SELECT id, name, payload, created_at AS createdAt FROM scenarios ORDER BY id DESC LIMIT 30").all().map((row) => {
    const record = row as { id: number; name: string; payload: string; createdAt: string };
    return { ...record, payload: JSON.parse(record.payload) };
  });
}

export function renameScenario(id: number, name: string): SavedScenario | undefined {
  const result = sqlite.prepare("UPDATE scenarios SET name = ? WHERE id = ?").run(name.trim().slice(0, 80), id);
  if (result.changes === 0) return undefined;
  const row = sqlite.prepare("SELECT id, name, payload, created_at AS createdAt FROM scenarios WHERE id = ?").get(id) as { id: number; name: string; payload: string; createdAt: string };
  return { ...row, payload: JSON.parse(row.payload) };
}

export function deleteScenario(id: number): boolean {
  return sqlite.prepare("DELETE FROM scenarios WHERE id = ?").run(id).changes > 0;
}

export function createScenario(name: string, payload: unknown): SavedScenario {
  if (dataDirBytes() >= STORAGE_LIMIT_BYTES) throw new StorageFullError();
  const result = sqlite.prepare("INSERT INTO scenarios (name, payload) VALUES (?, ?)").run(name.trim().slice(0, 80), JSON.stringify(payload));
  const row = sqlite.prepare("SELECT id, name, payload, created_at AS createdAt FROM scenarios WHERE id = ?").get(result.lastInsertRowid) as { id: number; name: string; payload: string; createdAt: string };
  return { ...row, payload: JSON.parse(row.payload) };
}
