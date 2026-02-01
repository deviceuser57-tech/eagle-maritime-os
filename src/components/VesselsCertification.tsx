import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, AlertCircle, CheckCircle, Clock, Plus, Loader2, Trash2 } from 'lucide-react';
import { useVesselCertifications } from '@/hooks/useVesselCertifications';
import { useVessels } from '@/hooks/useVessels';
import { format, differenceInDays } from 'date-fns';

const VesselsCertification = () => {
  const { certifications, loading, addCertification, deleteCertification } = useVesselCertifications();
  const { vessels } = useVessels();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vessel_id: '',
    certificate_name: '',
    certificate_type: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
    status: 'valid',
    notes: '',
    document_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCertification({
      ...formData,
      vessel_id: formData.vessel_id || null,
      document_url: formData.document_url || null,
    });
    setFormData({
      vessel_id: '',
      certificate_name: '',
      certificate_type: '',
      issuing_authority: '',
      issue_date: '',
      expiry_date: '',
      status: 'valid',
      notes: '',
      document_url: '',
    });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      await deleteCertification(id);
    }
  };

  const getCertStatus = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return { status: 'expired', color: 'destructive', daysLeft };
    if (daysLeft <= 7) return { status: 'critical', color: 'destructive', daysLeft };
    if (daysLeft <= 30) return { status: 'expiring', color: 'secondary', daysLeft };
    return { status: 'valid', color: 'default', daysLeft };
  };

  const validCount = certifications.filter(c => getCertStatus(c.expiry_date).status === 'valid').length;
  const expiringCount = certifications.filter(c => getCertStatus(c.expiry_date).status === 'expiring').length;
  const criticalCount = certifications.filter(c => ['critical', 'expired'].includes(getCertStatus(c.expiry_date).status)).length;

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
          <h2 className="text-3xl font-bold text-foreground mb-2">📜 Vessel Certification</h2>
          <p className="text-muted-foreground">
            Track and manage all vessel certificates, compliance documents, and renewal schedules.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Certificate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificate_name">Certificate Name *</Label>
                <Input
                  id="certificate_name"
                  value={formData.certificate_name}
                  onChange={(e) => setFormData({ ...formData, certificate_name: e.target.value })}
                  required
                  placeholder="e.g., Safety Management Certificate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificate_type">Certificate Type *</Label>
                <Select value={formData.certificate_type} onValueChange={(v) => setFormData({ ...formData, certificate_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMC">Safety Management Certificate</SelectItem>
                    <SelectItem value="DOC">Document of Compliance</SelectItem>
                    <SelectItem value="ISPS">ISPS Certificate</SelectItem>
                    <SelectItem value="Class">Classification Certificate</SelectItem>
                    <SelectItem value="Load Line">Load Line Certificate</SelectItem>
                    <SelectItem value="IOPP">IOPP Certificate</SelectItem>
                    <SelectItem value="MLC">MLC Certificate</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vessel_id">Vessel</Label>
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
                <Label htmlFor="issuing_authority">Issuing Authority</Label>
                <Input
                  id="issuing_authority"
                  value={formData.issuing_authority}
                  onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                  placeholder="e.g., DNV GL"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date *</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    required
                  />
                </div>
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
                  Add Certificate
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
                <p className="text-sm text-muted-foreground">Total Certificates</p>
                <p className="text-2xl font-bold">{certifications.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valid</p>
                <p className="text-2xl font-bold text-green-500">{validCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-500">{expiringCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Certificate Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {certifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No certificates yet. Add your first certificate above.</p>
          ) : (
            <div className="space-y-4">
              {certifications.map((cert) => {
                const { status, color, daysLeft } = getCertStatus(cert.expiry_date);
                return (
                  <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{cert.certificate_name}</p>
                      <p className="text-sm text-muted-foreground">{cert.certificate_type} • {cert.issuing_authority || 'No authority specified'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm">Expires: {format(new Date(cert.expiry_date), 'MMM dd, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                        </p>
                      </div>
                      <Badge variant={color as "default" | "secondary" | "destructive"}>
                        {status}
                      </Badge>
                      <Button size="sm" variant="outline">Renew</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(cert.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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

export default VesselsCertification;
