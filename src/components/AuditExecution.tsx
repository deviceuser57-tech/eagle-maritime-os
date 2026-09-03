import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardCheck, FileText, Camera, CheckSquare, Plus, Loader2, Trash2 } from 'lucide-react';
import { useAudits } from '@/hooks/useAudits';
import { useVessels } from '@/hooks/useVessels';
import { useToast } from '@/hooks/use-toast';
import { useAuditTypes } from '@/hooks/useSetupAuditConfig';
import { format } from 'date-fns';

const AuditExecution = () => {
  const { toast } = useToast();
  const { audits, isLoading, createAudit, updateAudit, deleteAudit } = useAudits();
  const { vessels } = useVessels();
  const { auditTypes } = useAuditTypes();
  const auditTypeOptions = auditTypes.map((t) => t.audit_type_name);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    audit_type: '',
    vessel_id: '',
    scheduled_date: '',
    auditor_name: '',
    location: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAudit.mutateAsync({
      ...formData,
      vessel_id: formData.vessel_id || null,
      status: 'in_progress',
    });
    setFormData({
      audit_type: '',
      vessel_id: '',
      scheduled_date: '',
      auditor_name: '',
      location: '',
      notes: '',
    });
    setIsDialogOpen(false);
  };

  const activeAudits = audits.filter(a => a.status === 'in_progress');
  const totalFindings = audits.reduce((sum, a) => sum + (a.findings_count || 0), 0);

  if (isLoading) {
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
          <h2 className="text-3xl font-bold text-foreground mb-2">✍️ Audit Execution</h2>
          <p className="text-muted-foreground">
            Conduct audits with digital checklists, real-time documentation, and mobile support.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Start Audit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Start New Audit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audit_type">Audit Type *</Label>
                <Select value={formData.audit_type} onValueChange={(v) => setFormData({ ...formData, audit_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {auditTypeOptions.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>

                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vessel_id">Vessel *</Label>
                <Select value={formData.vessel_id} onValueChange={(v) => setFormData({ ...formData, vessel_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vessel" />
                  </SelectTrigger>
                  <SelectContent>
                    {vessels.map((vessel) => (
                      <SelectItem key={vessel.id} value={vessel.id}>{vessel.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Date *</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auditor_name">Auditor Name</Label>
                <Input
                  id="auditor_name"
                  value={formData.auditor_name}
                  onChange={(e) => setFormData({ ...formData, auditor_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Port or location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAudit.isPending}>
                  {createAudit.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Start Audit
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
                <p className="text-sm text-muted-foreground">Active Audits</p>
                <p className="text-2xl font-bold">{activeAudits.length}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Audits</p>
                <p className="text-2xl font-bold">{audits.length}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-500">
                  {audits.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <Camera className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Findings</p>
                <p className="text-2xl font-bold text-orange-500">{totalFindings}</p>
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
          {audits.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No audits yet. Start your first audit above.</p>
          ) : (
            <div className="space-y-4">
              {audits.map((audit) => (
                <div key={audit.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{audit.vessels?.name || 'No vessel'}</p>
                      <p className="text-sm text-muted-foreground">
                        {audit.audit_type} {audit.auditor_name && `• Auditor: ${audit.auditor_name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={audit.status === 'completed' ? 'secondary' : 'default'}>
                        {audit.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAudit.mutate(audit.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>Scheduled: {format(new Date(audit.scheduled_date), 'MMM dd, yyyy')}</span>
                    <span>{audit.findings_count || 0} findings</span>
                    {audit.score && <span>Score: {audit.score}%</span>}
                  </div>
                  <div className="flex gap-2">
                    {audit.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => updateAudit.mutate({ id: audit.id, status: 'completed', completed_date: new Date().toISOString().split('T')[0] })}
                      >
                        Complete Audit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast({ title: "Audit Details", description: `Opening comprehensive report for audit #${audit.id.slice(0, 8)}...` })}
                    >
                      View Details
                    </Button>
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

export default AuditExecution;
