import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, TrendingDown } from 'lucide-react';

const AuditFindings = () => {
  const findings = [
    { id: 'F-2024-001', vessel: 'MV Atlantic Pride', category: 'Safety Equipment', severity: 'Critical', status: 'Open', date: '2024-01-15' },
    { id: 'F-2024-002', vessel: 'MV Pacific Star', category: 'Documentation', severity: 'Major', status: 'Under Review', date: '2024-01-14' },
    { id: 'F-2024-003', vessel: 'MV Nordic Wave', category: 'Environmental', severity: 'Minor', status: 'Open', date: '2024-01-12' },
    { id: 'F-2024-004', vessel: 'MV Southern Cross', category: 'Maintenance', severity: 'Major', status: 'Action Taken', date: '2024-01-10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">📝 Audit Findings</h2>
        <p className="text-muted-foreground">
          Track, categorize, and manage all audit findings with detailed documentation and photos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Findings</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-500">7</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Major</p>
                <p className="text-2xl font-bold text-orange-500">15</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Minor</p>
                <p className="text-2xl font-bold">25</p>
              </div>
              <Info className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Recent Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {findings.map((finding) => (
              <div key={finding.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{finding.id}</p>
                    <Badge variant={
                      finding.severity === 'Critical' ? 'destructive' :
                      finding.severity === 'Major' ? 'secondary' : 'outline'
                    }>
                      {finding.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{finding.vessel} - {finding.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant={finding.status === 'Open' ? 'default' : 'secondary'}>
                      {finding.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{finding.date}</p>
                  </div>
                  <Button size="sm" variant="outline">Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditFindings;
