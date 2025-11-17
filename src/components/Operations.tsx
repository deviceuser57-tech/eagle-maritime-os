import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ship, Anchor, Navigation, Activity } from 'lucide-react';

const Operations = () => {
  const activeVoyages = [
    { vessel: 'MV Atlantic Pride', from: 'Singapore', to: 'Rotterdam', eta: '2024-01-25', status: 'Underway' },
    { vessel: 'MV Pacific Star', from: 'Los Angeles', to: 'Tokyo', eta: '2024-01-22', status: 'Underway' },
    { vessel: 'MV Nordic Wave', from: 'Hamburg', to: 'New York', eta: '2024-01-28', status: 'In Port' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">🛥️ Operations</h2>
        <p className="text-muted-foreground">
          Monitor real-time vessel operations, voyage planning, and fleet activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Sea</p>
                <p className="text-2xl font-bold">15</p>
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
                <p className="text-2xl font-bold">7</p>
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
                <p className="text-2xl font-bold">18</p>
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
                <p className="text-2xl font-bold">87%</p>
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
              <div className="space-y-4">
                {activeVoyages.map((voyage, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{voyage.vessel}</p>
                      <p className="text-sm text-muted-foreground">
                        {voyage.from} → {voyage.to}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm">ETA: {voyage.eta}</p>
                      </div>
                      <Badge variant={voyage.status === 'Underway' ? 'default' : 'secondary'}>
                        {voyage.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
