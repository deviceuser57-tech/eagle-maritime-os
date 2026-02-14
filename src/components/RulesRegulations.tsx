import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Search, FileText, AlertTriangle, Loader2, Plus, ExternalLink, Upload, Link, Ship, Trash2, X } from 'lucide-react';
import { useAudits } from '@/hooks/useAudits';
import { useVesselCertifications } from '@/hooks/useVesselCertifications';
import { useCustomRegulations } from '@/hooks/useCustomRegulations';
import { useVessels } from '@/hooks/useVessels';

const STANDARD_REGULATIONS = [
  { code: 'SOLAS', title: 'Safety of Life at Sea', version: 'Consolidated 2024', category: 'Safety', link: 'https://www.imo.org/en/About/Conventions/Pages/International-Convention-for-the-Safety-of-Life-at-Sea-(SOLAS),-1974.aspx' },
  { code: 'MARPOL', title: 'Marine Pollution', version: 'Annex I-VI 2024', category: 'Environmental', link: 'https://www.imo.org/en/About/Conventions/Pages/International-Convention-for-the-Prevention-of-Pollution-from-Ships-(MARPOL).aspx' },
  { code: 'ISM Code', title: 'International Safety Management', version: '2018 Edition', category: 'Management', link: 'https://www.imo.org/en/OurWork/HumanElement/Pages/ISMCode.aspx' },
  { code: 'ISPS Code', title: 'Ship and Port Facility Security', version: '2003 + Amendments', category: 'Security', link: 'https://www.imo.org/en/OurWork/Security/Pages/SOLAS-XI-2%20ISPS%20Code.aspx' },
  { code: 'MLC 2006', title: 'Maritime Labour Convention', version: '2006 as amended', category: 'Labour', link: 'https://www.ilo.org/global/standards/maritime-labour-convention/lang--en/index.htm' },
  { code: 'STCW', title: 'Standards of Training, Certification and Watchkeeping', version: '2010 Manila Amendments', category: 'Training', link: 'https://www.imo.org/en/OurWork/HumanElement/Pages/STCW-Convention.aspx' },
  { code: 'BWM', title: 'Ballast Water Management', version: '2017 Convention', category: 'Environmental', link: 'https://www.imo.org/en/OurWork/Environment/Pages/BWMConventionandGuidelines.aspx' },
  { code: 'CII/EEXI', title: 'Carbon Intensity Indicator / Energy Efficiency', version: 'MEPC.328(76)', category: 'Environmental', link: 'https://www.imo.org/en/OurWork/Environment/Pages/Technical-and-Operational-Measures.aspx' },
];

const CATEGORIES = ['Safety', 'Environmental', 'Management', 'Security', 'Labour', 'Training', 'General', 'Other'];

const RulesRegulations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);
  const [assignVesselId, setAssignVesselId] = useState('');
  const { audits, isLoading: auditsLoading } = useAudits();
  const { certifications, loading: certsLoading } = useVesselCertifications();
  const { regulations, regulationVessels, isLoading: regsLoading, createRegulation, deleteRegulation, assignVessel, removeVesselAssignment, uploadFile } = useCustomRegulations();
  const { vessels } = useVessels();

  const [formData, setFormData] = useState({
    code: '', title: '', description: '', category: 'General', version: '', link: '', notes: '',
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isLoading = auditsLoading || certsLoading || regsLoading;

  const handleSubmit = async () => {
    if (!formData.code || !formData.title) return;

    let file_url: string | null = null;
    let file_name: string | null = null;

    if (selectedFile) {
      setUploadingFile(true);
      const result = await uploadFile(selectedFile);
      setUploadingFile(false);
      if (result) {
        file_url = result.url;
        file_name = result.name;
      }
    }

    await createRegulation.mutateAsync({
      ...formData,
      link: formData.link || null,
      description: formData.description || null,
      version: formData.version || null,
      notes: formData.notes || null,
      file_url,
      file_name,
    });

    setFormData({ code: '', title: '', description: '', category: 'General', version: '', link: '', notes: '' });
    setSelectedFile(null);
    setIsAddOpen(false);
  };

  const handleAssignVessel = async (regId: string) => {
    if (!assignVesselId) return;
    await assignVessel.mutateAsync({ regulation_id: regId, vessel_id: assignVesselId });
    setAssignVesselId('');
  };

  // Merge standard + custom for display
  const allRegulations = [
    ...STANDARD_REGULATIONS.map(r => ({ ...r, isStandard: true, id: r.code })),
    ...regulations.map(r => ({ ...r, isStandard: false })),
  ];

  const filtered = allRegulations.filter(reg =>
    searchQuery === '' ||
    reg.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedAudits = audits?.filter(a => a.status === 'completed') || [];
  const validCerts = certifications?.filter(c => c.status === 'valid') || [];
  const totalItems = (audits?.length || 0) + (certifications?.length || 0);
  const compliantItems = completedAudits.length + validCerts.length;
  const complianceRate = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading regulations data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">📜 Rules & Regulations</h2>
          <p className="text-muted-foreground">
            Manage maritime regulations, upload documents, and assign vessel compliance.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Regulation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Regulation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code / Reference *</Label>
                  <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. SOLAS Ch.II-2" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Full regulation title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Version / Edition</Label>
                  <Input value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} placeholder="e.g. 2024 Amendment" />
                </div>
                <div className="space-y-2">
                  <Label><Link className="h-3 w-3 inline mr-1" />Regulation Link (URL)</Label>
                  <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label><Upload className="h-3 w-3 inline mr-1" />Upload Document (PDF, DOC)</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile && <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} placeholder="Brief description..." />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} placeholder="Internal notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSubmit} disabled={!formData.code || !formData.title || createRegulation.isPending || uploadingFile} className="flex-1">
                  {(createRegulation.isPending || uploadingFile) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Regulation
                </Button>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Regulations</p>
                <p className="text-2xl font-bold">{STANDARD_REGULATIONS.length + regulations.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custom Added</p>
                <p className="text-2xl font-bold text-primary">{regulations.length}</p>
              </div>
              <Plus className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vessels Assigned</p>
                <p className="text-2xl font-bold">{regulationVessels.length}</p>
              </div>
              <Ship className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <p className={`text-2xl font-bold ${complianceRate >= 90 ? 'text-green-500' : 'text-orange-500'}`}>{complianceRate}%</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="maritime-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by code, title, or category..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Regulations List */}
      <Card className="maritime-card">
        <CardHeader><CardTitle>All Regulations ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No regulations match your search.</div>
            ) : (
              filtered.map((reg) => {
                const vesselAssignments = !reg.isStandard ? regulationVessels.filter(rv => rv.regulation_id === reg.id) : [];
                const isExpanded = selectedRegulation === reg.id;

                return (
                  <div key={reg.id} className="border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex-1 cursor-pointer" onClick={() => !reg.isStandard && setSelectedRegulation(isExpanded ? null : reg.id)}>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{reg.code} - {reg.title}</p>
                          {reg.isStandard && <Badge variant="outline" className="text-xs">IMO Standard</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reg.version || ''}
                          {!reg.isStandard && (reg as any).file_name && (
                            <span className="ml-2">📎 {(reg as any).file_name}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{reg.category}</Badge>
                        {!reg.isStandard && vesselAssignments.length > 0 && (
                          <Badge variant="secondary"><Ship className="h-3 w-3 mr-1" />{vesselAssignments.length} vessels</Badge>
                        )}
                        {reg.isStandard && 'link' in reg && reg.link && (
                          <Button size="sm" variant="outline" onClick={() => window.open(reg.link!, '_blank')}>
                            <ExternalLink className="h-3 w-3 mr-1" />View
                          </Button>
                        )}
                        {!reg.isStandard && 'link' in reg && reg.link && (
                          <Button size="sm" variant="outline" onClick={() => window.open(reg.link!, '_blank')}>
                            <ExternalLink className="h-3 w-3 mr-1" />Link
                          </Button>
                        )}
                        {!reg.isStandard && (
                          <Button size="sm" variant="ghost" onClick={() => { if (confirm('Delete this regulation?')) deleteRegulation.mutate(reg.id); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded section for custom regulations - vessel assignment */}
                    {!reg.isStandard && isExpanded && (
                      <div className="border-t px-4 py-3 bg-muted/30 space-y-3">
                        {!reg.isStandard && (reg as any).description && (
                          <p className="text-sm text-muted-foreground">{(reg as any).description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Select value={assignVesselId} onValueChange={setAssignVesselId}>
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Assign vessel..." />
                            </SelectTrigger>
                            <SelectContent>
                              {vessels.filter(v => !vesselAssignments.find(va => va.vessel_id === v.id)).map(v => (
                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => handleAssignVessel(reg.id)} disabled={!assignVesselId}>
                            <Plus className="h-3 w-3 mr-1" />Assign
                          </Button>
                        </div>
                        {vesselAssignments.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {vesselAssignments.map(va => (
                              <Badge key={va.id} variant="secondary" className="flex items-center gap-1">
                                <Ship className="h-3 w-3" />
                                {va.vessels?.name || 'Unknown'}
                                <button onClick={() => removeVesselAssignment.mutate(va.id)} className="ml-1 hover:text-destructive">
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RulesRegulations;
