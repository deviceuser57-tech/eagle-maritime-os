import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, ClipboardCheck, Star, TrendingUp } from 'lucide-react';

const AuditorManagement = () => {
  const auditors = [
    { name: 'Michael Harrison', specialization: 'ISM/ISPS', audits: 47, rating: 4.8, status: 'Available' },
    { name: 'Jennifer Lee', specialization: 'Environmental', audits: 38, rating: 4.9, status: 'Assigned' },
    { name: 'Robert Thompson', specialization: 'Safety Management', audits: 52, rating: 4.7, status: 'Available' },
    { name: 'Amanda Foster', specialization: 'Technical', audits: 41, rating: 4.6, status: 'Assigned' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">🧑‍💻 Auditor Management</h2>
        <p className="text-muted-foreground">
          Manage your audit team, track performance, and assign auditors to upcoming inspections.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Auditors</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-500">12</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Audits This Month</p>
                <p className="text-2xl font-bold">35</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">4.7</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Auditor Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditors.map((auditor, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{auditor.name}</p>
                  <p className="text-sm text-muted-foreground">{auditor.specialization}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm">{auditor.audits} audits completed</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {auditor.rating}
                    </div>
                  </div>
                  <Badge variant={auditor.status === 'Available' ? 'default' : 'secondary'}>
                    {auditor.status}
                  </Badge>
                  <Button size="sm" variant="outline">Assign</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditorManagement;
