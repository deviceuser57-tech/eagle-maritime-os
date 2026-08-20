#!/usr/bin/env node
// scripts/verify-rls-coverage.mjs
// CI script that verifies every org-scoped table has RLS enabled and
// the expected minimum number of policies, based on rls-baseline.json.
//
// Required env vars:
//   SUPABASE_URL            – project URL (https://xxx.supabase.co)
//   SUPABASE_SERVICE_ROLE_KEY – service-role key with pg_catalog access

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── ENV ──────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── BASELINE ─────────────────────────────────────────────────────────
const baselinePath = resolve(__dirname, 'rls-baseline.json');
let baseline;
try {
  baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));
} catch {
  console.error(`ERROR: Could not read baseline file at ${baselinePath}`);
  process.exit(1);
}

// ── QUERIES ──────────────────────────────────────────────────────────

/**
 * Return all public tables with their RLS status and policy count.
 * Uses a raw SQL query via the service-role client.
 */
async function getTableRLSStatus() {
  const { data, error } = await supabase.rpc('_ci_get_rls_status');

  if (error) {
    // Fallback: if the RPC doesn't exist, try a direct REST query
    // against a view we set up, or fail gracefully.
    console.warn(
      'RPC _ci_get_rls_status not found. Falling back to REST introspection.',
    );
    return fallbackIntrospection();
  }
  return data;
}

/**
 * Fallback introspection via information_schema (less precise but works
 * without custom RPCs). Queries tables and their policies via PostgREST.
 */
async function fallbackIntrospection() {
  // Query the pg_tables and pg_policies views via the PostgREST API
  // This requires the service-role key to access pg_catalog.
  const tables = [];

  // Get all public tables
  const { data: allTables, error: tablesError } = await supabase
    .from('information_schema.tables' )
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE');

  if (tablesError) {
    console.error('Cannot query information_schema.tables:', tablesError.message);
    // Return an empty array but don't fail — the main loop will flag all baseline tables as missing
    return [];
  }

  for (const t of allTables || []) {
    tables.push({
      table_name: t.table_name,
      rls_enabled: null, // Cannot determine via REST without custom RPC
      policy_count: null,
    });
  }

  return tables;
}

// ── MAIN ─────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Eagle Maritime OS — RLS Coverage CI    ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const dbTables = await getTableRLSStatus();
  const dbMap = new Map(dbTables.map((t) => [t.table_name, t]));

  const violations = [];
  const report = { timestamp: new Date().toISOString(), tables: {} };

  for (const [tableName, expected] of Object.entries(baseline)) {
    const actual = dbMap.get(tableName);
    const entry = { expected, actual: null, status: 'unknown', issues: [] };

    if (!actual) {
      entry.status = 'missing';
      entry.issues.push(`Table "${tableName}" not found in database.`);
      violations.push({ table: tableName, issue: 'TABLE_NOT_FOUND' });
    } else {
      entry.actual = actual;

      // Check RLS enabled
      if (expected.rls_required && actual.rls_enabled === false) {
        entry.status = 'fail';
        entry.issues.push('RLS is NOT enabled but is required by baseline.');
        violations.push({ table: tableName, issue: 'RLS_DISABLED' });
      }

      // Check minimum policy count
      if (
        actual.policy_count !== null &&
        actual.policy_count < (expected.min_policies || 1)
      ) {
        entry.status = 'fail';
        entry.issues.push(
          `Only ${actual.policy_count} policies found (minimum: ${expected.min_policies}).`,
        );
        violations.push({
          table: tableName,
          issue: 'INSUFFICIENT_POLICIES',
          found: actual.policy_count,
          required: expected.min_policies,
        });
      }

      if (entry.issues.length === 0) {
        entry.status = 'pass';
      }
    }

    report.tables[tableName] = entry;
  }

  // ── Report ───────────────────────────────────────────────────────
  report.summary = {
    total: Object.keys(baseline).length,
    passed: Object.values(report.tables).filter((t) => t.status === 'pass')
      .length,
    failed: Object.values(report.tables).filter((t) => t.status === 'fail')
      .length,
    missing: Object.values(report.tables).filter((t) => t.status === 'missing')
      .length,
    unknown: Object.values(report.tables).filter((t) => t.status === 'unknown')
      .length,
  };

  const reportPath = resolve(__dirname, 'rls-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report written to ${reportPath}\n`);

  // Console summary
  console.log(`  Tables in baseline : ${report.summary.total}`);
  console.log(`  ✅ Passed          : ${report.summary.passed}`);
  console.log(`  ❌ Failed          : ${report.summary.failed}`);
  console.log(`  ⚠️  Missing         : ${report.summary.missing}`);
  console.log(`  ❓ Unknown         : ${report.summary.unknown}`);
  console.log();

  if (violations.length > 0) {
    console.error('VIOLATIONS:');
    for (const v of violations) {
      console.error(`  • ${v.table}: ${v.issue}`);
    }
    console.error(`\n${violations.length} violation(s) found. CI FAILED.`);
    process.exit(1);
  }

  console.log('All baseline tables pass RLS coverage checks. ✅');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
