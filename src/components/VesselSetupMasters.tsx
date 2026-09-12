import { useEffect, useState } from 'react';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

type MasterConfig = { table: string; title: string; fields: string[] };

const MASTERS: MasterConfig[] = [
  { table: 'setup_vessel_types', title: 'Vessel Type', fields: ['name', 'abbreviation'] },
  { table: 'setup_propulsion_types', title: 'Propulsion Type', fields: ['name'] },
  { table: 'setup_fuel_types', title: 'Fuel Type', fields: ['name'] },
  { table: 'setup_trading_areas', title: 'Trading Area', fields: ['name'] },
  { table: 'setup_hull_materials', title: 'Hull Material', fields: ['name'] },
  { table: 'setup_hull_coatings', title: 'Hull Coating', fields: ['name'] },
  { table: 'setup_vessel_status', title: 'Vessel Status', fields: ['name'] },
  { table: 'setup_ownership_modes', title: 'Ownership / Employment Mode', fields: ['name'] },
  { table: 'setup_regularities', title: 'Regularity', fields: ['name'] },
  { table: 'setup_regularity_applicability', title: 'Regularity Applicability Status', fields: ['name'] },
];

const titleCase = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function VesselSetupMasters() {
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const [data, setData] = useState<Record<string, any[]>>({});
  const [editing, setEditing] = useState<{ table: string; id?: string; values: Record<string, string> } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const entries = await Promise.all(MASTERS.map(async config => {
        const { data: rows, error } = await (supabase as any)
          .from(config.table).select('*').eq('org_id', orgId).order('name', { ascending: true });
        if (error) throw error;
        return [config.table, rows || []] as const;
      }));
      setData(Object.fromEntries(entries));
    } catch (error: any) {
      toast({ title: 'Vessel setup load failed', description: error.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [orgId]);

  const startAdd = (config: MasterConfig) => setEditing({ table: config.table, values: Object.fromEntries(config.fields.map(f => [f, ''])) });
  const startEdit = (config: MasterConfig, row: any) => setEditing({ table: config.table, id: row.id, values: Object.fromEntries(config.fields.map(f => [f, row[f] ?? ''])) });

  const save = async () => {
    if (!editing || !orgId) return;
    const config = MASTERS.find(x => x.table === editing.table)!;
    const name = editing.values.name?.trim();
    if (!name) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    try {
      const payload = { ...editing.values, org_id: orgId, is_active: true };
      const query = editing.id
        ? (supabase as any).from(config.table).update(payload).eq('id', editing.id).eq('org_id', orgId)
        : (supabase as any).from(config.table).insert(payload);
      const { error } = await query;
      if (error) throw error;
      setEditing(null);
      await load();
      toast({ title: `${config.title} saved` });
    } catch (error: any) {
      toast({ title: `${config.title} save failed`, description: error.message, variant: 'destructive' });
    }
  };

  const remove = async (config: MasterConfig, id: string) => {
    if (!confirm(`Delete ${config.title}?`)) return;
    try {
      const { error } = await (supabase as any).from(config.table).delete().eq('id', id).eq('org_id', orgId);
      if (error) throw error;
      await load();
    } catch (error: any) {
      toast({ title: `${config.title} delete failed`, description: error.message, variant: 'destructive' });
    }
  };

  return (
    <section className="space-y-6 mt-12 pt-10 border-t border-border">
      <div>
        <h3 className="text-2xl font-black uppercase tracking-tight">Vessel Management Masters</h3>
        <p className="text-sm text-muted-foreground mt-1">Setup-controlled reference data used by Vessel Management. Currency, Ports, Flag State and Classification Society remain on their existing registries.</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {MASTERS.map(config => {
          const rows = data[config.table] || [];
          return (
            <Card key={config.table}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{config.title}</CardTitle>
                <Button size="sm" onClick={() => startAdd(config)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
              </CardHeader>
              <CardContent>
                {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : rows.length === 0 ? <p className="text-sm text-muted-foreground">No records.</p> : (
                  <div className="space-y-2">
                    {rows.map(row => (
                      <div key={row.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{row.name}</div>
                          {row.abbreviation && <div className="text-xs text-muted-foreground">{row.abbreviation}</div>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => startEdit(config, row)}><Save className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => remove(config, row.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editing && (() => {
        const config = MASTERS.find(x => x.table === editing.table)!;
        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{editing.id ? 'Edit' : 'Add'} {config.title}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.fields.map(field => (
                  <div key={field} className="space-y-2">
                    <Label>{titleCase(field)}</Label>
                    <Input value={editing.values[field] || ''} onChange={e => setEditing({ ...editing, values: { ...editing.values, [field]: e.target.value } })} required={field === 'name'} />
                  </div>
                ))}
                <Button className="w-full" onClick={save}>Save {config.title}</Button>
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </section>
  );
}
