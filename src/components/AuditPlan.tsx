import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, MapPin, Plus, Loader2, Trash2 } from 'lucide-react';
import { useAudits } from '@/hooks/useAudits';
import { useVessels } from '@/hooks/useVessels';
import { useAuditors } from '@/hooks/useAuditors';
import { useAuditTypes } from '@/hooks/useSetupAuditConfig';
import { format, isAfter, startOfMonth, endOfMonth } from 'date-fns';


const AuditPlan = () => {
  const { audits, isLoading, createAudit, deleteAudit } = useAudits();
  const { vessels } = useVessels();
  const { auditors } = useAuditors();
  const { auditTypes } = useAuditTypes();
  const auditTypeOptions = auditTypes.map((t) => t.audit_type_name);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    audit_type: '',
    vessel_id: '',
    scheduled_date: '',
    auditor_name: '',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAudit.mutateAsync({
      ...formData,
      vessel_id: formData.vessel_id || null,
      status: 'scheduled',
    });
    setFormData({
      audit_type: '',
      vessel_id: '',
      scheduled_date: '',
      auditor_name: '',
      location: '',
    });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this audit?')) {
      deleteAudit.mutate(id);
    }
  };

  // Filter upcoming audits
  const upcomingAudits = audits.filter(a => 
    a.status === 'scheduled' && isAfter(new Date(a.scheduled_date), new Date())
  );

  // Stats
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const thisMonthAudits = audits.filter(a => {
    const date = new Date(a.scheduled_date);
    return date >= thisMonthStart && date <= thisMonthEnd;
  });

  const uniqueLocations = [...new Set(audits.map(a => a.location).filter(Boolean))].length;

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
          <h2 className="text-3xl font-bold text-foreground mb-2">🗓️ Audit Plan</h2>
          <p className="text-muted-foreground">
            Schedule and coordinate audits across your fleet with comprehensive planning tools.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Audit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule New Audit</DialogTitle>
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
                <Label htmlFor="auditor_name">Auditor</Label>
                <Select value={formData.auditor_name} onValueChange={(v) => setFormData({ ...formData, auditor_name: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select auditor" />
                  </SelectTrigger>
                  <SelectContent>
                    {auditors.map((auditor) => (
                      <SelectItem key={auditor.id} value={auditor.name}>{auditor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAudit.isPending}>
                  {createAudit.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Schedule Audit
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
                <p className="text-sm text-muted-foreground">Scheduled Audits</p>
                <p className="text-2xl font-bold">{audits.filter(a => a.status === 'scheduled').length}</p>
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
                <p className="text-2xl font-bold">{thisMonthAudits.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auditors Available</p>
                <p className="text-2xl font-bold">{auditors.filter(a => a.status === 'available').length}</p>
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
                <p className="text-2xl font-bold">{uniqueLocations}</p>
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
          {upcomingAudits.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No upcoming audits scheduled. Schedule your first audit above.</p>
          ) : (
            <div className="space-y-4">
              {upcomingAudits.map((audit) => (
                <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{audit.vessels?.name || 'No vessel assigned'}</p>
                    <p className="text-sm text-muted-foreground">{audit.audit_type}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">{audit.auditor_name || 'No auditor assigned'}</p>
                      <p className="text-xs text-muted-foreground">{audit.location || 'Location TBD'}</p>
                    </div>
                    <Badge>{format(new Date(audit.scheduled_date), 'MMM dd, yyyy')}</Badge>
                    <Button size="sm" variant="outline">Details</Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(audit.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
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

export default AuditPlan;
