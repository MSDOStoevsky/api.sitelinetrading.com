import Database from 'better-sqlite3';
const db = new Database(process.env.SQLITE_SOURCE || "");
import * as dotenv from 'dotenv';
dotenv.config();

export { db as SQLite };