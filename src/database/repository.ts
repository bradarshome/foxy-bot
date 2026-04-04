import fs from 'fs-extra';
import path from 'path';
import mongoose from 'mongoose';
import type { Database } from '../types/database.js';
import { logger } from '../utils/logger.js';

// Database interface
export interface IDatabase {
  read(): Promise<Database | null>;
  write(data: Database): Promise<void>;
}

// JSON File Database
export class JsonDatabase implements IDatabase {
  private data: Database = {} as Database;
  private filePath: string;
  private isWriting = false;
  private writePending = false;

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), 'database', fileName);
  }

  async read(): Promise<Database | null> {
    try {
      if (fs.existsSync(this.filePath)) {
        try {
          const raw = await fs.readFile(this.filePath, 'utf-8');
          this.data = JSON.parse(raw) as Database;
        } catch (parseError) {
          // Try backup
          const backupPath = `${this.filePath}.bak`;
          if (fs.existsSync(backupPath)) {
            logger.warn('DB', 'Main DB corrupted, restoring from backup');
            const raw = await fs.readFile(backupPath, 'utf-8');
            this.data = JSON.parse(raw) as Database;
            await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
          } else {
            logger.warn('DB', 'No backup found, creating fresh database');
            this.data = {} as Database;
            await this.write(this.data);
          }
        }
      } else {
        await fs.ensureDir(path.dirname(this.filePath));
        this.data = {} as Database;
        await this.write(this.data);
      }
      return this.data;
    } catch (error) {
      logger.error('DB', 'Failed to read database', error instanceof Error ? error : undefined);
      return null;
    }
  }

  async write(data: Database): Promise<void> {
    this.data = data;

    if (this.isWriting) {
      this.writePending = true;
      return;
    }

    this.isWriting = true;
    try {
      await fs.ensureDir(path.dirname(this.filePath));

      // Create backup before writing
      if (fs.existsSync(this.filePath)) {
        await fs.copyFile(this.filePath, `${this.filePath}.bak`);
      }

      if (Object.keys(this.data).length > 0) {
        await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
      }
    } catch (error) {
      logger.error('DB', 'Failed to write database', error instanceof Error ? error : undefined);
    } finally {
      this.isWriting = false;
      if (this.writePending) {
        this.writePending = false;
        await this.write(this.data);
      }
    }
  }
}

// MongoDB Database
export class MongoDatabase implements IDatabase {
  private url: string;
  private model: mongoose.Model<any> | null = null;
  private isConnecting = false;
  private isReconnecting = false;

  constructor(url: string) {
    this.url = url;

    mongoose.connection.on('disconnected', async () => {
      if (this.isReconnecting) return;
      this.isReconnecting = true;
      logger.warn('DB', 'MongoDB connection lost. Reconnecting in 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await this.connect();
    });
  }

  private async connect(retries = 5, delay = 2000): Promise<void> {
    if (mongoose.connection.readyState === 1 || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    while (retries > 0) {
      try {
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(this.url, {
            serverSelectionTimeoutMS: 5000,
          });
        }

        if (!this.model) {
          const schema = new mongoose.Schema({
            data: { type: Object, required: true, default: {} },
          });
          this.model = mongoose.models.data || mongoose.model('data', schema);
        }

        logger.success('DB', 'Successfully connected to MongoDB');
        this.isConnecting = false;
        this.isReconnecting = false;
        return;
      } catch (error) {
        logger.error('DB', `MongoDB connection failed: ${(error as Error).message}`);
        retries--;
        if (retries > 0) {
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    this.isConnecting = false;
    throw new Error('MongoDB connection failed after multiple attempts');
  }

  async read(): Promise<Database | null> {
    if (mongoose.connection.readyState !== 1 && !this.isConnecting) {
      await this.connect();
    }

    if (!this.model) return null;

    let doc = await this.model.findOne({});
    if (!doc) {
      doc = new this.model({ data: {} });
      await doc.save();
    }

    try {
      return typeof doc.data === 'string' ? JSON.parse(doc.data) : doc.data;
    } catch {
      return doc.data || null;
    }
  }

  async write(data: Database): Promise<void> {
    if (!data || !this.model) return;

    if (mongoose.connection.readyState !== 1 && !this.isConnecting) {
      await this.connect();
    }

    const safeData = JSON.stringify(data, (_key, value) => {
      if (typeof value === 'object' && value !== null && value._id) {
        return undefined;
      }
      return value;
    });

    await this.model.findOneAndUpdate({}, { data: safeData }, { upsert: true, new: true });
  }
}

// Factory function to create database instance
export function createDatabase(source: string): IDatabase {
  if (/^mongodb(\+srv)?:\/\//i.test(source)) {
    return new MongoDatabase(source);
  }
  return new JsonDatabase(source);
}
