import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Activity, TrendingDown, FileText } from 'lucide-react';

const Incidents = () => {
  const incidents = [
    { id: 'INC-2024-008', vessel: 'MV Pacific Star', type: 'Near Miss', severity: 'Low', date: '2024-01-14', status: 'Under Investigation' },
    { id: 'INC-2024-007', vessel: 'MV Atlantic Pride', type: 'Equipment Failure', severity: 'Medium', date: '2024-01-12', status: 'Closed' },
    { id: 'INC-2024-006', vessel: 'MV Nordic Wave', type: 'Safety Violation', severity: 'High', date: '2024-01-10', status: 'Action Taken' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">🚨 Incident Management</h2>
        <p className="text-muted-foreground">
          Report, investigate, and track incidents with comprehensive documentation and analysis.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Incidents</p>
                <p className="text-2xl font-bold">34</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Cases</p>
                <p className="text-2xl font-bold text-orange-500">8</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trend</p>
                <p className="text-2xl font-bold text-green-500">-12%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{incident.id}</p>
                    <Badge variant={
                      incident.severity === 'High' ? 'destructive' :
                      incident.severity === 'Medium' ? 'secondary' : 'outline'
                    }>
                      {incident.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{incident.vessel} - {incident.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant={incident.status === 'Under Investigation' ? 'default' : 'secondary'}>
                      {incident.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{incident.date}</p>
                  </div>
                  <Button size="sm" variant="outline">View Report</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Incidents;
