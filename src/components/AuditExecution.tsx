import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, FileText, Camera, CheckSquare } from 'lucide-react';

const AuditExecution = () => {
  const activeAudits = [
    { vessel: 'MV Atlantic Pride', auditor: 'Michael Harrison', progress: 75, findings: 3, photos: 24, status: 'In Progress' },
    { vessel: 'MV Pacific Star', auditor: 'Jennifer Lee', progress: 45, findings: 1, photos: 18, status: 'In Progress' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">✍️ Audit Execution</h2>
        <p className="text-muted-foreground">
          Conduct audits with digital checklists, real-time documentation, and mobile support.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Audits</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checklist Items</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <CheckSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Photos Captured</p>
                <p className="text-2xl font-bold">342</p>
              </div>
              <Camera className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Findings</p>
                <p className="text-2xl font-bold text-orange-500">12</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Current Audit Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeAudits.map((audit, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{audit.vessel}</p>
                    <p className="text-sm text-muted-foreground">Auditor: {audit.auditor}</p>
                  </div>
                  <Badge>{audit.status}</Badge>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{audit.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${audit.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{audit.findings} findings documented</span>
                  <span>{audit.photos} photos attached</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Continue Audit</Button>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditExecution;
