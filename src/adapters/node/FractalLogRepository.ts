import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { FractalLogEntry } from '../../core/domain/types';
import { IFractalLogRepository } from '../../core/ports';

const DB_PATH = path.resolve(process.cwd(), 'data', 'fractals.db');

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS fractal_logs (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp        TEXT    NOT NULL,
    params           TEXT    NOT NULL,
    generation_time_ms INTEGER,
    output_path      TEXT,
    total_branches   INTEGER
  )
`;

type FractalLogRow = {
  id: number;
  timestamp: string;
  params: string;
  generation_time_ms: number;
  output_path: string;
  total_branches: number;
};

export class FractalLogRepository implements IFractalLogRepository {
  private db: Database.Database;

  constructor(dbPath: string = DB_PATH) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new Database(dbPath);
    this.db.exec(CREATE_TABLE_SQL);
  }

  insert(entry: FractalLogEntry): number {
    const stmt = this.db.prepare(`
      INSERT INTO fractal_logs (timestamp, params, generation_time_ms, output_path, total_branches)
      VALUES (@timestamp, @params, @generation_time_ms, @output_path, @total_branches)
    `);
    const result = stmt.run({
      timestamp: entry.timestamp,
      params: JSON.stringify(entry.params),
      generation_time_ms: entry.generationTimeMs,
      output_path: entry.outputPath,
      total_branches: entry.totalBranchesDrawn,
    });
    return result.lastInsertRowid as number;
  }

  findRecent(limit: number): FractalLogEntry[] {
    const rows = this.db
      .prepare('SELECT * FROM fractal_logs ORDER BY id DESC LIMIT ?')
      .all(limit) as FractalLogRow[];
    return rows.map(this.rowToEntry);
  }

  findById(id: number): FractalLogEntry | null {
    const row = this.db.prepare('SELECT * FROM fractal_logs WHERE id = ?').get(id) as
      FractalLogRow | undefined;
    return row ? this.rowToEntry(row) : null;
  }

  private rowToEntry(row: FractalLogRow): FractalLogEntry {
    return {
      id: row.id,
      timestamp: row.timestamp,
      params: JSON.parse(row.params),
      generationTimeMs: row.generation_time_ms,
      outputPath: row.output_path,
      totalBranchesDrawn: row.total_branches,
    };
  }
}
