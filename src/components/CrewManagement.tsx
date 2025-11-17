import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Award, Stethoscope, Calendar } from 'lucide-react';

const CrewManagement = () => {
  const crewMembers = [
    { name: 'Capt. James Rodriguez', rank: 'Master', vessel: 'MV Atlantic Pride', status: 'Active', certExpiry: '2024-06-15' },
    { name: 'Chief Eng. Maria Santos', rank: 'Chief Engineer', vessel: 'MV Pacific Star', status: 'Active', certExpiry: '2024-03-20' },
    { name: 'AB John Walker', rank: 'Able Seaman', vessel: 'MV Nordic Wave', status: 'On Leave', certExpiry: '2024-05-10' },
    { name: '2nd Off. Sarah Chen', rank: 'Second Officer', vessel: 'MV Southern Cross', status: 'Active', certExpiry: '2024-02-28' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">👨‍✈️ Crew Management</h2>
        <p className="text-muted-foreground">
          Manage crew members, certifications, medical fitness, and training schedules across your fleet.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Crew</p>
                <p className="text-2xl font-bold">342</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-500">298</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Certs</p>
                <p className="text-2xl font-bold text-orange-500">23</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medical Due</p>
                <p className="text-2xl font-bold text-orange-500">12</p>
              </div>
              <Stethoscope className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roster" className="w-full">
        <TabsList>
          <TabsTrigger value="roster">Crew Roster</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <Card className="maritime-card">
            <CardHeader>
              <CardTitle>Active Crew Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crewMembers.map((crew, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{crew.name}</p>
                      <p className="text-sm text-muted-foreground">{crew.rank} - {crew.vessel}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={crew.status === 'Active' ? 'default' : 'secondary'}>
                        {crew.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground">Cert: {crew.certExpiry}</p>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card className="maritime-card">
            <CardHeader>
              <CardTitle>Certification Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Track STCW, COC, and other maritime certifications for all crew members.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card className="maritime-card">
            <CardHeader>
              <CardTitle>Training Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage training programs, schedules, and completion records.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrewManagement;
