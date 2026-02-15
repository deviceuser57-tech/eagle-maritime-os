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
    if (daysLeft < 0) return { status: 'expired', className: 'status-critical', daysLeft };
    if (daysLeft <= 7) return { status: 'critical', className: 'status-expired', daysLeft };
    if (daysLeft <= 30) return { status: 'expiring', className: 'status-warning', daysLeft };
    return { status: 'valid', className: 'status-valid', daysLeft };
  };

  const validCount = certifications.filter(c => getCertStatus(c.expiry_date).status === 'valid').length;
  const expiringCount = certifications.filter(c => getCertStatus(c.expiry_date).status === 'expiring').length;
  const criticalCount = certifications.filter(c => ['critical', 'expired'].includes(getCertStatus(c.expiry_date).status)).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Authenticating Certificates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-2 uppercase px-1">Certification Matrix</h2>
          <p className="text-muted-foreground text-base font-medium max-w-2xl px-1">
            Compliance monitoring of vessel documentation and regulatory timelines.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-maritime px-6 h-12 rounded-xl text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Issue Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-3xl border-border backdrop-blur-3xl shadow-soft">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">New Document Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="certificate_name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Document Name *</Label>
                <Input
                  id="certificate_name"
                  value={formData.certificate_name}
                  onChange={(e) => setFormData({ ...formData, certificate_name: e.target.value })}
                  required
                  placeholder="e.g., Load Line Certificate"
                  className="rounded-xl border-border bg-background/50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificate_type" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Dossier Classification *</Label>
                <Select value={formData.certificate_type} onValueChange={(v) => setFormData({ ...formData, certificate_type: v })}>
                  <SelectTrigger className="rounded-xl border-border bg-background/50 h-12">
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border backdrop-blur-3xl">
                    <SelectItem value="SMC">Safety Management Certificate</SelectItem>
                    <SelectItem value="DOC">Document of Compliance</SelectItem>
                    <SelectItem value="ISPS">ISPS Certificate</SelectItem>
                    <SelectItem value="Class">Classification Certificate</SelectItem>
                    <SelectItem value="Load Line">Load Line Certificate</SelectItem>
                    <SelectItem value="IOPP">IOPP Certificate</SelectItem>
                    <SelectItem value="MLC">MLC Certificate</SelectItem>
                    <SelectItem value="Other">Other Statutory Doc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vessel_id" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Associated Asset</Label>
                <Select value={formData.vessel_id} onValueChange={(v) => setFormData({ ...formData, vessel_id: v })}>
                  <SelectTrigger className="rounded-xl border-border bg-background/50 h-12">
                    <SelectValue placeholder="Assign vessel" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border backdrop-blur-3xl">
                    {vessels.map((vessel) => (
                      <SelectItem key={vessel.id} value={vessel.id}>{vessel.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuing_authority" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Issuing Body</Label>
                <Input
                  id="issuing_authority"
                  value={formData.issuing_authority}
                  onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                  placeholder="e.g., DNV, ABS, LR"
                  className="rounded-xl border-border bg-background/50 h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Issue</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    className="rounded-xl border-border bg-background/50 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Expiry *</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    required
                    className="rounded-xl border-border bg-background/50 h-12"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 px-8">
                  Cancel
                </Button>
                <Button type="submit" className="btn-maritime h-12 px-10">
                  Register Document
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Dossier Total</p>
                <p className="text-3xl font-black group-hover:translate-x-1 transition-transform origin-left">{certifications.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 text-primary">
                <FileText className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Certified</p>
                <p className="text-3xl font-black text-emerald-600 group-hover:translate-x-1 transition-transform origin-left">{validCount}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/5 text-emerald-600">
                <CheckCircle className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Review Required</p>
                <p className="text-3xl font-black text-amber-500 group-hover:translate-x-1 transition-transform origin-left">{expiringCount}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/5 text-amber-500">
                <Clock className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Statutory Breach</p>
                <p className="text-3xl font-black text-destructive group-hover:translate-x-1 transition-transform origin-left">{criticalCount}</p>
              </div>
              <div className="p-4 rounded-2xl bg-destructive/5 text-destructive">
                <AlertCircle className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="maritime-card">
        <div className="p-6 border-b border-border bg-slate-500/5">
          <h3 className="font-bold text-base tracking-tight uppercase">Document Status Pulse</h3>
          <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Regulatory compliance monitoring node</p>
        </div>
        <div className="p-4">
          {certifications.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground font-bold text-base uppercase tracking-tighter">Zero certificates on file.</p>
              <Button variant="link" onClick={() => setIsDialogOpen(true)} className="mt-2 text-primary font-bold uppercase text-sm">
                + EXECUTE INITIAL FILING
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {certifications.map((cert) => {
                const { status, className, daysLeft } = getCertStatus(cert.expiry_date);
                const vesselName = vessels.find(v => v.id === cert.vessel_id)?.name || 'Unassigned Asset';
                return (
                  <div key={cert.id} className="group/item flex items-center justify-between p-4 bg-white dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-border/40 hover:border-primary/40 rounded-2xl transition-all duration-300 hover:shadow-lg hover:translate-x-0.5">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-xl shadow-inner ${className} bg-background/50 group-hover/item:scale-105 transition-transform`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-base text-foreground group-hover/item:text-primary transition-colors">{cert.certificate_name}</p>
                          <span className="text-[9px] bg-slate-500/10 text-slate-500 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest">{cert.certificate_type}</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {vesselName} • <span className="text-primary/70">{cert.issuing_authority || 'Independent Entry'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground mb-0.5">Threshold</p>
                        <p className="text-xs font-bold text-foreground">{format(new Date(cert.expiry_date), 'MMM dd, yyyy')}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${daysLeft < 0 ? 'text-destructive' : 'text-primary'}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} overdue` : `${daysLeft}d left`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`${className} px-3 py-1 rounded-lg font-bold text-[9px] uppercase tracking-widest shadow-sm`}>
                          {status}
                        </span>
                        <div className="flex opacity-0 group-hover/item:opacity-100 transition-opacity gap-2">
                          <Button size="sm" variant="outline" className="h-8 rounded-lg font-bold uppercase text-[9px] tracking-widest px-3 hover:border-emerald-500/40 hover:bg-emerald-500/5">Renew</Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(cert.id)}
                            className="rounded-lg shadow-sm h-8 w-8"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VesselsCertification;
