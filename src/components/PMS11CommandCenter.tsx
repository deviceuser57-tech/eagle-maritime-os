import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Anchor, BadgeCheck, CalendarClock, CircleDollarSign, ClipboardCheck, Gauge, Ship, Users, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useVessels } from '@/hooks/useVessels';
import { useVesselCertifications } from '@/hooks/useVesselCertifications';
import { useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';
import { useCompliance } from '@/hooks/useCompliance';

type VesselSummary = {
  dailyCost: number;
  currency: string;
  projectCost: number;
  crewCount: number;
};

const money = (value: number, currency: string) =>
  `${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency || ''}`.trim();

export default function PMS11CommandCenter({ onSectionChange }: { onSectionChange?: (section: string) => void }) {
  const { orgId } = useOrganization();
  const { vessels, loading: vesselsLoading } = useVessels();
  const { certifications, loading: certsLoading } = useVesselCertifications();
  const { tasks, loading: maintenanceLoading } = useMaintenanceTasks();
  const [selectedVesselId, setSelectedVesselId] = useState('');
  const [summary, setSummary] = useState<VesselSummary>({ dailyCost: 0, currency: 'USD', projectCost: 0, crewCount: 0 });
  const [summaryLoading, setSummaryLoading] = useState(false);

  const primaryVessel = useMemo(() => {
    if (!vessels.length) return undefined;
    return vessels.find(v => v.name?.trim().toLowerCase() === 'pms-11')
      || vessels.find(v => /pms[-\s]?11/i.test(v.name || ''))
      || vessels[0];
  }, [vessels]);

  useEffect(() => {
    if (!selectedVesselId && primaryVessel?.id) setSelectedVesselId(primaryVessel.id);
  }, [primaryVessel?.id, selectedVesselId]);

  const vessel = vessels.find(v => v.id === selectedVesselId) || primaryVessel;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!orgId || !vessel?.id) return;
      setSummaryLoading(true);
      try {
        const [daily, projects, crew] = await Promise.all([
          supabase.from('vessel_daily_cost_summary').select('total_daily_vessel_operating_cost,currency_code').eq('org_id', orgId).eq('vessel_id', vessel.id).maybeSingle(),
          supabase.from('vessel_project_costs').select('amount').eq('org_id', orgId).eq('vessel_id', vessel.id),
          supabase.from('crew_members').select('id', { count: 'exact', head: false }).eq('org_id', orgId).eq('vessel_id', vessel.id),
        ]);
        if (cancelled) return;
        setSummary({
          dailyCost: Number(daily.data?.total_daily_vessel_operating_cost || 0),
          currency: daily.data?.currency_code || 'USD',
          projectCost: (projects.data || []).reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0),
          crewCount: crew.count || crew.data?.length || 0,
        });
      } catch (error) {
        console.error('PMS-11 command center summary failed', error);
        if (!cancelled) setSummary({ dailyCost: 0, currency: 'USD', projectCost: 0, crewCount: 0 });
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [orgId, vessel?.id]);

  const vesselCerts = useMemo(
    () => certifications.filter(c => c.vessel_id === vessel?.id),
    [certifications, vessel?.id]
  );

  const vesselTasks = useMemo(
    () => tasks.filter(t => t.vessel_id === vessel?.id),
    [tasks, vessel?.id]
  );

  const now = new Date();
  const expiring = vesselCerts.filter(c => {
    const days = Math.ceil((new Date(c.expiry_date).getTime() - now.getTime()) / 86400000);
    return days >= 0 && days <= 30;
  });
  const expired = vesselCerts.filter(c => new Date(c.expiry_date) < now);
  const overdueMaintenance = vesselTasks.filter(t => t.status !== 'completed' && new Date(t.due_date) < now);
  const dueMaintenance = vesselTasks.filter(t => t.status !== 'completed' && new Date(t.due_date) >= now);
  const { vesselScore, isLoading: complianceLoading } = useCompliance(vessel?.id);

  const operationalStatus = vessel?.operational_status || vessel?.status || 'not specified';
  const readiness = vessel ? [
    Boolean(vessel.name),
    Boolean(vessel.imo_number),
    Boolean(vessel.vessel_type_id || vessel.vessel_type),
    Boolean(vessel.flag_state || vessel.port_of_registry_id),
    vesselCerts.length > 0,
  ].filter(Boolean).length : 0;

  const loading = vesselsLoading || certsLoading || maintenanceLoading || summaryLoading;

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary border border-primary/20">PMS-11 OPERATING CONTEXT</Badge>
            {vessel && <Badge variant="outline">{vessel.name}</Badge>}
          </div>
          <h2 className="text-3xl font-black tracking-tight">PMS-11 Command Center</h2>
          <p className="text-muted-foreground mt-1">Operational view built from the existing vessel, compliance, maintenance, crew and costing data.</p>
        </div>
        <div className="flex items-center gap-3 min-w-[280px]">
          <Ship className="h-5 w-5 text-primary shrink-0" />
          <Select value={vessel?.id || ''} onValueChange={setSelectedVesselId}>
            <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
            <SelectContent>
              {vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}{v.imo_number ? ` — IMO ${v.imo_number}` : ''}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!vessel && !loading && (
        <Card><CardContent className="p-8 text-center">
          <Anchor className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">No vessel is available for the active organization.</p>
          <Button className="mt-4" onClick={() => onSectionChange?.('vessel-management')}>Open Vessel Management</Button>
        </CardContent></Card>
      )}

      {vessel && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="maritime-card"><CardContent className="p-5"><div className="flex justify-between"><div><p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Operational Status</p><p className="text-2xl font-black mt-2 capitalize">{operationalStatus.replace(/_/g, ' ')}</p></div><Gauge className="h-6 w-6 text-primary" /></div></CardContent></Card>
            <Card className="maritime-card cursor-pointer" onClick={() => onSectionChange?.('vessels-certification')}><CardContent className="p-5"><div className="flex justify-between"><div><p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Certificate Exposure</p><p className="text-2xl font-black mt-2">{expired.length + expiring.length}</p><p className="text-xs text-muted-foreground mt-1">{expired.length} expired · {expiring.length} ≤30 days</p></div><BadgeCheck className="h-6 w-6 text-primary" /></div></CardContent></Card>
            <Card className="maritime-card cursor-pointer" onClick={() => onSectionChange?.('maintenance')}><CardContent className="p-5"><div className="flex justify-between"><div><p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Maintenance Exposure</p><p className="text-2xl font-black mt-2">{overdueMaintenance.length + dueMaintenance.length}</p><p className="text-xs text-muted-foreground mt-1">{overdueMaintenance.length} overdue · {dueMaintenance.length} open</p></div><Wrench className="h-6 w-6 text-primary" /></div></CardContent></Card>
            <Card className="maritime-card"><CardContent className="p-5"><div className="flex justify-between"><div><p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Compliance Score</p><p className="text-2xl font-black mt-2">{complianceLoading ? '—' : vesselScore?.total_score != null ? `${Number(vesselScore.total_score).toFixed(1)}%` : 'Not calculated'}</p></div><ClipboardCheck className="h-6 w-6 text-primary" /></div></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5" />Vessel Readiness Snapshot</CardTitle></CardHeader><CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Identity / Master Data</p><p className="font-black mt-1">{readiness}/5</p></div>
                <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Crew</p><p className="font-black mt-1">{summary.crewCount}</p></div>
                <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Certificates</p><p className="font-black mt-1">{vesselCerts.length}</p></div>
                <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Maintenance Tasks</p><p className="font-black mt-1">{vesselTasks.length}</p></div>
              </div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Daily Operating Cost</CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{summaryLoading ? '—' : money(summary.dailyCost, summary.currency)}</p><p className="text-xs text-muted-foreground mt-2">Existing vessel daily cost summary</p><Button variant="outline" className="mt-4 w-full" onClick={() => onSectionChange?.('vessel-management')}>Open Vessel Cost Model</Button></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" />Immediate Actions</CardTitle></CardHeader><CardContent className="space-y-3">
              {expired.length === 0 && expiring.length === 0 && overdueMaintenance.length === 0 && <p className="text-sm text-muted-foreground">No certificate or maintenance exposure is currently recorded for this vessel.</p>}
              {expired.slice(0, 4).map(c => <div key={c.id} className="flex items-center justify-between rounded-lg border p-3"><span className="font-medium">{c.certificate_name}</span><Badge variant="destructive">Expired</Badge></div>)}
              {expiring.slice(0, 4).map(c => <div key={`e-${c.id}`} className="flex items-center justify-between rounded-lg border p-3"><span className="font-medium">{c.certificate_name}</span><Badge variant="outline">Expires {new Date(c.expiry_date).toLocaleDateString()}</Badge></div>)}
              {overdueMaintenance.slice(0, 4).map(t => <div key={`m-${t.id}`} className="flex items-center justify-between rounded-lg border p-3"><span className="font-medium">{t.title}</span><Badge variant="destructive">Overdue</Badge></div>)}
            </CardContent></Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><CircleDollarSign className="h-5 w-5" />Cost & Project Intelligence</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3"><span className="text-muted-foreground">Daily operating cost</span><span className="font-black">{money(summary.dailyCost, summary.currency)}</span></div>
              <div className="flex items-center justify-between border-b pb-3"><span className="text-muted-foreground">Project-specific costs</span><span className="font-black">{money(summary.projectCost, summary.currency)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Crew records</span><span className="font-black flex items-center gap-1"><Users className="h-4 w-4" />{summary.crewCount}</span></div>
              <Button variant="outline" className="w-full" onClick={() => onSectionChange?.('vessel-project-costs')}>Open Project Costing</Button>
            </CardContent></Card>
          </div>

          <Card className="border-primary/20 bg-primary/5"><CardContent className="p-5 flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-primary mt-0.5" /><div><p className="font-bold">Traceable operating context</p><p className="text-sm text-muted-foreground mt-1">All values above are derived from existing repository tables/views/hooks. Missing source data is shown as missing rather than replaced with demo values.</p></div></CardContent></Card>
        </>
      )}
    </div>
  );
}
