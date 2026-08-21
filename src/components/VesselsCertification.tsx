import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, AlertCircle, CheckCircle, Clock, Plus, Loader2, Trash2, ShieldCheck, QrCode } from 'lucide-react';
import { useVesselCertifications } from '@/hooks/useVesselCertifications';
import { useVessels } from '@/hooks/useVessels';
import { useCurrencies } from '@/hooks/useSetupCrewConfig';
import { useCertificateTypes } from '@/hooks/useSetupCertificates';
import { useClassificationSocieties, useFlagStates } from '@/hooks/useSetupClassification';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { VerificationQR } from './compliance/VerificationQR';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const FALLBACK_CURRENCIES = [
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'SGD', label: 'SGD - Singapore Dollar' },
  { code: 'AED', label: 'AED - UAE Dirham' },
  { code: 'JPY', label: 'JPY - Japanese Yen' },
];

const VesselsCertification = () => {
  const { toast } = useToast();
  const { certifications, loading, addCertification, deleteCertification, sealCertificate } = useVesselCertifications();
  const { vessels } = useVessels();
  const { currencies } = useCurrencies();
  const { certificateTypes } = useCertificateTypes();
  const { societies } = useClassificationSocieties();
  const { flagStates } = useFlagStates();

  const authorityOptions = Array.from(new Set([
    ...societies.map(s => s.society_name),
    ...flagStates.map(f => f.flag_name)
  ].filter(Boolean)));

  const currencyOptions = currencies.length > 0
    ? currencies.map((c) => ({ code: c.currency_code, label: `${c.currency_code} - ${c.currency_name}` }))
    : FALLBACK_CURRENCIES;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vessel_id: '',
    certificate_name: '',
    certificate_type: '',
    certificate_number: '',
    issuing_authority: '',
    place_of_issue: '',
    issue_date: '',
    expiry_date: '',
    survey_type: '',
    surveyor_name: '',
    last_annual_date: '',
    next_annual_date: '',
    last_intermediate_date: '',
    next_intermediate_date: '',
    endorsement_details: '',
    limitations: '',
    renewal_reminder_days: '30',
    responsible_person: '',
    cost: '',
    currency: 'USD',
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
      certificate_number: '',
      issuing_authority: '',
      place_of_issue: '',
      issue_date: '',
      expiry_date: '',
      survey_type: '',
      surveyor_name: '',
      last_annual_date: '',
      next_annual_date: '',
      last_intermediate_date: '',
      next_intermediate_date: '',
      endorsement_details: '',
      limitations: '',
      renewal_reminder_days: '30',
      responsible_person: '',
      cost: '',
      currency: 'USD',
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-border backdrop-blur-3xl shadow-soft">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">New Certificate Registration</DialogTitle>
              <p className="text-xs text-muted-foreground font-medium">Complete statutory documentation entry</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl h-auto min-h-12">
                  <TabsTrigger value="basic" className="rounded-lg text-xs data-[state=active]:bg-background">Basic Info</TabsTrigger>
                  <TabsTrigger value="survey" className="rounded-lg text-xs data-[state=active]:bg-background">Survey Tracking</TabsTrigger>
                  <TabsTrigger value="details" className="rounded-lg text-xs data-[state=active]:bg-background">Details</TabsTrigger>
                  <TabsTrigger value="financial" className="rounded-lg text-xs data-[state=active]:bg-background">Financial</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-5 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="certificate_name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Document Name *</Label>
                      <Input
                        id="certificate_name"
                        value={formData.certificate_name}
                        onChange={(e) => setFormData({ ...formData, certificate_name: e.target.value })}
                        required
                        placeholder="e.g., Safety Management Certificate"
                        className="rounded-xl border-border bg-background/50 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="certificate_number" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Certificate Number</Label>
                      <Input
                        id="certificate_number"
                        value={formData.certificate_number}
                        onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                        placeholder="e.g., SMC-2024-001"
                        className="rounded-xl border-border bg-background/50 h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="certificate_type" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Classification *</Label>
                      {certificateTypes.length > 0 ? (
                        <Select value={formData.certificate_type} onValueChange={(v) => setFormData({ ...formData, certificate_type: v })}>
                          <SelectTrigger className="rounded-xl border-border bg-background/50 h-12">
                            <SelectValue placeholder="Select classification" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-border backdrop-blur-3xl">
                            {certificateTypes.map((c) => (
                              <SelectItem key={c.id} value={c.certificate_name}>{c.certificate_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
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
                            <SelectItem value="IAPP">IAPP Certificate</SelectItem>
                            <SelectItem value="MLC">MLC Certificate</SelectItem>
                            <SelectItem value="SOLAS">SOLAS Certificates</SelectItem>
                            <SelectItem value="Tonnage">Tonnage Certificate</SelectItem>
                            <SelectItem value="Registry">Registry Certificate</SelectItem>
                            <SelectItem value="Radio">Radio License</SelectItem>
                            <SelectItem value="Other">Other Statutory Doc</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vessel_id" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Associated Vessel</Label>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="issuing_authority" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Issuing Authority</Label>
                      {authorityOptions.length > 0 ? (
                        <Select value={formData.issuing_authority} onValueChange={(v) => setFormData({ ...formData, issuing_authority: v })}>
                          <SelectTrigger className="rounded-xl border-border bg-background/50 h-12">
                            <SelectValue placeholder="Select issuing authority" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-border backdrop-blur-3xl">
                            {authorityOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="issuing_authority"
                          value={formData.issuing_authority}
                          onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                          placeholder="e.g., DNV, ABS, LR, BV"
                          className="rounded-xl border-border bg-background/50 h-12"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="place_of_issue" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Place of Issue</Label>
                      <Input
                        id="place_of_issue"
                        value={formData.place_of_issue}
                        onChange={(e) => setFormData({ ...formData, place_of_issue: e.target.value })}
                        placeholder="e.g., Singapore, Rotterdam"
                        className="rounded-xl border-border bg-background/50 h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issue_date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Issue Date</Label>
                      <Input
                        id="issue_date"
                        type="date"
                        value={formData.issue_date}
                        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                        className="rounded-xl border-border bg-background/50 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry_date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Expiry Date *</Label>
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
                </TabsContent>

                <TabsContent value="survey" className="space-y-5 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="survey_type" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Survey Type</Label>
                      <Select value={formData.survey_type} onValueChange={(v) => setFormData({ ...formData, survey_type: v })}>
                        <SelectTrigger className="rounded-xl border-border bg-background/50 h-12">
                          <SelectValue placeholder="Select survey type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border backdrop-blur-3xl">
                          <SelectItem value="Initial">Initial Survey</SelectItem>
                          <SelectItem value="Annual">Annual Survey</SelectItem>
                          <SelectItem value="Intermediate">Intermediate Survey</SelectItem>
                          <SelectItem value="Renewal">Renewal Survey</SelectItem>
                          <SelectItem value="Special">Special Survey</SelectItem>
                          <SelectItem value="Additional">Additional Survey</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surveyor_name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Surveyor Name</Label>
                      <Input
                        id="surveyor_name"
                        value={formData.surveyor_name}
                        onChange={(e) => setFormData({ ...formData, surveyor_name: e.target.value })}
                        placeholder="e.g., John Smith"
                        className="rounded-xl border-border bg-background/50 h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="last_annual_date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Last Annual Survey</Label>
                      <Input
                        id="last_annual_date"
                        type="date"
                        value={formData.last_annual_date}
                        onChange={(e) => setFormData({ ...formData, last_annual_date: e.target.value })}
                        className="rounded-xl border-border bg-background/50 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="next_annual_date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Next Annual Survey</Label>
                      <Input
                        id="next_annual_date"
                        type="date"
                        value={formData.next_annual_date}
                        onChange={(e) => setFormData({ ...formData, next_annual_date: e.target.value })}
                        className="rounded-xl border-border bg-background/50 h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="last_intermediate_date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Last Intermediate Survey</Label>
                      <Input
                        id="last_intermediate_date"
                        type="date"
                        value={formData.last_intermediate_date}
                        onChange={(e) => setFormData({ ...formData, last_intermediate_date: e.target.value })}
                        className="rounded-xl border-border bg-background/50 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="next_intermediate_date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Next Intermediate Survey</Label>
                      <Input
                        id="next_intermediate_date"
                        type="date"
                        value={formData.next_intermediate_date}
                        onChange={(e) => setFormData({ ...formData, next_intermediate_date: e.target.value })}
                        className="rounded-xl border-border bg-background/50 h-12"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-5 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="responsible_person" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Responsible Person</Label>
                    <Input
                      id="responsible_person"
                      value={formData.responsible_person}
                      onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                      placeholder="e.g., Chief Engineer, DPA"
                      className="rounded-xl border-border bg-background/50 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="renewal_reminder_days" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Renewal Reminder (Days Before Expiry)</Label>
                    <Input
                      id="renewal_reminder_days"
                      type="number"
                      value={formData.renewal_reminder_days}
                      onChange={(e) => setFormData({ ...formData, renewal_reminder_days: e.target.value })}
                      placeholder="30"
                      className="rounded-xl border-border bg-background/50 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endorsement_details" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Endorsements</Label>
                    <Textarea
                      id="endorsement_details"
                      value={formData.endorsement_details}
                      onChange={(e) => setFormData({ ...formData, endorsement_details: e.target.value })}
                      placeholder="List any endorsements or special conditions..."
                      rows={3}
                      className="rounded-xl border-border bg-background/50 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="limitations" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Limitations / Conditions</Label>
                    <Textarea
                      id="limitations"
                      value={formData.limitations}
                      onChange={(e) => setFormData({ ...formData, limitations: e.target.value })}
                      placeholder="Specify any limitations or special conditions..."
                      rows={3}
                      className="rounded-xl border-border bg-background/50 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Internal notes and observations..."
                      rows={3}
                      className="rounded-xl border-border bg-background/50 resize-none"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-5 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="cost" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Certificate Cost</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="0.00"
                        className="rounded-xl border-border bg-background/50 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Currency</Label>
                      <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                        <SelectTrigger className="rounded-xl border-border bg-background/50 h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border backdrop-blur-3xl">
                          {currencyOptions.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>

                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document_url" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Document URL / File Path</Label>
                    <Input
                      id="document_url"
                      value={formData.document_url}
                      onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                      placeholder="https://... or /path/to/document"
                      className="rounded-xl border-border bg-background/50 h-12"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 px-8">
                  Cancel
                </Button>
                <Button type="submit" className="btn-maritime h-12 px-10">
                  Register Certificate
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
                          {cert.is_sealed ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-lg font-bold uppercase text-[9px] tracking-widest px-3 border-blue-500/40 bg-blue-500/5 text-blue-600 hover:bg-blue-500/10"
                                >
                                  <QrCode className="h-3.5 w-3.5 mr-1" />
                                  Verify
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl">
                                <VerificationQR
                                  token={cert.verification_token || ''}
                                  certName={cert.certificate_name}
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-lg font-bold uppercase text-[9px] tracking-widest px-3 hover:border-blue-500/40 hover:bg-blue-500/5"
                              onClick={() => sealCertificate(cert.id)}
                            >
                              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                              Seal
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-lg font-bold uppercase text-[9px] tracking-widest px-3 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                            onClick={() => toast({ title: "Renewal Initiated", description: `Automatic renewal workflow started for ${cert.certificate_name}.` })}
                          >
                            Renew
                          </Button>
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
