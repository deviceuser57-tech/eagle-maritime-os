import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, ClipboardCheck, Star, Plus, Loader2, Trash2 } from 'lucide-react';
import { useAuditors } from '@/hooks/useAuditors';
import { useAudits } from '@/hooks/useAudits';

const AuditorManagement = () => {
  const { auditors, loading, addAuditor, deleteAuditor } = useAuditors();
  const { audits } = useAudits();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    certification_number: '',
    status: 'available',
    rating: null as number | null,
    audits_completed: null as number | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAuditor(formData);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      certification_number: '',
      status: 'available',
      rating: null,
      audits_completed: null,
    });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this auditor?')) {
      await deleteAuditor(id);
    }
  };

  // Count audits per auditor
  const getAuditCount = (auditorName: string) => {
    return audits.filter(a => a.auditor_name === auditorName).length;
  };

  const availableCount = auditors.filter(a => a.status === 'available').length;
  const thisMonthAudits = audits.filter(a => {
    const date = new Date(a.scheduled_date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

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
          <h2 className="text-3xl font-bold text-foreground mb-2">🧑‍💻 Auditor Management</h2>
          <p className="text-muted-foreground">
            Manage your audit team, track performance, and assign auditors to upcoming inspections.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Auditor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Auditor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select value={formData.specialization} onValueChange={(v) => setFormData({ ...formData, specialization: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ISM/ISPS">ISM/ISPS</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                    <SelectItem value="Safety Management">Safety Management</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="MLC">MLC</SelectItem>
                    <SelectItem value="Vetting">Vetting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="certification_number">Certification Number</Label>
                <Input
                  id="certification_number"
                  value={formData.certification_number}
                  onChange={(e) => setFormData({ ...formData, certification_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Auditor
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
                <p className="text-sm text-muted-foreground">Total Auditors</p>
                <p className="text-2xl font-bold">{auditors.length}</p>
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
                <p className="text-2xl font-bold text-green-500">{availableCount}</p>
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
                <p className="text-2xl font-bold">{thisMonthAudits}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold">{auditors.filter(a => a.status === 'assigned').length}</p>
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
          {auditors.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No auditors yet. Add your first auditor above.</p>
          ) : (
            <div className="space-y-4">
              {auditors.map((auditor) => (
                <div key={auditor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{auditor.name}</p>
                    <p className="text-sm text-muted-foreground">{auditor.specialization || 'No specialization'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">{getAuditCount(auditor.name)} audits completed</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {auditor.certification_number || 'N/A'}
                      </div>
                    </div>
                    <Badge variant={auditor.status === 'available' ? 'default' : 'secondary'}>
                      {auditor.status}
                    </Badge>
                    <Button size="sm" variant="outline">Assign</Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(auditor.id)}
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

export default AuditorManagement;
