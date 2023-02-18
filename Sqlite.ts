import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
dotenv.config();
const db = new Database(process.env.SQLITE_SOURCE || "");

export { db as SQLite };