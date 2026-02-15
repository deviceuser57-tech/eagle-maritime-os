import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { useCorrectiveActions } from '@/hooks/useCorrectiveActions';
import { useAudits } from '@/hooks/useAudits';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const AuditFindings = () => {
  const { toast } = useToast();
  const { correctiveActions, loading } = useCorrectiveActions();
  const { audits, isLoading: auditsLoading } = useAudits();

  // Group findings by severity based on status
  const criticalCount = correctiveActions.filter(a => a.status === 'open' && a.due_date && new Date(a.due_date) < new Date()).length;
  const majorCount = correctiveActions.filter(a => a.status === 'open' || a.status === 'in_progress').length;
  const minorCount = correctiveActions.filter(a => a.status === 'completed').length;

  if (loading || auditsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <p className="text-2xl font-bold">{correctiveActions.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-orange-500">{majorCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-500">{minorCount}</p>
              </div>
              <Info className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Recent Findings</CardTitle>
        </CardHeader>
        <CardContent>
          {correctiveActions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No findings recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {correctiveActions.slice(0, 10).map((finding) => {
                const isOverdue = finding.due_date && new Date(finding.due_date) < new Date() && finding.status !== 'completed';
                const severityVariant = isOverdue ? 'destructive' : finding.status === 'completed' ? 'secondary' : 'outline';

                return (
                  <div key={finding.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{finding.action_description.slice(0, 50)}{finding.action_description.length > 50 ? '...' : ''}</p>
                        <Badge variant={severityVariant}>
                          {isOverdue ? 'Overdue' : finding.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Assigned to: {finding.responsible_person || 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={finding.status === 'open' ? 'default' : 'secondary'}>
                          {finding.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {finding.due_date ? format(new Date(finding.due_date), 'MMM dd, yyyy') : 'No due date'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast({ title: "Finding Details", description: `Accessing full dossier and evidence for finding #${finding.id.slice(0, 8)}...` })}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditFindings;
