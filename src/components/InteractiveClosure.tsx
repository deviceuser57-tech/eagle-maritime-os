import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Camera, Award, Loader2 } from 'lucide-react';
import { useCorrectiveActions } from '@/hooks/useCorrectiveActions';
import { useAudits } from '@/hooks/useAudits';
import { useVessels } from '@/hooks/useVessels';

const InteractiveClosure = () => {
  const { correctiveActions, loading: actionsLoading } = useCorrectiveActions();
  const { audits, isLoading: auditsLoading } = useAudits();
  const { vessels, loading: vesselsLoading } = useVessels();

  const isLoading = actionsLoading || auditsLoading || vesselsLoading;

  // Calculate real stats
  const pendingActions = correctiveActions?.filter(a => a.status === 'pending') || [];
  const inProgressActions = correctiveActions?.filter(a => a.status === 'in_progress') || [];
  const completedActions = correctiveActions?.filter(a => a.status === 'completed') || [];

  // Get actions with evidence
  const actionsWithEvidence = correctiveActions?.filter(a => a.evidence_url) || [];

  // Get current month's completed actions
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const closedThisMonth = completedActions.filter(a => {
    const completedDate = a.completed_date ? new Date(a.completed_date) : null;
    return completedDate && completedDate >= startOfMonth;
  });

  // Build pending closures from corrective actions that are in progress or have evidence
  const pendingClosures = [...pendingActions, ...inProgressActions]
    .slice(0, 10)
    .map(action => {
      const audit = audits?.find(a => a.id === action.finding_id);
      const vessel = vessels?.find(v => v.id === audit?.vessel_id);
      
      return {
        id: action.id.slice(0, 8),
        finding: action.finding_id?.slice(0, 8) || 'N/A',
        vessel: vessel?.name || 'Unknown Vessel',
        description: action.action_description,
        evidence: action.evidence_url ? 1 : 0,
        photos: 0, // Would need a separate photos table
        readyForReview: action.status === 'in_progress' && !!action.evidence_url,
        dueDate: action.due_date,
        responsiblePerson: action.responsible_person,
      };
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading closure data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">✅ Interactive Closure</h2>
        <p className="text-muted-foreground">
          Streamlined finding closure process with evidence verification and approval workflow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Closure</p>
                <p className="text-2xl font-bold">{pendingActions.length + inProgressActions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready for Review</p>
                <p className="text-2xl font-bold text-orange-500">
                  {inProgressActions.filter(a => a.evidence_url).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed This Month</p>
                <p className="text-2xl font-bold text-green-500">{closedThisMonth.length}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Evidence</p>
                <p className="text-2xl font-bold">{actionsWithEvidence.length}</p>
              </div>
              <Camera className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Findings Awaiting Closure</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingClosures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending closures. All corrective actions have been completed or no actions exist.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingClosures.map((closure) => (
                <div key={closure.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">CA-{closure.id}</p>
                      <Badge variant="outline">Finding: {closure.finding}</Badge>
                    </div>
                    {closure.readyForReview && (
                      <Badge variant="default">Ready for Review</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{closure.vessel}</p>
                  <p className="text-sm mb-3 line-clamp-2">{closure.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{closure.evidence} evidence documents</span>
                    <span>Due: {closure.dueDate || 'Not set'}</span>
                    {closure.responsiblePerson && (
                      <span>Assigned: {closure.responsiblePerson}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">Review Evidence</Button>
                    <Button size="sm" variant="outline">Request More Info</Button>
                    {closure.readyForReview && (
                      <Button size="sm" variant="outline">Approve Closure</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveClosure;
