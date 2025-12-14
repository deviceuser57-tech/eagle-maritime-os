import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Award, Stethoscope, Plus, Loader2, Trash2 } from 'lucide-react';
import { useCrewMembers } from '@/hooks/useCrewMembers';
import { useVessels } from '@/hooks/useVessels';
import { format } from 'date-fns';

const CrewManagement = () => {
  const { crewMembers, isLoading, createCrewMember, deleteCrewMember } = useCrewMembers();
  const { vessels } = useVessels();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    rank: '',
    vessel_id: '',
    email: '',
    phone: '',
    nationality: '',
    certificate_number: '',
    certificate_expiry: '',
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCrewMember.mutateAsync({
      ...formData,
      vessel_id: formData.vessel_id || null,
      certificate_expiry: formData.certificate_expiry || null,
    });
    setFormData({
      first_name: '',
      last_name: '',
      rank: '',
      vessel_id: '',
      email: '',
      phone: '',
      nationality: '',
      certificate_number: '',
      certificate_expiry: '',
      status: 'active',
    });
    setIsDialogOpen(false);
  };

  const activeCount = crewMembers.filter(c => c.status === 'active').length;
  const expiringCerts = crewMembers.filter(c => {
    if (!c.certificate_expiry) return false;
    const expiry = new Date(c.certificate_expiry);
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return expiry <= thirtyDays && expiry >= new Date();
  }).length;

  if (isLoading) {
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
          <h2 className="text-3xl font-bold text-foreground mb-2">👨‍✈️ Crew Management</h2>
          <p className="text-muted-foreground">
            Manage crew members, certifications, medical fitness, and training schedules across your fleet.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Crew Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Crew Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rank">Rank *</Label>
                  <Select value={formData.rank} onValueChange={(v) => setFormData({ ...formData, rank: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Chief Officer">Chief Officer</SelectItem>
                      <SelectItem value="Second Officer">Second Officer</SelectItem>
                      <SelectItem value="Third Officer">Third Officer</SelectItem>
                      <SelectItem value="Chief Engineer">Chief Engineer</SelectItem>
                      <SelectItem value="Second Engineer">Second Engineer</SelectItem>
                      <SelectItem value="Able Seaman">Able Seaman</SelectItem>
                      <SelectItem value="Ordinary Seaman">Ordinary Seaman</SelectItem>
                      <SelectItem value="Bosun">Bosun</SelectItem>
                      <SelectItem value="Cook">Cook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vessel_id">Vessel</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificate_number">Certificate Number</Label>
                  <Input
                    id="certificate_number"
                    value={formData.certificate_number}
                    onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificate_expiry">Certificate Expiry</Label>
                  <Input
                    id="certificate_expiry"
                    type="date"
                    value={formData.certificate_expiry}
                    onChange={(e) => setFormData({ ...formData, certificate_expiry: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCrewMember.isPending}>
                  {createCrewMember.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Crew Member
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
                <p className="text-sm text-muted-foreground">Total Crew</p>
                <p className="text-2xl font-bold">{crewMembers.length}</p>
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
                <p className="text-2xl font-bold text-green-500">{activeCount}</p>
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
                <p className="text-2xl font-bold text-orange-500">{expiringCerts}</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {crewMembers.filter(c => c.status === 'on_leave').length}
                </p>
              </div>
              <Stethoscope className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roster" className="w-full">
        <TabsList>
          <TabsTrigger value="roster">Crew Roster</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <Card className="maritime-card">
            <CardHeader>
              <CardTitle>Active Crew Members</CardTitle>
            </CardHeader>
            <CardContent>
              {crewMembers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No crew members yet. Add your first crew member above.</p>
              ) : (
                <div className="space-y-4">
                  {crewMembers.map((crew) => (
                    <div key={crew.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{crew.first_name} {crew.last_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {crew.rank} {crew.vessels?.name && `- ${crew.vessels.name}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={crew.status === 'active' ? 'default' : 'secondary'}>
                          {crew.status}
                        </Badge>
                        {crew.certificate_expiry && (
                          <p className="text-sm text-muted-foreground">
                            Cert: {format(new Date(crew.certificate_expiry), 'MMM dd, yyyy')}
                          </p>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteCrewMember.mutate(crew.id)}
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

        <TabsContent value="certifications">
          <Card className="maritime-card">
            <CardHeader>
              <CardTitle>Certification Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {crewMembers.filter(c => c.certificate_number).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No certificates recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {crewMembers.filter(c => c.certificate_number).map((crew) => (
                    <div key={crew.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{crew.first_name} {crew.last_name}</p>
                        <p className="text-sm text-muted-foreground">Cert #: {crew.certificate_number}</p>
                      </div>
                      <div className="text-right">
                        {crew.certificate_expiry && (
                          <>
                            <p className="text-sm font-medium">
                              Expires: {format(new Date(crew.certificate_expiry), 'MMM dd, yyyy')}
                            </p>
                            <Badge variant={new Date(crew.certificate_expiry) < new Date() ? 'destructive' : 'default'}>
                              {new Date(crew.certificate_expiry) < new Date() ? 'Expired' : 'Valid'}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrewManagement;
