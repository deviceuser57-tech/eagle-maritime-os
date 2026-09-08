import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';

export interface RlsCoverageResult {
  table_name: string;
  rls_enabled: boolean;
  policy_count: number;
}

export interface SecurityScanResult {
  id: string;
  environment: string;
  scan_type: string;
  status: 'pass' | 'fail' | 'warn';
  detail: Record<string, unknown> | null;
  scanned_at: string;
}

export interface AuditLogEntry {
  id: string;
  org_id: string | null;
  actor_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  outcome: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
}

export interface SecurityPosture {
  lastScanAt: string | null;
  rlsPassing: boolean;
  graphqlPassing: boolean;
  overallStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  recentScans: SecurityScanResult[];
  recentAuditLogs: AuditLogEntry[];
  totalAuditLogsToday: number;
  failedActionsToday: number;
}

export const useSecurityPosture = () => {
  const { user } = useAuth();
  const { orgId } = useOrganization();

  const { data: securityScans = [], isLoading: scansLoading } = useQuery({
    queryKey: ['security_scan_results', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_scan_results')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as SecurityScanResult[];
    },
    enabled: !!user?.id,
  });

  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['enterprise_audit_log_recent', orgId],
    queryFn: async () => {
      const query = supabase
        .from('enterprise_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (orgId) query.eq('org_id', orgId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AuditLogEntry[];
    },
    enabled: !!user?.id,
  });

  // Derive posture from scan results
  const latestRls = securityScans.find((s) => s.scan_type === 'rls_coverage');
  const latestGraphql = securityScans.find((s) => s.scan_type === 'graphql_exclusion');

  const rlsPassing = latestRls?.status === 'pass';
  const graphqlPassing = latestGraphql?.status === 'pass';

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = auditLogs.filter((l) => l.created_at?.startsWith(today));
  const failedActionsToday = todayLogs.filter(
    (l) => l.outcome === 'failure' || l.outcome === 'denied'
  ).length;

  let overallStatus: SecurityPosture['overallStatus'] = 'unknown';
  if (securityScans.length > 0) {
    if (!rlsPassing || !graphqlPassing || failedActionsToday > 10) {
      overallStatus = 'critical';
    } else if (failedActionsToday > 3) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'healthy';
    }
  }

  const posture: SecurityPosture = {
    lastScanAt: latestRls?.scanned_at ?? latestGraphql?.scanned_at ?? null,
    rlsPassing,
    graphqlPassing,
    overallStatus,
    recentScans: securityScans.slice(0, 10),
    recentAuditLogs: auditLogs.slice(0, 20),
    totalAuditLogsToday: todayLogs.length,
    failedActionsToday,
  };

  return {
    posture,
    isLoading: scansLoading || logsLoading,
  };
};
