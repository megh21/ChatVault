import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Set DATABASE_URL directly if needed
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgres://default:3aVlNlrAvYk7@ep-cold-hill-81569684.us-east-1.aws.neon.tech/neondb?sslmode=require";
}

neonConfig.webSocketConstructor = ws;

console.log('DB.ts - Using DATABASE_URL:', process.env.DATABASE_URL.substring(0, 20) + '...');

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });