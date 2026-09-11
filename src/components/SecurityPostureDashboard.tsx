import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSecurityPosture } from '@/hooks/useSecurityPosture';
import { Shield, ShieldCheck, ShieldAlert, ShieldX, Activity, Lock, Database, Globe, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  healthy: {
    label: 'Healthy',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: ShieldCheck,
    badge: 'secondary' as const,
  },
  warning: {
    label: 'Warning',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: ShieldAlert,
    badge: 'outline' as const,
  },
  critical: {
    label: 'Critical',
    color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/20',
    icon: ShieldX,
    badge: 'destructive' as const,
  },
  unknown: {
    label: 'Unknown',
    color: 'text-muted-foreground',
    bg: 'bg-muted/30 border-border',
    icon: Shield,
    badge: 'outline' as const,
  },
};

const SecurityPostureDashboard = () => {
  const { posture, isLoading } = useSecurityPosture();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cfg = statusConfig[posture.overallStatus];
  const StatusIcon = cfg.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground mb-2">Security Posture</h2>
        <p className="text-muted-foreground">
          Real-time security health, RLS coverage, and audit activity for your organisation.
        </p>
      </div>

      {/* Overall Status Banner */}
      <div className={`flex items-center gap-4 p-5 rounded-2xl border ${cfg.bg}`}>
        <StatusIcon className={`h-10 w-10 ${cfg.color} flex-shrink-0`} />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Overall Security Status</p>
          <p className={`text-2xl font-black ${cfg.color}`}>{cfg.label}</p>
          {posture.lastScanAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Last scan: {format(new Date(posture.lastScanAt), 'MMM dd, yyyy HH:mm')}
            </p>
          )}
          {!posture.lastScanAt && (
            <p className="text-xs text-muted-foreground mt-1">No CI scan results yet — push to main to trigger.</p>
          )}
        </div>
        <Badge variant={cfg.badge} className="text-base px-4 py-2">
          {cfg.label}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">RLS Coverage</p>
                <p className={`text-2xl font-bold ${posture.rlsPassing ? 'text-emerald-500' : 'text-destructive'}`}>
                  {posture.rlsPassing ? 'Pass ✓' : 'Fail ✗'}
                </p>
              </div>
              <Database className={`h-8 w-8 ${posture.rlsPassing ? 'text-emerald-500' : 'text-destructive'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GraphQL Exposure</p>
                <p className={`text-2xl font-bold ${posture.graphqlPassing ? 'text-emerald-500' : 'text-destructive'}`}>
                  {posture.graphqlPassing ? 'Pass ✓' : 'Fail ✗'}
                </p>
              </div>
              <Globe className={`h-8 w-8 ${posture.graphqlPassing ? 'text-emerald-500' : 'text-destructive'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Audit Events Today</p>
                <p className="text-2xl font-bold">{posture.totalAuditLogsToday}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed / Denied</p>
                <p className={`text-2xl font-bold ${posture.failedActionsToday > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                  {posture.failedActionsToday}
                </p>
              </div>
              <Lock className={`h-8 w-8 ${posture.failedActionsToday > 0 ? 'text-destructive' : 'text-emerald-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CI Scan History */}
      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>CI Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          {posture.recentScans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No scan results yet. Push to <code className="bg-muted px-1 rounded">main</code> to trigger the CI pipeline.
            </p>
          ) : (
            <div className="space-y-3">
              {posture.recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{scan.scan_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">{scan.environment}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={scan.status === 'pass' ? 'secondary' : scan.status === 'warn' ? 'outline' : 'destructive'}
                    >
                      {scan.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(scan.scanned_at), 'MMM dd HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Audit Log */}
      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Recent Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          {posture.recentAuditLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No audit events recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {posture.recentAuditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                  <div className="flex-1">
                    <span className="font-mono font-medium">{log.action}</span>
                    {log.resource_type && (
                      <span className="text-muted-foreground ml-2">
                        → {log.resource_type}{log.resource_id ? ` #${log.resource_id.slice(0, 8)}` : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        log.outcome === 'success' ? 'secondary'
                        : log.outcome === 'denied' ? 'destructive'
                        : 'outline'
                      }
                    >
                      {log.outcome ?? 'unknown'}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), 'MMM dd HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPostureDashboard;
