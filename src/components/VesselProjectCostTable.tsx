import { useMemo, useState } from 'react';
import { Calculator, RefreshCw, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useVessels } from '@/hooks/useVessels';
import { useVesselProjectCosts } from '@/hooks/useVesselProjectCosts';

type CostRow = {
  vesselId: string;
  vesselName: string;
  projectReference: string;
  projectSpecificCosts: number;
  currency: string;
  projectDays: number;
  dailyOperatingCost: number;
  operatingCostTotal: number;
  totalProjectCost: number;
  lineCount: number;
};

const money = (value: number, currency: string) => `${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

export default function VesselProjectCostTable() {
  const { orgId } = useOrganization();
  const { vessels, loading } = useVessels();
  const { toast } = useToast();
  const [rows, setRows] = useState<CostRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [savingReference, setSavingReference] = useState<string | null>(null);
  const [newCost, setNewCost] = useState({ vesselId: '', projectReference: '', description: '', amount: '', notes: '' });

  const load = async () => {
    if (!orgId) return;
    setRefreshing(true);
    try {
      const [{ data: costs, error: costsError }, { data: summaries, error: summaryError }] = await Promise.all([
        supabase.from('vessel_project_costs').select('*').eq('org_id', orgId).order('created_at', { ascending: true }),
        supabase.from('vessel_daily_cost_summary').select('*').eq('org_id', orgId),
      ]);
      if (costsError) throw costsError;
      if (summaryError) throw summaryError;

      const summaryMap = new Map((summaries || []).map((s: any) => [s.vessel_id, s]));
      const vesselMap = new Map(vessels.map(v => [v.id, v]));
      const grouped = new Map<string, CostRow>();
      for (const cost of costs || []) {
        const vessel = vesselMap.get(cost.vessel_id);
        if (!vessel) continue;
        const key = `${cost.vessel_id}::${cost.project_reference || 'UNREFERENCED'}`;
        const existing = grouped.get(key);
        const summary: any = summaryMap.get(cost.vessel_id) || {};
        const daily = Number(summary.total_daily_vessel_operating_cost || 0);
        if (existing) {
          existing.projectSpecificCosts += Number(cost.amount || 0);
          existing.lineCount += 1;
          existing.operatingCostTotal = daily * existing.projectDays;
          existing.totalProjectCost = existing.operatingCostTotal + existing.projectSpecificCosts;
        } else {
          const days = 1;
          const specific = Number(cost.amount || 0);
          grouped.set(key, {
            vesselId: cost.vessel_id,
            vesselName: vessel.name,
            projectReference: cost.project_reference || 'Unreferenced',
            projectSpecificCosts: specific,
            currency: summary.currency_code || cost.currency_code || 'USD',
            projectDays: days,
            dailyOperatingCost: daily,
            operatingCostTotal: daily * days,
            totalProjectCost: daily * days + specific,
            lineCount: 1,
          });
        }
      }
      setRows(Array.from(grouped.values()));
    } catch (error: any) {
      toast({ title: 'Project cost table failed to load', description: error.message, variant: 'destructive' });
    } finally {
      setRefreshing(false);
    }
  };

  const saveCost = async () => {
    if (!orgId || !newCost.vesselId || !newCost.description.trim() || Number(newCost.amount) < 0) {
      toast({ title: 'Project cost save failed', description: 'Select a vessel and enter a description and a valid non-negative amount.', variant: 'destructive' });
      return;
    }
    setSavingReference(newCost.projectReference || 'new');
    try {
      const { data: financial } = await supabase.from('vessel_financial_baseline').select('currency_code').eq('vessel_id', newCost.vesselId).eq('org_id', orgId).maybeSingle();
      const { data, error } = await supabase.from('vessel_project_costs').insert({
        org_id: orgId,
        vessel_id: newCost.vesselId,
        project_reference: newCost.projectReference.trim() || null,
        description: newCost.description.trim(),
        amount: Number(newCost.amount),
        currency_code: financial?.currency_code || 'USD',
        notes: newCost.notes.trim() || null,
      }).select('*').single();
      if (error) throw error;
      if (!data?.id) throw new Error('Database did not return the saved project cost record.');
      const { data: verification, error: verifyError } = await supabase.from('vessel_project_costs').select('*').eq('id', data.id).eq('org_id', orgId).single();
      if (verifyError) throw new Error(`Saved, but verification failed: ${verifyError.message}`);
      toast({ title: 'Project cost saved', description: `Verified database record ${verification.id}.` });
      setNewCost({ vesselId: '', projectReference: '', description: '', amount: '', notes: '' });
      await load();
    } catch (error: any) {
      toast({ title: 'Project cost save failed', description: error.message || 'The database write failed.', variant: 'destructive' });
    } finally {
      setSavingReference(null);
    }
  };

  const updateDays = async (row: CostRow, days: number) => {
    const safeDays = Math.max(0, Math.floor(Number(days) || 0));
    const { data, error } = await supabase.rpc('calculate_vessel_project_cost', {
      p_vessel_id: row.vesselId,
      p_project_days: safeDays,
      p_project_reference: row.projectReference === 'Unreferenced' ? null : row.projectReference,
    });
    if (error) {
      toast({ title: 'Project cost calculation failed', description: error.message, variant: 'destructive' });
      return;
    }
    const calculated: any = data?.[0];
    if (!calculated) return;
    setRows(current => current.map(item => item === row ? {
      ...item,
      projectDays: safeDays,
      dailyOperatingCost: Number(calculated.daily_operating_cost || 0),
      operatingCostTotal: Number(calculated.operating_cost_total || 0),
      projectSpecificCosts: Number(calculated.project_specific_costs || 0),
      totalProjectCost: Number(calculated.total_project_cost || 0),
      currency: calculated.currency_code || item.currency,
    } : item));
  };

  const total = useMemo(() => rows.reduce((sum, row) => sum + row.totalProjectCost, 0), [rows]);

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-black">Vessel Project Costing</h2>
        <p className="text-sm text-muted-foreground">Transparent project cost = daily vessel operating cost × project days + project-specific costs.</p>
      </div>
      <Button variant="outline" onClick={load} disabled={refreshing || loading}><RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh</Button>
    </div>

    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Save className="h-5 w-5" />Save Project Cost</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-5">
        <div className="space-y-1.5"><Label>Vessel</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={newCost.vesselId} onChange={e => setNewCost(p => ({ ...p, vesselId: e.target.value }))}><option value="">Select vessel</option>{vessels.map(v => <option key={v.id} value={v.id}>{v.name}{v.imo_number ? ` — IMO ${v.imo_number}` : ''}</option>)}</select></div>
        <div className="space-y-1.5"><Label>Project Reference</Label><Input value={newCost.projectReference} onChange={e => setNewCost(p => ({ ...p, projectReference: e.target.value }))} placeholder="Project / PO / Job ref" /></div>
        <div className="space-y-1.5"><Label>Description</Label><Input value={newCost.description} onChange={e => setNewCost(p => ({ ...p, description: e.target.value }))} placeholder="Project-specific cost" /></div>
        <div className="space-y-1.5"><Label>Amount</Label><Input type="number" min="0" step="0.01" value={newCost.amount} onChange={e => setNewCost(p => ({ ...p, amount: e.target.value }))} /></div>
        <div className="flex items-end"><Button className="w-full" onClick={saveCost} disabled={!!savingReference}><Save className="mr-2 h-4 w-4" />Save & Verify</Button></div>
        <div className="space-y-1.5 md:col-span-5"><Label>Notes</Label><Input value={newCost.notes} onChange={e => setNewCost(p => ({ ...p, notes: e.target.value }))} placeholder="Optional audit note" /></div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>Project Cost Table — All Vessels</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead><tr className="border-b text-left"><th className="p-3">Vessel</th><th className="p-3">Project</th><th className="p-3">Days</th><th className="p-3">Daily Operating Cost</th><th className="p-3">Operating Total</th><th className="p-3">Project-Specific</th><th className="p-3">Total Project Cost</th><th className="p-3">Lines</th></tr></thead>
          <tbody>{rows.map((row, index) => <tr key={`${row.vesselId}-${row.projectReference}-${index}`} className="border-b hover:bg-muted/40">
            <td className="p-3 font-semibold">{row.vesselName}</td>
            <td className="p-3"><Badge variant="outline">{row.projectReference}</Badge></td>
            <td className="p-3"><Input className="w-20" type="number" min="0" step="1" value={row.projectDays} onChange={e => updateDays(row, Number(e.target.value))} /></td>
            <td className="p-3 font-medium">{money(row.dailyOperatingCost, row.currency)}</td>
            <td className="p-3">{money(row.operatingCostTotal, row.currency)}</td>
            <td className="p-3">{money(row.projectSpecificCosts, row.currency)}</td>
            <td className="p-3 font-black">{money(row.totalProjectCost, row.currency)}</td>
            <td className="p-3">{row.lineCount}</td>
          </tr>)}{!rows.length && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No project-specific cost lines exist yet. Add a real cost above to populate the table.</td></tr>}</tbody>
          {rows.length > 0 && <tfoot><tr className="border-t-2 font-black"><td className="p-3" colSpan={6}>Total Project Cost (same currency only)</td><td className="p-3">{money(total, rows[0].currency)}</td><td /></tr></tfoot>}
        </table>
      </CardContent>
    </Card>

    <Card className="border-primary/20 bg-primary/5"><CardContent className="p-4 flex items-start gap-3"><Calculator className="h-5 w-5 mt-0.5 text-primary" /><div className="text-sm"><p className="font-bold">Transparent calculation</p><p className="text-muted-foreground">Daily operating cost is sourced from the existing vessel financial cost summary. Hire rate is not included as an operating cost. The project total is recalculated through the database function when project days change.</p></div></CardContent></Card>
  </div>;
}
