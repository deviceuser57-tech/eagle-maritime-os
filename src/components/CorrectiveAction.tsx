import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Plus, Loader2, Trash2 } from 'lucide-react';
import { useCorrectiveActions } from '@/hooks/useCorrectiveActions';
import { useFindingStatuses, useRootCauses } from '@/hooks/useSetupAuditConfig';
import { format, differenceInDays } from 'date-fns';

const CorrectiveAction = () => {
  const { correctiveActions, loading, addCorrectiveAction, updateCorrectiveAction, deleteCorrectiveAction } = useCorrectiveActions();
  const { findingStatuses } = useFindingStatuses();
  const { rootCauses }      = useRootCauses();

  const statusOptions = findingStatuses.map(s => ({
    value: s.status_name.toLowerCase().replace(/ /g, '_'),
    label: s.status_name,
  }));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    action_description: '',
    responsible_person: '',
    due_date: '',
    status: 'open',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCorrectiveAction({
      ...formData,
      finding_id: null,
      due_date: formData.due_date || null,
      completed_date: null,
      evidence_url: null,
    });
    setFormData({
      action_description: '',
      responsible_person: '',
      due_date: '',
      status: 'open',
      notes: '',
    });
    setIsDialogOpen(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completed_date = format(new Date(), 'yyyy-MM-dd');
    }
    await updateCorrectiveAction(id, updates);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this action?')) {
      await deleteCorrectiveAction(id);
    }
  };

  const openCount = correctiveActions.filter(a => a.status === 'open').length;
  const inProgressCount = correctiveActions.filter(a => a.status === 'in_progress').length;
  const completedCount = correctiveActions.filter(a => a.status === 'completed').length;
  const overdueCount = correctiveActions.filter(a => 
    a.status !== 'completed' && a.due_date && new Date(a.due_date) < new Date()
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">⚙️ Corrective Actions</h2>
          <p className="text-muted-foreground">
            Manage and track corrective actions for all findings with responsibility assignment and deadlines.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Corrective Action</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="action_description">Action Description *</Label>
                <Textarea
                  id="action_description"
                  value={formData.action_description}
                  onChange={(e) => setFormData({ ...formData, action_description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible_person">Responsible Person</Label>
                <Input
                  id="responsible_person"
                  value={formData.responsible_person}
                  onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Action
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Actions</p>
                <p className="text-2xl font-bold">{openCount}</p>
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
                <p className="text-2xl font-bold text-orange-500">{inProgressCount}</p>
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
                <p className="text-2xl font-bold text-green-500">{completedCount}</p>
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
                <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Active Corrective Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {correctiveActions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No corrective actions yet. Add your first action above.</p>
          ) : (
            <div className="space-y-4">
              {correctiveActions.map((action) => {
                const isOverdue = action.status !== 'completed' && action.due_date && new Date(action.due_date) < new Date();
                const daysLeft = action.due_date ? differenceInDays(new Date(action.due_date), new Date()) : null;
                
                return (
                  <div key={action.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Action #{action.id.slice(0, 8)}</p>
                        {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={action.status === 'completed' ? 'secondary' : action.status === 'in_progress' ? 'default' : 'outline'}>
                          {action.status.replace('_', ' ')}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(action.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{action.action_description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Responsible: {action.responsible_person || 'Unassigned'}</span>
                      <span>
                        {action.due_date 
                          ? `Due: ${format(new Date(action.due_date), 'MMM dd, yyyy')} ${daysLeft !== null ? `(${daysLeft < 0 ? Math.abs(daysLeft) + ' days overdue' : daysLeft + ' days left'})` : ''}`
                          : 'No due date'
                        }
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {action.status !== 'completed' && (
                        <>
                          {action.status === 'open' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(action.id, 'in_progress')}>
                              Start Progress
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(action.id, 'completed')}>
                            Mark Complete
                          </Button>
                        </>
                      )}
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

export default CorrectiveAction;
