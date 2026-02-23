import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, TrendingDown, Target, Award, Plus, Loader2, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCIIRecords } from '@/hooks/useCIIRecords';
import { useVessels } from '@/hooks/useVessels';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

const CIIDashboard = () => {
  const { toast } = useToast();
  const [selectedVesselId, setSelectedVesselId] = useState<string>('all');
  const { ciiRecords: records, loading, addCIIRecord: addRecord, deleteCIIRecord: deleteRecord, refetch } = useCIIRecords(selectedVesselId === 'all' ? undefined : selectedVesselId);
  const { vessels } = useVessels();
  const { orgId } = useOrganization();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vessel_id: '',
    year: new Date().getFullYear().toString(),
    cii_value: '',
    cii_rating: 'C',
    target_cii: '',
    fuel_consumption: '',
    distance_travelled: '',
    cargo_carried: '',
    fuel_type: 'HFO',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRecord({
      vessel_id: formData.vessel_id || null,
      year: parseInt(formData.year),
      fuel_consumption: parseFloat(formData.fuel_consumption) || null,
      distance_travelled: parseFloat(formData.distance_travelled) || null,
      cargo_carried: parseFloat(formData.cargo_carried) || null,
      fuel_type: formData.fuel_type,
      target_value: formData.target_cii ? parseFloat(formData.target_cii) : null,
      notes: formData.notes || null,
    });

    setFormData({
      vessel_id: '',
      year: new Date().getFullYear().toString(),
      cii_value: '',
      cii_rating: 'C',
      target_cii: '',
      fuel_consumption: '',
      distance_travelled: '',
      cargo_carried: '',
      fuel_type: 'HFO',
      notes: '',
    });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteRecord(id);
    }
  };

  useEffect(() => {
    if (orgId) refetch();
  }, [orgId]);

  const avgCII = records.length > 0
    ? (records.reduce((sum, r) => sum + r.cii_value, 0) / records.length).toFixed(1)
    : '0.0';

  const aRatedCount = records.filter(r => r.cii_rating === 'A').length;
  const criticalCount = records.filter(r => r.cii_rating === 'D' || r.cii_rating === 'E').length;

  const trendData = [...new Set(records.map(r => r.year))]
    .sort()
    .map(year => {
      const yearRecords = records.filter(r => r.year === year);
      const avg = yearRecords.reduce((sum, r) => sum + r.cii_value, 0) / yearRecords.length;
      return { year: year.toString(), avg: parseFloat(avg.toFixed(1)) };
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase">Carbon Intelligence Node</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary uppercase tracking-widest px-2 backdrop-blur-sm">
              MARPOL Annex VI Compliance
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest px-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              IMO Regulation 28 Tracking
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="w-full sm:w-[200px]">
            <Select value={selectedVesselId} onValueChange={setSelectedVesselId}>
              <SelectTrigger className="rounded-xl border-primary/20 bg-background/50 font-bold uppercase text-[10px] tracking-widest h-11">
                <Ship className="h-4 w-4 mr-2 text-primary" />
                <SelectValue placeholder="Select Vessel" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-primary/20">
                <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">
                  All Assets
                </SelectItem>
                {vessels.map((v) => (
                  <SelectItem key={v.id} value={v.id} className="text-[10px] font-bold uppercase tracking-widest">
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-primary/20 hover:bg-primary/5 font-bold uppercase text-[10px] tracking-widest h-11"
              onClick={() => toast({ title: "Export Started", description: "Preparing MARPOL SEEMP Part III dataset for export..." })}
            >
              Export
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-maritime rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest h-11">
                  <Plus className="h-3 w-3 mr-2" /> Log Annual
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card border-border text-card-foreground">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-widest text-primary">Log annual cii metrics</DialogTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data will be used for official SEEMP Part III reporting</p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vessel</Label>
                      <Select value={formData.vessel_id} onValueChange={(v) => setFormData({ ...formData, vessel_id: v })}>
                        <SelectTrigger className="bg-muted/10 border-border rounded-xl">
                          <SelectValue placeholder="Select target asset" />
                        </SelectTrigger>
                        <SelectContent>
                          {vessels.map((vessel) => (
                            <SelectItem key={vessel.id} value={vessel.id}>{vessel.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reporting Year</Label>
                      <Input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="bg-muted/10 border-border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Technical Work Parameters</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground">FUEL CONSUMPTION (TON/YR)</Label>
                        <Input
                          type="number"
                          value={formData.fuel_consumption}
                          onChange={(e) => setFormData({ ...formData, fuel_consumption: e.target.value })}
                          className="bg-muted/10 border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground">FUEL TYPE (IMO CF FACTOR)</Label>
                        <Select value={formData.fuel_type} onValueChange={(v) => { setFormData({ ...formData, fuel_type: v }); }}>
                          <SelectTrigger className="bg-muted/10 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HFO">HFO (Cf: 3.114)</SelectItem>
                            <SelectItem value="LFO">LFO (Cf: 3.151)</SelectItem>
                            <SelectItem value="MDO">MDO (Cf: 3.206)</SelectItem>
                            <SelectItem value="LNG">LNG (Cf: 2.750)</SelectItem>
                            <SelectItem value="LPG">LPG (Cf: 3.000)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground">DISTANCE TRAVELLED (NM)</Label>
                        <Input
                          type="number"
                          value={formData.distance_travelled}
                          onChange={(e) => setFormData({ ...formData, distance_travelled: e.target.value })}
                          className="bg-muted/10 border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground">VESSEL CAPACITY (DWT/GT)</Label>
                        <Input
                          type="number"
                          value={formData.cargo_carried}
                          onChange={(e) => setFormData({ ...formData, cargo_carried: e.target.value })}
                          className="bg-muted/10 border-border"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Attained CII Value</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.cii_value}
                        readOnly
                        className="bg-primary/20 border-primary font-black text-primary text-xl py-6 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CII Rating (MARPOL Class)</Label>
                      <Select value={formData.cii_rating} onValueChange={(v) => setFormData({ ...formData, cii_rating: v })}>
                        <SelectTrigger className="h-12 bg-muted/10 border-border rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A - Superior Performance</SelectItem>
                          <SelectItem value="B">B - Good Performance</SelectItem>
                          <SelectItem value="C">C - Moderate (Threshold)</SelectItem>
                          <SelectItem value="D">D - Sub-optimal (Corrective Action Needed)</SelectItem>
                          <SelectItem value="E">E - Critical (Immediate SEEMP Action)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="ghost" className="text-foreground hover:bg-muted/10" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-maritime px-8">
                      Commit Record to Registry
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Fleet Intensity Avg</p>
                <p className="text-3xl font-black text-foreground">{avgCII}</p>
                <p className="text-[8px] font-bold text-primary uppercase mt-1">gCO2 / t.nm</p>
              </div>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Ship className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">A-Superior Compliance</p>
                <p className="text-3xl font-black text-emerald-500">{aRatedCount}</p>
                <p className="text-[8px] font-bold text-emerald-500/60 uppercase mt-1">Vessels at peak efficiency</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Award className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card border-rose-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Critical Intervention</p>
                <p className="text-3xl font-black text-rose-500">{criticalCount}</p>
                <p className="text-[8px] font-bold text-rose-500/60 uppercase mt-1">Requires SEEMP corrective action</p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                <Target className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Total Fleet Records</p>
                <p className="text-3xl font-black text-primary">{records.length}</p>
                <p className="text-[8px] font-bold text-primary/40 uppercase mt-1">Validated emission cycles</p>
              </div>
              <TrendingDown className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="maritime-card border-border">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Fleet Carbon Intensity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--card-foreground))' }}
                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                  <Bar dataKey="avg" fill="url(#primaryGradient)" radius={[4, 4, 0, 0]} name="AVERAGE CII" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No emission cycles recorded for {selectedVesselId === 'all' ? 'this fleet node' : 'the selected vessel'}.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="maritime-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Vessel Compliance Registry</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-black uppercase tracking-widest text-primary"
              onClick={() => toast({ title: "Registry Archive", description: "Full emission registry archive is currently being synchronized." })}
            >
              View Full Archive
            </Button>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Emission registry is currently empty.</p>
            ) : (
              <div className="space-y-4">
                {records.slice(0, 5).map((record) => (
                  <div key={record.id} className="group relative overflow-hidden p-5 border border-border rounded-2xl bg-muted/5 hover:bg-muted/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black text-sm uppercase text-foreground tracking-tight">{record.vessels?.name || 'Unknown Asset'}</p>
                          {(record.cii_rating === 'D' || record.cii_rating === 'E') && (
                            <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/30 text-[8px] font-black uppercase px-2">SEEMP III ALERT</Badge>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          CY {record.year} | {record.cii_value} gCO2 / t.nm
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase mb-1">MARPOL Rating</p>
                          <Badge className={`
                            text-[10px] font-black uppercase px-3 py-1 rounded-lg
                            ${record.cii_rating === 'A' ? 'bg-emerald-500 text-emerald-950' :
                              record.cii_rating === 'B' ? 'bg-blue-500 text-blue-950' :
                                record.cii_rating === 'C' ? 'bg-yellow-500 text-yellow-950' :
                                  record.cii_rating === 'D' ? 'bg-orange-500 text-orange-950' :
                                    'bg-rose-500 text-rose-950'}
                          `}>
                            CLASS {record.cii_rating}
                          </Badge>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground/20 hover:text-rose-500 hover:bg-rose-500/10"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Compliance Spectrum Visualization */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                        <span>A - Superior</span>
                        <span>C - Required</span>
                        <span>E - Critical</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted/10 rounded-full overflow-hidden flex relative">
                        <div className="h-full bg-emerald-500/40 w-[20%]" />
                        <div className="h-full bg-blue-500/40 w-[20%]" />
                        <div className="h-full bg-yellow-500/40 w-[20%]" />
                        <div className="h-full bg-orange-500/40 w-[20%]" />
                        <div className="h-full bg-rose-500/40 w-[20%]" />

                        {/* Compliance Pointer */}
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-foreground shadow-[0_0_10px_hsl(var(--foreground))] z-10 transition-all duration-1000"
                          style={{
                            left: `${record.cii_rating === 'A' ? '10%' :
                              record.cii_rating === 'B' ? '30%' :
                                record.cii_rating === 'C' ? '50%' :
                                  record.cii_rating === 'D' ? '70%' :
                                    '90%'
                              }`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CIIDashboard;
