import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const Maintenance = () => {
  const maintenanceItems = [
    { vessel: 'MV Atlantic Pride', item: 'Main Engine Overhaul', dueDate: '2024-02-15', status: 'Scheduled', priority: 'High' },
    { vessel: 'MV Pacific Star', item: 'Hull Cleaning & Inspection', dueDate: '2024-01-30', status: 'Overdue', priority: 'Critical' },
    { vessel: 'MV Nordic Wave', item: 'Safety Equipment Service', dueDate: '2024-03-10', status: 'Scheduled', priority: 'Medium' },
    { vessel: 'MV Southern Cross', item: 'Generator Maintenance', dueDate: '2024-02-05', status: 'In Progress', priority: 'High' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">🛠️ Maintenance</h2>
        <p className="text-muted-foreground">
          Track preventive and corrective maintenance across your fleet to ensure optimal vessel performance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Tasks</p>
                <p className="text-2xl font-bold">87</p>
              </div>
              <Wrench className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-500">12</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-500">243</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due This Week</p>
                <p className="text-2xl font-bold text-orange-500">18</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Maintenance Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.vessel}</p>
                  <p className="text-sm text-muted-foreground">{item.item}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm">Due: {item.dueDate}</p>
                    <Badge 
                      variant={
                        item.priority === 'Critical' ? 'destructive' :
                        item.priority === 'High' ? 'secondary' : 'outline'
                      }
                      className="mt-1"
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <Badge variant={
                    item.status === 'Overdue' ? 'destructive' :
                    item.status === 'In Progress' ? 'secondary' : 'default'
                  }>
                    {item.status}
                  </Badge>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;
