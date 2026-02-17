import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, X, Link as LinkIcon, Globe, Lock, Info } from 'lucide-react';
import { useRegulations } from '@/hooks/useRegulations';
import { useCertificateTypes as useSetupCertificates } from '@/hooks/useSetupCertificates';
import { useAuditTypes } from '@/hooks/useSetupAuditConfig';
import { useVessels } from '@/hooks/useVessels';
import { Regulation } from '@/types';

const RegulatoryManager = () => {
    const {
        regulations,
        certificateLinks,
        auditLinks,
        vesselLinks,
        isLoading,
        upsertRegulation,
        linkToCertificate,
        linkToAudit,
        tagVessel
    } = useRegulations();

    const { certificateTypes } = useSetupCertificates();
    const { auditTypes } = useAuditTypes();
    const { vessels } = useVessels();

    const [editingReg, setEditingReg] = useState<Partial<Regulation> | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [linkingTarget, setLinkingTarget] = useState<{ regId: string; type: 'cert' | 'audit' | 'vessel' } | null>(null);
    const [linkData, setLinkData] = useState<any>({});

    const handleSaveReg = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingReg) {
            upsertRegulation.mutate(editingReg);
            setEditingReg(null);
            setIsAddMode(false);
        }
    };

    const handleLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkingTarget) return;

        if (linkingTarget.type === 'cert') {
            linkToCertificate.mutate({
                regulationId: linkingTarget.regId,
                certificateTypeId: linkData.targetId,
                mandatory: linkData.mandatory ?? true,
                notes: linkData.notes
            });
        } else if (linkingTarget.type === 'audit') {
            linkToAudit.mutate({
                regulationId: linkingTarget.regId,
                auditTypeId: linkData.targetId
            });
        } else if (linkingTarget.type === 'vessel') {
            tagVessel.mutate({
                regulationId: linkingTarget.regId,
                vesselId: linkData.targetId,
                relevanceType: linkData.relevanceType || 'General'
            });
        }
        setLinkingTarget(null);
        setLinkData({});
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-5 rounded-t-2xl border-b border-white/5">
                <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Regulatory Intelligence Layer</h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">System-Wide Compliance Standards</p>
                </div>
                <Button onClick={() => { setIsAddMode(true); setEditingReg({ isGlobal: true }); }} className="btn-maritime">
                    <Plus className="h-4 w-4 mr-2" />
                    New Regulation
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 border border-border rounded-b-2xl bg-card">
                {isLoading ? (
                    <div className="py-10 text-center text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">
                        Synchronizing Regulatory Database...
                    </div>
                ) : regulations.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground italic">No regulations initialized in this tenant sector.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {regulations.map(reg => (
                            <div key={reg.id} className="maritime-card group">
                                <div className="p-4 flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={reg.isGlobal ? "secondary" : "outline"} className="text-[10px] font-black tracking-tighter uppercase px-1.5">
                                                {reg.isGlobal ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1 text-amber-500" />}
                                                {reg.isGlobal ? 'Global' : 'Tenant'}
                                            </Badge>
                                            <span className="text-xs font-black text-primary tracking-widest">{reg.convention}</span>
                                            <h4 className="text-sm font-bold text-foreground">{reg.code}: {reg.title}</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground italic">{reg.description || 'No description provided.'}</p>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {/* Linked Counts */}
                                            <Badge variant="outline" className="bg-slate-50 text-[10px]">
                                                Certs: {certificateLinks.filter(l => l.regulationId === reg.id).length}
                                            </Badge>
                                            <Badge variant="outline" className="bg-slate-50 text-[10px]">
                                                Audits: {auditLinks.filter(l => l.regulationId === reg.id).length}
                                            </Badge>
                                            <Badge variant="outline" className="bg-slate-50 text-[10px]">
                                                Vessels: {vesselLinks.filter(l => l.regulationId === reg.id).length}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" onClick={() => { setLinkingTarget({ regId: reg.id, type: 'cert' }); }} title="Link to Certificate">
                                            <LinkIcon className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setEditingReg(reg)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Editing / Adding Dialog */}
            {(isAddMode || editingReg?.id) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-background rounded-2xl p-6 w-full max-w-lg border border-border shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase tracking-tighter">
                                {isAddMode ? 'Initialize' : 'Amend'} Regulation
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingReg(null); setIsAddMode(false); }}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSaveReg} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Convention Type</Label>
                                    <Select
                                        value={editingReg?.convention}
                                        onValueChange={(v) => setEditingReg({ ...editingReg, convention: v })}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl font-bold">
                                            <SelectValue placeholder="Select Convention" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SOLAS">SOLAS</SelectItem>
                                            <SelectItem value="MARPOL">MARPOL</SelectItem>
                                            <SelectItem value="STCW">STCW</SelectItem>
                                            <SelectItem value="IACS">IACS</SelectItem>
                                            <SelectItem value="Flag State">Flag State</SelectItem>
                                            <SelectItem value="MLC">MLC</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Regulation Code</Label>
                                    <Input
                                        value={editingReg?.code || ''}
                                        onChange={e => setEditingReg({ ...editingReg, code: e.target.value })}
                                        placeholder="e.g. II-1/3-10"
                                        className="h-10 rounded-xl font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Regulation Title</Label>
                                <Input
                                    value={editingReg?.title || ''}
                                    onChange={e => setEditingReg({ ...editingReg, title: e.target.value })}
                                    placeholder="Full Title of the Regulation"
                                    className="h-10 rounded-xl font-bold"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                                <Input
                                    value={editingReg?.description || ''}
                                    onChange={e => setEditingReg({ ...editingReg, description: e.target.value })}
                                    className="h-10 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <Checkbox
                                    id="isGlobal"
                                    checked={editingReg?.isGlobal}
                                    onCheckedChange={(checked) => setEditingReg({ ...editingReg, isGlobal: checked as boolean })}
                                />
                                <Label htmlFor="isGlobal" className="text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                                    <Globe className="h-3.5 w-3.5 text-primary" />
                                    Global Regulation (Visible to all tenants)
                                </Label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" className="btn-maritime flex-1 h-12 text-sm font-black uppercase tracking-widest">
                                    Commit to Database
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setEditingReg(null); setIsAddMode(false); }} className="h-12 rounded-xl">
                                    Abort
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Linking Dialog */}
            {linkingTarget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-background rounded-2xl p-6 w-full max-w-md border border-border">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-primary" />
                            Establishing Logical Link
                        </h3>

                        <form onSubmit={handleLink} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Select Target {linkingTarget.type === 'cert' ? 'Certificate' : linkingTarget.type === 'audit' ? 'Audit' : 'Vessel'}
                                </Label>
                                <Select onValueChange={(v) => setLinkData({ ...linkData, targetId: v })}>
                                    <SelectTrigger className="h-10 rounded-xl font-bold">
                                        <SelectValue placeholder={`Select ${linkingTarget.type}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {linkingTarget.type === 'cert' && certificateTypes.map(c => <SelectItem key={c.id} value={c.id}>{c.certificate_name}</SelectItem>)}
                                        {linkingTarget.type === 'audit' && auditTypes.map(a => <SelectItem key={a.id} value={a.id}>{a.audit_type_name}</SelectItem>)}
                                        {linkingTarget.type === 'vessel' && vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {linkingTarget.type === 'cert' && (
                                <div className="flex items-center gap-2">
                                    <Checkbox id="mandatory" checked={linkData.mandatory ?? true} onCheckedChange={(v) => setLinkData({ ...linkData, mandatory: v })} />
                                    <Label htmlFor="mandatory" className="text-xs font-bold">Mandatory Compliance</Label>
                                </div>
                            )}

                            {linkingTarget.type === 'vessel' && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Relevance Type</Label>
                                    <Input value={linkData.relevanceType || ''} onChange={e => setLinkData({ ...linkData, relevanceType: e.target.value })} placeholder="e.g. Structural, Safety" className="h-10 rounded-xl" />
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" className="btn-maritime flex-1 h-12 text-sm font-black uppercase tracking-widest">
                                    Create Link
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setLinkingTarget(null)} className="h-12 rounded-xl">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegulatoryManager;
