import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useVessels, Vessel } from '@/hooks/useVessels';
import { 
  Ship, 
  Plus, 
  Pencil, 
  Trash2,
  Anchor,
  Flag,
  Hash
} from 'lucide-react';

interface VesselFormData {
  name: string;
  imo_number: string;
  call_sign: string;
  mmsi_number: string;
  vessel_type: string;
  flag_state: string;
  gross_tonnage: string;
  deadweight: string;
  year_built: string;
  classification_society: string;
  status: string;
}

const initialFormData: VesselFormData = {
  name: '',
  imo_number: '',
  call_sign: '',
  mmsi_number: '',
  vessel_type: '',
  flag_state: '',
  gross_tonnage: '',
  deadweight: '',
  year_built: '',
  classification_society: '',
  status: 'active'
};

const VesselManagement = () => {
  const { vessels, loading, addVessel, updateVessel, deleteVessel } = useVessels();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState<VesselFormData>(initialFormData);

  const vesselTypes = [
    'Bulk Carrier', 'Container Ship', 'Tanker', 'General Cargo', 
    'Passenger Ship', 'RoRo Ship', 'LNG Carrier', 'Chemical Tanker'
  ];

  const flagStates = [
    'Panama', 'Liberia', 'Marshall Islands', 'Hong Kong', 'Singapore',
    'Bahamas', 'Malta', 'Cyprus', 'Greece', 'Norway'
  ];

  const classificationSocieties = [
    'DNV GL', "Lloyd's Register", 'ABS', 'Bureau Veritas', 'ClassNK', 'RINA'
  ];

  const statusOptions = ['active', 'inactive', 'maintenance', 'drydock'];

  const handleOpenDialog = (vessel?: Vessel) => {
    if (vessel) {
      setEditingVessel(vessel);
      setFormData({
        name: vessel.name,
        imo_number: vessel.imo_number || '',
        call_sign: vessel.call_sign || '',
        mmsi_number: vessel.mmsi_number || '',
        vessel_type: vessel.vessel_type || '',
        flag_state: vessel.flag_state || '',
        gross_tonnage: vessel.gross_tonnage?.toString() || '',
        deadweight: vessel.deadweight?.toString() || '',
        year_built: vessel.year_built?.toString() || '',
        classification_society: vessel.classification_society || '',
        status: vessel.status || 'active'
      });
    } else {
      setEditingVessel(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const vesselData = {
      name: formData.name,
      imo_number: formData.imo_number || null,
      call_sign: formData.call_sign || null,
      mmsi_number: formData.mmsi_number || null,
      vessel_type: formData.vessel_type || null,
      flag_state: formData.flag_state || null,
      gross_tonnage: formData.gross_tonnage ? parseFloat(formData.gross_tonnage) : null,
      deadweight: formData.deadweight ? parseFloat(formData.deadweight) : null,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      classification_society: formData.classification_society || null,
      status: formData.status || 'active'
    };

    if (editingVessel) {
      await updateVessel(editingVessel.id, vesselData);
    } else {
      await addVessel(vesselData);
    }
    
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setEditingVessel(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vessel?')) {
      await deleteVessel(id);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusStyles: Record<string, string> = {
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      maintenance: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      drydock: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    return statusStyles[status || 'active'] || statusStyles.active;
  };

  const stats = {
    total: vessels.length,
    active: vessels.filter(v => v.status === 'active').length,
    maintenance: vessels.filter(v => v.status === 'maintenance' || v.status === 'drydock').length
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          ⚓ Vessel Management
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Manage your fleet with comprehensive vessel tracking, status monitoring, and regulatory compliance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="maritime-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Ship className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Vessels</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="maritime-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Anchor className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="maritime-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Flag className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Maintenance</p>
                <p className="text-2xl font-bold">{stats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="btn-maritime">
              <Plus className="h-4 w-4 mr-2" />
              Add Vessel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVessel ? 'Edit Vessel' : 'Add New Vessel'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vessel Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imo_number">IMO Number</Label>
                  <Input
                    id="imo_number"
                    value={formData.imo_number}
                    onChange={(e) => setFormData({ ...formData, imo_number: e.target.value })}
                    placeholder="e.g., 9876543"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call_sign">Call Sign</Label>
                  <Input
                    id="call_sign"
                    value={formData.call_sign}
                    onChange={(e) => setFormData({ ...formData, call_sign: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mmsi_number">MMSI Number</Label>
                  <Input
                    id="mmsi_number"
                    value={formData.mmsi_number}
                    onChange={(e) => setFormData({ ...formData, mmsi_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vessel_type">Vessel Type</Label>
                  <Select value={formData.vessel_type} onValueChange={(value) => setFormData({ ...formData, vessel_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vesselTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flag_state">Flag State</Label>
                  <Select value={formData.flag_state} onValueChange={(value) => setFormData({ ...formData, flag_state: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select flag state" />
                    </SelectTrigger>
                    <SelectContent>
                      {flagStates.map(flag => (
                        <SelectItem key={flag} value={flag}>{flag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gross_tonnage">Gross Tonnage</Label>
                  <Input
                    id="gross_tonnage"
                    type="number"
                    value={formData.gross_tonnage}
                    onChange={(e) => setFormData({ ...formData, gross_tonnage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadweight">Deadweight (MT)</Label>
                  <Input
                    id="deadweight"
                    type="number"
                    value={formData.deadweight}
                    onChange={(e) => setFormData({ ...formData, deadweight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year_built">Year Built</Label>
                  <Input
                    id="year_built"
                    type="number"
                    value={formData.year_built}
                    onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classification_society">Classification Society</Label>
                  <Select value={formData.classification_society} onValueChange={(value) => setFormData({ ...formData, classification_society: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select society" />
                    </SelectTrigger>
                    <SelectContent>
                      {classificationSocieties.map(society => (
                        <SelectItem key={society} value={society}>{society}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-maritime">
                  {editingVessel ? 'Update Vessel' : 'Add Vessel'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vessels Table */}
      <Card className="maritime-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading vessels...</div>
          ) : vessels.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vessels found. Add your first vessel to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vessel Name</TableHead>
                  <TableHead>IMO Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Flag State</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vessels.map((vessel) => (
                  <TableRow key={vessel.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-primary" />
                        {vessel.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        {vessel.imo_number || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{vessel.vessel_type || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Flag className="h-3 w-3 text-muted-foreground" />
                        {vessel.flag_state || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{vessel.classification_society || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(vessel.status)}>
                        {vessel.status?.charAt(0).toUpperCase() + vessel.status?.slice(1) || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(vessel)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(vessel.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VesselManagement;
