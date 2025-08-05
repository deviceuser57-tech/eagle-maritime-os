import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  // Mock data for charts
  const fleetStatusData = [
    { name: 'Active', value: 12, color: '#22c55e' },
    { name: 'Maintenance', value: 3, color: '#f59e0b' },
    { name: 'In Port', value: 5, color: '#3b82f6' },
    { name: 'Alerts', value: 2, color: '#ef4444' }
  ];

  const complianceData = [
    { month: 'Jan', compliant: 85, nonCompliant: 15 },
    { month: 'Feb', compliant: 88, nonCompliant: 12 },
    { month: 'Mar', compliant: 92, nonCompliant: 8 },
    { month: 'Apr', compliant: 95, nonCompliant: 5 },
    { month: 'May', compliant: 90, nonCompliant: 10 },
    { month: 'Jun', compliant: 93, nonCompliant: 7 }
  ];

  const alerts = [
    { id: 1, type: 'Certificate Expiry', vessel: 'MV Ocean Star', priority: 'high', daysLeft: 5 },
    { id: 2, type: 'Inspection Due', vessel: 'MV Blue Wave', priority: 'medium', daysLeft: 15 },
    { id: 3, type: 'Crew Training', vessel: 'MV Sea Eagle', priority: 'low', daysLeft: 30 }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'status-expired';
      case 'medium': return 'status-warning';
      case 'low': return 'status-valid';
      default: return 'status-valid';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Fleet Management Dashboard</h2>
        <p className="text-muted-foreground">
          Central command center for monitoring vessel performance, compliance status, and key performance indicators in real-time.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="maritime-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vessels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">22</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-muted-foreground">3 completed this week</p>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">93%</div>
            <p className="text-xs text-muted-foreground">+2% improvement</p>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">14</div>
            <p className="text-xs text-muted-foreground">7 critical, 7 minor</p>
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
            {alerts.map((alert) => (
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
            ))}
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
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium">Audit completed</div>
                  <div className="text-xs text-muted-foreground">MV Ocean Star - ISM Audit</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium">Certificate renewed</div>
                  <div className="text-xs text-muted-foreground">Safety Management Certificate</div>
                  <div className="text-xs text-muted-foreground">5 hours ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium">Finding reported</div>
                  <div className="text-xs text-muted-foreground">MV Blue Wave - Minor deficiency</div>
                  <div className="text-xs text-muted-foreground">1 day ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;