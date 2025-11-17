import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, MapPin, FileText } from 'lucide-react';

const AuditPlan = () => {
  const scheduledAudits = [
    { vessel: 'MV Atlantic Pride', type: 'ISM Annual', auditor: 'Michael Harrison', date: '2024-02-15', location: 'Singapore' },
    { vessel: 'MV Pacific Star', type: 'ISPS Renewal', auditor: 'Jennifer Lee', date: '2024-02-22', location: 'Los Angeles' },
    { vessel: 'MV Nordic Wave', type: 'Environmental', auditor: 'Robert Thompson', date: '2024-03-05', location: 'Hamburg' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">🗓️ Audit Plan</h2>
        <p className="text-muted-foreground">
          Schedule and coordinate audits across your fleet with comprehensive planning tools.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Audits</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auditors Assigned</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Locations</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Upcoming Audits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledAudits.map((audit, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{audit.vessel}</p>
                  <p className="text-sm text-muted-foreground">{audit.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm">{audit.auditor}</p>
                    <p className="text-xs text-muted-foreground">{audit.location}</p>
                  </div>
                  <Badge>{audit.date}</Badge>
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

export default AuditPlan;
