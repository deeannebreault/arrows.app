#!/usr/bin/env node
/**
 * Run once to create the collab_sessions table.
 * Usage: node migrate.js
 * Render: set as a one-off job or run manually via Render Shell.
 */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS collab_sessions (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      diagram_name TEXT NOT NULL DEFAULT 'Untitled',
      graph_data   JSONB NOT NULL DEFAULT '{}',
      permission   TEXT NOT NULL DEFAULT 'editor' CHECK (permission IN ('viewer','editor','admin')),
      created_by   TEXT NOT NULL DEFAULT 'anonymous',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      access_count INTEGER NOT NULL DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ LANGUAGE plpgsql
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS set_updated_at ON collab_sessions;
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON collab_sessions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at()
  `);

  console.log('Migration complete.');
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
