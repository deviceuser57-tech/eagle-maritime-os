import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const CorrectiveAction = () => {
  const actions = [
    { id: 'CA-001', finding: 'F-2024-001', action: 'Replace fire extinguisher on deck 2', responsible: 'Chief Officer', dueDate: '2024-02-01', status: 'In Progress' },
    { id: 'CA-002', finding: 'F-2024-002', action: 'Update safety management documentation', responsible: 'Safety Officer', dueDate: '2024-01-25', status: 'Pending' },
    { id: 'CA-003', finding: 'F-2024-003', action: 'Repair oil containment system', responsible: 'Chief Engineer', dueDate: '2024-02-10', status: 'In Progress' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">⚙️ Corrective Actions</h2>
        <p className="text-muted-foreground">
          Manage and track corrective actions for all findings with responsibility assignment and deadlines.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Actions</p>
                <p className="text-2xl font-bold">28</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-orange-500">15</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-500">134</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-500">5</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Active Corrective Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actions.map((action) => (
              <div key={action.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{action.id}</p>
                    <Badge variant="outline">Related: {action.finding}</Badge>
                  </div>
                  <Badge variant={action.status === 'In Progress' ? 'default' : 'secondary'}>
                    {action.status}
                  </Badge>
                </div>
                <p className="text-sm mb-2">{action.action}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Responsible: {action.responsible}</span>
                  <span>Due: {action.dueDate}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">Update Progress</Button>
                  <Button size="sm" variant="outline">Add Evidence</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CorrectiveAction;
