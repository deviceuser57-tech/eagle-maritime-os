import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useVessels } from '@/hooks/useVessels';
import { useAudits } from '@/hooks/useAudits';
import { useIncidents } from '@/hooks/useIncidents';
import { useVesselCertifications } from '@/hooks/useVesselCertifications';
import { useCorrectiveActions } from '@/hooks/useCorrectiveActions';
import { Loader2 } from 'lucide-react';
import { differenceInDays, format, subMonths } from 'date-fns';

interface DashboardProps {
  onSectionChange?: (section: string) => void;
}

const Dashboard = ({ onSectionChange }: DashboardProps) => {
  const { vessels, loading: vesselsLoading } = useVessels();
  const { audits, isLoading: auditsLoading } = useAudits();
  const { incidents, isLoading: incidentsLoading } = useIncidents();
  const { certifications, loading: certificationsLoading } = useVesselCertifications();
  const { correctiveActions, loading: actionsLoading } = useCorrectiveActions();

  const isLoading = vesselsLoading || auditsLoading || incidentsLoading || certificationsLoading || actionsLoading;

  // Fleet status data from real vessels
  const fleetStatusData = [
    { name: 'Active', value: vessels.filter(v => v.status === 'active').length, color: 'hsl(155 70% 45%)' },
    { name: 'Maintenance', value: vessels.filter(v => v.status === 'maintenance').length, color: 'hsl(25 95% 55%)' },
    { name: 'In Port', value: vessels.filter(v => v.status === 'inactive').length, color: 'hsl(205 85% 45%)' },
    { name: 'Drydock', value: vessels.filter(v => v.status === 'drydock').length, color: 'hsl(0 80% 55%)' }
  ].filter(item => item.value > 0);

  // Compute compliance trends from real data (last 6 months)
  const getComplianceData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthName = format(date, 'MMM');

      // Count valid vs expiring/expired certs for that month
      const validCerts = certifications.filter(c => {
        const expiry = new Date(c.expiry_date);
        return expiry > date;
      }).length;

      const totalCerts = certifications.length || 1;
      const compliantPercent = Math.round((validCerts / totalCerts) * 100);

      months.push({
        month: monthName,
        compliant: compliantPercent,
        nonCompliant: 100 - compliantPercent
      });
    }
    return months;
  };

  const complianceData = getComplianceData();

  // Priority alerts from real data
  const alerts = [
    ...certifications
      .filter(c => {
        const daysLeft = differenceInDays(new Date(c.expiry_date), new Date());
        return daysLeft <= 30 && daysLeft > 0;
      })
      .slice(0, 2)
      .map(c => ({
        id: c.id,
        type: 'Certificate Expiry',
        vessel: c.certificate_name,
        priority: differenceInDays(new Date(c.expiry_date), new Date()) <= 7 ? 'high' : 'medium',
        daysLeft: differenceInDays(new Date(c.expiry_date), new Date())
      })),
    ...correctiveActions
      .filter(a => a.status !== 'completed' && a.due_date)
      .slice(0, 1)
      .map(a => ({
        id: a.id,
        type: 'Corrective Action Due',
        vessel: a.action_description.slice(0, 30) + '...',
        priority: differenceInDays(new Date(a.due_date!), new Date()) <= 7 ? 'high' : 'low',
        daysLeft: differenceInDays(new Date(a.due_date!), new Date())
      }))
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'status-expired';
      case 'medium': return 'status-warning';
      case 'low': return 'status-valid';
      default: return 'status-valid';
    }
  };

  // Calculate real stats
  const activeAudits = audits.filter(a => a.status === 'in_progress' || a.status === 'scheduled').length;
  const openFindings = correctiveActions.filter(a => a.status !== 'completed').length;

  const validCerts = certifications.filter(c => new Date(c.expiry_date) > new Date()).length;
  const totalCerts = certifications.length || 1;
  const complianceRate = Math.round((validCerts / totalCerts) * 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Synchronizing Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 px-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground mb-2 px-1">Fleet Overview</h2>
          <p className="text-muted-foreground max-w-2xl text-base font-medium leading-relaxed px-1">
            Centralized intelligence node monitoring operational performance and regulatory alignment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/5 text-primary hover:bg-primary/10 transition-colors px-3 py-1.5 rounded-lg border border-primary/10 font-bold text-[10px] uppercase tracking-wider">
            Real-time Feed Active
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="maritime-card group cursor-pointer hover:border-primary/50 transition-all"
          onClick={() => onSectionChange?.('vessel-management')}
        >
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Total Assets</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-3xl font-black text-foreground group-hover:translate-x-1 transition-transform origin-left">{vessels.length}</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{vessels.filter(v => v.status === 'active').length} Operational</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="maritime-card group cursor-pointer hover:border-primary/50 transition-all"
          onClick={() => onSectionChange?.('audit-execution')}
        >
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Ongoing Audits</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-3xl font-black text-foreground group-hover:translate-x-1 transition-transform origin-left">{activeAudits}</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{audits.filter(a => a.status === 'completed').length} Resulted</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="maritime-card group overflow-hidden relative cursor-pointer hover:border-primary/50 transition-all"
          onClick={() => onSectionChange?.('vessels-certification')}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Compliance Rating</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className={`text-3xl font-black group-hover:translate-x-1 transition-transform origin-left ${complianceRate >= 80 ? 'text-emerald-500' : complianceRate >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
              {complianceRate}%
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-wide">{validCerts} VALIDATED</p>
          </CardContent>
        </Card>

        <Card
          className="maritime-card group cursor-pointer hover:border-primary/50 transition-all"
          onClick={() => onSectionChange?.('audit-findings')}
        >
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Open Findings</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className={`text-3xl font-black group-hover:translate-x-1 transition-transform origin-left ${openFindings > 10 ? 'text-rose-500' : 'text-foreground'}`}>{openFindings}</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{correctiveActions.filter(a => a.status === 'completed').length} Verified</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Status */}
        <Card className="maritime-card">
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>Current operational status of all vessels</CardDescription>
          </CardHeader>
          <CardContent>
            {fleetStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fleetStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fleetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No vessels found. Add vessels to see fleet status.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Trends */}
        <Card className="maritime-card">
          <CardHeader>
            <CardTitle>Compliance Trends</CardTitle>
            <CardDescription>Monthly compliance performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="compliant" stackId="a" fill="#22c55e" />
                <Bar dataKey="nonCompliant" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Alerts */}
        <Card className="maritime-card">
          <CardHeader>
            <CardTitle>Priority Alerts</CardTitle>
            <CardDescription>Urgent items requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <Alert key={alert.id} className="border-l-4 border-l-orange-500">
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{alert.type}</div>
                        <div className="text-sm text-muted-foreground">{alert.vessel}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority.toUpperCase()}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {alert.daysLeft} days left
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No urgent alerts at this time.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="maritime-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {audits.slice(0, 2).map((audit) => (
                <div key={audit.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${audit.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <div>
                    <div className="text-sm font-medium">
                      {audit.status === 'completed' ? 'Audit completed' : 'Audit in progress'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {audit.vessels?.name || 'Unknown vessel'} - {audit.audit_type}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(audit.scheduled_date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
              {incidents.slice(0, 1).map((incident) => (
                <div key={incident.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium">Incident reported</div>
                    <div className="text-xs text-muted-foreground">{incident.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(incident.incident_date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
              {audits.length === 0 && incidents.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No recent activity.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
