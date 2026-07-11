import * as fs from 'fs/promises';
import * as path from 'path';
import { FractalLogEntry } from '../../core/domain/types';
import { IFractalLogRepository, ILoggerService } from '../../core/ports';

const LOGS_DIR = path.resolve(process.cwd(), 'logs');

export class LoggerService implements ILoggerService {
  constructor(private readonly repository: IFractalLogRepository) {}

  async log(entry: FractalLogEntry): Promise<void> {
    const id = this.repository.insert(entry);
    const entryWithId = { ...entry, id };

    await fs.mkdir(LOGS_DIR, { recursive: true });
    const safeTimestamp = entry.timestamp.replace(/[:.]/g, '-');
    const logPath = path.join(LOGS_DIR, `fractal-${safeTimestamp}.json`);
    await fs.writeFile(logPath, JSON.stringify(entryWithId, null, 2));
  }

  async getRecent(limit: number): Promise<FractalLogEntry[]> {
    return this.repository.findRecent(limit);
  }
}
