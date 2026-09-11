import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, Anchor, Navigation, Activity, Plus, Loader2, Trash2 } from 'lucide-react';
import { useVoyages } from '@/hooks/useVoyages';
import { useVessels } from '@/hooks/useVessels';
import { useSetupPorts } from '@/hooks/useSetupVesselMasterData';
import { format } from 'date-fns';

const Operations = () => {
  const { voyages, loading, addVoyage, deleteVoyage } = useVoyages();
  const { vessels } = useVessels();
  const { ports } = useSetupPorts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vessel_id: '',
    departure_port: '',
    arrival_port: '',
    departure_date: '',
    eta: '',
    status: 'planned',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addVoyage({
      vessel_id: formData.vessel_id || null,
      voyage_number: null,
      origin_port: formData.departure_port,
      destination_port: formData.arrival_port,
      departure_date: formData.departure_date || null,
      arrival_date: null,
      eta: formData.eta || null,
      cargo_type: null,
      cargo_quantity: null,
      status: formData.status,
      notes: null,
    });
    setFormData({
      vessel_id: '',
      departure_port: '',
      arrival_port: '',
      departure_date: '',
      eta: '',
      status: 'planned',
    });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this voyage?')) {
      await deleteVoyage(id);
    }
  };

  const getCalculatedStatus = (voyage: any) => {
    if (voyage.status === 'cancelled') {
      return { label: 'تم إلغاء الرحلة', value: 'cancelled', variant: 'destructive' as const };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const depDate = voyage.departure_date ? new Date(voyage.departure_date) : null;
    const etaDate = voyage.eta ? new Date(voyage.eta) : null;

    if (depDate) depDate.setHours(0, 0, 0, 0);
    if (etaDate) etaDate.setHours(0, 0, 0, 0);

    if (voyage.status === 'arrived' || (etaDate && today >= etaDate)) {
      return { label: 'تم الوصول', value: 'arrived', variant: 'secondary' as const };
    }

    if (voyage.status === 'underway' || (depDate && etaDate && today >= depDate && today < etaDate)) {
      return { label: 'جاري الابحار ومخطط الوصول', value: 'underway', variant: 'default' as const };
    }

    return { label: 'لم تبحر بعد', value: 'planned', variant: 'outline' as const };
  };

  const atSeaCount = voyages.filter(v => getCalculatedStatus(v).value === 'underway').length;
  const inPortCount = voyages.filter(v => getCalculatedStatus(v).value === 'arrived' || getCalculatedStatus(v).value === 'planned').length;
  const activeVoyages = voyages.filter(v => getCalculatedStatus(v).value === 'underway' || getCalculatedStatus(v).value === 'planned');
  const utilization = vessels.length > 0 ? Math.round((activeVoyages.length / vessels.length) * 100) : 0;

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
          <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground mb-2">Operations</h2>
          <p className="text-muted-foreground">
            Monitor real-time vessel operations, voyage planning, and fleet activity.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Voyage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Plan New Voyage</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vessel_id">Vessel *</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure_port">Departure Port *</Label>
                  {ports.length > 0 ? (
                    <Select value={formData.departure_port} onValueChange={(v) => setFormData({ ...formData, departure_port: v })}>
                      <SelectTrigger><SelectValue placeholder="Select departure port" /></SelectTrigger>
                      <SelectContent>
                        {ports.map(p => <SelectItem key={p.id} value={p.port_name}>{p.port_name} {p.country ? `(${p.country})` : ''}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="departure_port"
                      value={formData.departure_port}
                      onChange={(e) => setFormData({ ...formData, departure_port: e.target.value })}
                      required
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrival_port">Arrival Port *</Label>
                  {ports.length > 0 ? (
                    <Select value={formData.arrival_port} onValueChange={(v) => setFormData({ ...formData, arrival_port: v })}>
                      <SelectTrigger><SelectValue placeholder="Select arrival port" /></SelectTrigger>
                      <SelectContent>
                        {ports.map(p => <SelectItem key={p.id} value={p.port_name}>{p.port_name} {p.country ? `(${p.country})` : ''}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="arrival_port"
                      value={formData.arrival_port}
                      onChange={(e) => setFormData({ ...formData, arrival_port: e.target.value })}
                      required
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure_date">Departure Date</Label>
                  <Input
                    id="departure_date"
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eta">ETA</Label>
                  <Input
                    id="eta"
                    type="date"
                    value={formData.eta}
                    onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="underway">Underway</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Voyage
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
                <p className="text-sm text-muted-foreground">At Sea</p>
                <p className="text-2xl font-bold">{atSeaCount}</p>
              </div>
              <Ship className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Port</p>
                <p className="text-2xl font-bold">{inPortCount}</p>
              </div>
              <Anchor className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Voyages</p>
                <p className="text-2xl font-bold">{activeVoyages.length}</p>
              </div>
              <Navigation className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fleet Utilization</p>
                <p className="text-2xl font-bold">{utilization}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="voyages" className="w-full">
        <TabsList>
          <TabsTrigger value="voyages">Active Voyages</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="voyages">
          <Card className="maritime-card">
            <CardHeader>
              <CardTitle>Current Voyages</CardTitle>
            </CardHeader>
            <CardContent>
              {voyages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No voyages planned yet. Add your first voyage above.</p>
              ) : (
                <div className="space-y-4">
                  {voyages.map((voyage) => (
                    <div key={voyage.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{voyage.voyage_number || 'Voyage'}</p>
                        <p className="text-sm text-muted-foreground">
                          {voyage.origin_port} → {voyage.destination_port}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm">
                            ETA: {voyage.eta ? format(new Date(voyage.eta), 'MMM dd, yyyy') : 'TBD'}
                          </p>
                        </div>
                        <Badge variant={getCalculatedStatus(voyage).variant}>
                          {getCalculatedStatus(voyage).label}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(voyage.id)}
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
        </TabsContent>

        <TabsContent value="scheduling">
          <Card className="maritime-card">
            <CardHeader>
              <CardTitle>Voyage Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Plan and optimize voyage schedules across your fleet.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="maritime-card">
            <CardHeader>
              <CardTitle>Operational Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Track KPIs including fuel efficiency, on-time performance, and utilization rates.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Operations;
