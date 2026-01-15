// Database factory to easily switch between in-memory and SQLite
import { db as memoryDb } from "./database";

// For local development, uncomment the lines below and install better-sqlite3
// import { sqliteDb } from './database-sqlite';
// export const db = sqliteDb;

// For cloud/containerized environments, use in-memory database
export const db = memoryDb;

// Environment-based selection (optional)
// export const db = process.env.NODE_ENV === 'production' ? sqliteDb : memoryDb;
