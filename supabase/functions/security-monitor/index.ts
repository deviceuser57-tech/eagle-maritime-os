import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanPayload {
  trigger?: 'scheduled' | 'manual';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const sb = createClient(supabaseUrl, serviceKey);

  try {
    const payload: ScanPayload = req.method === 'POST'
      ? await req.json().catch(() => ({}))
      : {};

    const trigger = payload.trigger ?? 'scheduled';
    const results: Array<{
      scan_type: string;
      status: 'pass' | 'fail' | 'warn';
      detail: Record<string, unknown>;
    }> = [];

    // ──────────────────────────────────────────
    // Check 1: Verify active alert rules have
    // not been deleted or deactivated silently.
    // ──────────────────────────────────────────
    const { data: alertRules, error: rulesErr } = await sb
      .from('alert_rules')
      .select('id, rule_name, is_active')
      .eq('is_active', true);

    if (rulesErr) {
      results.push({ scan_type: 'alert_rules_check', status: 'warn', detail: { error: rulesErr.message } });
    } else {
      results.push({
        scan_type: 'alert_rules_check',
        status: 'pass',
        detail: { active_rules: alertRules?.length ?? 0 },
      });
    }

    // ──────────────────────────────────────────
    // Check 2: Count unacknowledged critical alerts
    // ──────────────────────────────────────────
    const { count: unackedCritical, error: alertErr } = await sb
      .from('triggered_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('acknowledged', false)
      .eq('severity', 'critical');

    if (alertErr) {
      results.push({ scan_type: 'unacked_critical_alerts', status: 'warn', detail: { error: alertErr.message } });
    } else {
      results.push({
        scan_type: 'unacked_critical_alerts',
        status: (unackedCritical ?? 0) > 0 ? 'fail' : 'pass',
        detail: { count: unackedCritical ?? 0 },
      });
    }

    // ──────────────────────────────────────────
    // Check 3: Audit log denied actions in last 24 h
    // ──────────────────────────────────────────
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: deniedCount, error: deniedErr } = await sb
      .from('enterprise_audit_log')
      .select('id', { count: 'exact', head: true })
      .eq('outcome', 'denied')
      .gte('created_at', since);

    if (deniedErr) {
      results.push({ scan_type: 'denied_actions_24h', status: 'warn', detail: { error: deniedErr.message } });
    } else {
      const status = (deniedCount ?? 0) > 20 ? 'fail' : (deniedCount ?? 0) > 5 ? 'warn' : 'pass';
      results.push({ scan_type: 'denied_actions_24h', status, detail: { count: deniedCount ?? 0 } });
    }

    // ──────────────────────────────────────────
    // Persist all scan results
    // ──────────────────────────────────────────
    const rows = results.map((r) => ({
      environment: 'production',
      scan_type: r.scan_type,
      status: r.status,
      detail: r.detail,
    }));

    const { error: insertErr } = await sb.from('security_scan_results').insert(rows);
    if (insertErr) {
      console.error('[security-monitor] Failed to persist results:', insertErr.message);
    }

    // Trigger alert for any failures
    const failures = results.filter((r) => r.status === 'fail');
    if (failures.length > 0) {
      const alertRows = failures.map((f) => ({
        rule_name: f.scan_type,
        severity: 'critical',
        message: `Security monitor detected a failure in: ${f.scan_type}`,
        detail: f.detail,
      }));
      await sb.from('triggered_alerts').insert(alertRows);
    }

    return new Response(
      JSON.stringify({ ok: true, trigger, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error('[security-monitor] Fatal error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
