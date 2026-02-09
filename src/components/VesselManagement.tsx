import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useVessels, Vessel } from '@/hooks/useVessels';
import { useSetupCompanies } from '@/hooks/useSetupCompanies';
import { useClassificationSocieties, useFlagStates } from '@/hooks/useSetupClassification';
import { 
  Ship, 
  Plus, 
  Pencil, 
  Trash2,
  Anchor,
  Flag,
  Hash,
  Settings,
  Gauge,
  Shield,
  Building2,
  Eye
} from 'lucide-react';

interface VesselFormData {
  name: string;
  imo_number: string;
  call_sign: string;
  mmsi_number: string;
  official_number: string;
  vessel_type: string;
  flag_state: string;
  port_of_registry: string;
  gross_tonnage: string;
  net_tonnage: string;
  deadweight: string;
  year_built: string;
  classification_society: string;
  class_number: string;
  status: string;
  // Dimensions
  length_overall: string;
  beam: string;
  depth: string;
  draft: string;
  // Machinery
  engine_make: string;
  engine_model: string;
  engine_power: string;
  propulsion_type: string;
  max_speed: string;
  service_speed: string;
  fuel_consumption: string;
  fuel_type: string;
  // Safety
  lifeboats: string;
  liferafts: string;
  crew_capacity: string;
  passenger_capacity: string;
  // Capacity
  cargo_capacity: string;
  trading_area: string;
  hull_material: string;
  hull_coating: string;
  // Financial
  purchase_price: string;
  insurance_value: string;
  currency: string;
  // Dates
  keel_laid_date: string;
  delivery_date: string;
  last_drydock_date: string;
  next_drydock_date: string;
  // Companies
  owner_company_id: string;
  operator_company_id: string;
  technical_manager_id: string;
  ism_manager_id: string;
  // Notes
  notes: string;
}

const initialFormData: VesselFormData = {
  name: '', imo_number: '', call_sign: '', mmsi_number: '', official_number: '',
  vessel_type: '', flag_state: '', port_of_registry: '', gross_tonnage: '', net_tonnage: '',
  deadweight: '', year_built: '', classification_society: '', class_number: '', status: 'active',
  length_overall: '', beam: '', depth: '', draft: '',
  engine_make: '', engine_model: '', engine_power: '', propulsion_type: '',
  max_speed: '', service_speed: '', fuel_consumption: '', fuel_type: '',
  lifeboats: '', liferafts: '', crew_capacity: '', passenger_capacity: '',
  cargo_capacity: '', trading_area: '', hull_material: '', hull_coating: '',
  purchase_price: '', insurance_value: '', currency: 'USD',
  keel_laid_date: '', delivery_date: '', last_drydock_date: '', next_drydock_date: '',
  owner_company_id: '', operator_company_id: '', technical_manager_id: '', ism_manager_id: '',
  notes: ''
};

const VesselManagement = () => {
  const { vessels, loading, addVessel, updateVessel, deleteVessel } = useVessels();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState<VesselFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState('general');

  // Setup data
  const ownerCompanies = useSetupCompanies('owner');
  const operatorCompanies = useSetupCompanies('operator');
  const technicalManagers = useSetupCompanies('technical');
  const ismManagers = useSetupCompanies('ism');
  const classificationSocieties = useClassificationSocieties();
  const flagStatesHook = useFlagStates();

  const vesselTypes = [
    'Bulk Carrier', 'Container Ship', 'Crude Oil Tanker', 'Product Tanker', 
    'Chemical Tanker', 'LNG Carrier', 'LPG Carrier', 'General Cargo',
    'Passenger Ship', 'RoRo Ship', 'Vehicle Carrier', 'Offshore Supply Vessel',
    'Tugboat', 'Fishing Vessel', 'Yacht'
  ];

  const propulsionTypes = ['Single Screw', 'Twin Screw', 'Diesel Electric', 'LNG Dual Fuel', 'Hybrid'];
  const fuelTypes = ['HFO', 'VLSFO', 'MGO', 'LNG', 'Methanol', 'Dual Fuel'];
  const hullMaterials = ['Steel', 'Aluminum', 'Fiberglass', 'Composite'];
  const tradingAreas = ['Worldwide', 'Coastal', 'Short Sea', 'Inland Waterways', 'Restricted'];
  const statusOptions = ['active', 'inactive', 'maintenance', 'drydock', 'laid_up'];
  const currencies = ['USD', 'EUR', 'GBP', 'SGD', 'NOK', 'JPY'];

  const handleOpenDialog = (vessel?: Vessel, view = false) => {
    if (vessel) {
      setEditingVessel(vessel);
      setViewMode(view);
      setFormData({
        name: vessel.name || '',
        imo_number: vessel.imo_number || '',
        call_sign: vessel.call_sign || '',
        mmsi_number: vessel.mmsi_number || '',
        official_number: vessel.official_number || '',
        vessel_type: vessel.vessel_type || '',
        flag_state: vessel.flag_state || '',
        port_of_registry: vessel.port_of_registry || '',
        gross_tonnage: vessel.gross_tonnage?.toString() || '',
        net_tonnage: vessel.net_tonnage?.toString() || '',
        deadweight: vessel.deadweight?.toString() || '',
        year_built: vessel.year_built?.toString() || '',
        classification_society: vessel.classification_society || '',
        class_number: vessel.class_number || '',
        status: vessel.status || 'active',
        length_overall: vessel.length_overall?.toString() || '',
        beam: vessel.beam?.toString() || '',
        depth: vessel.depth?.toString() || '',
        draft: vessel.draft?.toString() || '',
        engine_make: vessel.engine_make || '',
        engine_model: vessel.engine_model || '',
        engine_power: vessel.engine_power?.toString() || '',
        propulsion_type: vessel.propulsion_type || '',
        max_speed: vessel.max_speed?.toString() || '',
        service_speed: vessel.service_speed?.toString() || '',
        fuel_consumption: vessel.fuel_consumption?.toString() || '',
        fuel_type: vessel.fuel_type || '',
        lifeboats: vessel.lifeboats?.toString() || '',
        liferafts: vessel.liferafts?.toString() || '',
        crew_capacity: vessel.crew_capacity?.toString() || '',
        passenger_capacity: vessel.passenger_capacity?.toString() || '',
        cargo_capacity: vessel.cargo_capacity?.toString() || '',
        trading_area: vessel.trading_area || '',
        hull_material: vessel.hull_material || '',
        hull_coating: vessel.hull_coating || '',
        purchase_price: vessel.purchase_price?.toString() || '',
        insurance_value: vessel.insurance_value?.toString() || '',
        currency: vessel.currency || 'USD',
        keel_laid_date: vessel.keel_laid_date || '',
        delivery_date: vessel.delivery_date || '',
        last_drydock_date: vessel.last_drydock_date || '',
        next_drydock_date: vessel.next_drydock_date || '',
        owner_company_id: vessel.owner_company_id || '',
        operator_company_id: vessel.operator_company_id || '',
        technical_manager_id: vessel.technical_manager_id || '',
        ism_manager_id: vessel.ism_manager_id || '',
        notes: vessel.notes || ''
      });
    } else {
      setEditingVessel(null);
      setViewMode(false);
      setFormData(initialFormData);
    }
    setActiveTab('general');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const vesselData: any = {
      name: formData.name,
      imo_number: formData.imo_number || null,
      call_sign: formData.call_sign || null,
      mmsi_number: formData.mmsi_number || null,
      official_number: formData.official_number || null,
      vessel_type: formData.vessel_type || null,
      flag_state: formData.flag_state || null,
      port_of_registry: formData.port_of_registry || null,
      gross_tonnage: formData.gross_tonnage ? parseFloat(formData.gross_tonnage) : null,
      net_tonnage: formData.net_tonnage ? parseFloat(formData.net_tonnage) : null,
      deadweight: formData.deadweight ? parseFloat(formData.deadweight) : null,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      classification_society: formData.classification_society || null,
      class_number: formData.class_number || null,
      status: formData.status || 'active',
      length_overall: formData.length_overall ? parseFloat(formData.length_overall) : null,
      beam: formData.beam ? parseFloat(formData.beam) : null,
      depth: formData.depth ? parseFloat(formData.depth) : null,
      draft: formData.draft ? parseFloat(formData.draft) : null,
      engine_make: formData.engine_make || null,
      engine_model: formData.engine_model || null,
      engine_power: formData.engine_power ? parseFloat(formData.engine_power) : null,
      propulsion_type: formData.propulsion_type || null,
      max_speed: formData.max_speed ? parseFloat(formData.max_speed) : null,
      service_speed: formData.service_speed ? parseFloat(formData.service_speed) : null,
      fuel_consumption: formData.fuel_consumption ? parseFloat(formData.fuel_consumption) : null,
      fuel_type: formData.fuel_type || null,
      lifeboats: formData.lifeboats ? parseInt(formData.lifeboats) : null,
      liferafts: formData.liferafts ? parseInt(formData.liferafts) : null,
      crew_capacity: formData.crew_capacity ? parseInt(formData.crew_capacity) : null,
      passenger_capacity: formData.passenger_capacity ? parseInt(formData.passenger_capacity) : null,
      cargo_capacity: formData.cargo_capacity ? parseFloat(formData.cargo_capacity) : null,
      trading_area: formData.trading_area || null,
      hull_material: formData.hull_material || null,
      hull_coating: formData.hull_coating || null,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      insurance_value: formData.insurance_value ? parseFloat(formData.insurance_value) : null,
      currency: formData.currency || 'USD',
      keel_laid_date: formData.keel_laid_date || null,
      delivery_date: formData.delivery_date || null,
      last_drydock_date: formData.last_drydock_date || null,
      next_drydock_date: formData.next_drydock_date || null,
      owner_company_id: formData.owner_company_id || null,
      operator_company_id: formData.operator_company_id || null,
      technical_manager_id: formData.technical_manager_id || null,
      ism_manager_id: formData.ism_manager_id || null,
      notes: formData.notes || null
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
      drydock: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      laid_up: 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return statusStyles[status || 'active'] || statusStyles.active;
  };

  const stats = {
    total: vessels.length,
    active: vessels.filter(v => v.status === 'active').length,
    maintenance: vessels.filter(v => v.status === 'maintenance' || v.status === 'drydock').length
  };

  const renderFormField = (id: string, label: string, value: string, onChange: (value: string) => void, type = 'text', placeholder = '') => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={viewMode}
      />
    </div>
  );

  const renderSelectField = (id: string, label: string, value: string, onChange: (value: string) => void, options: string[] | { value: string; label: string }[]) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={viewMode}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            typeof opt === 'string' 
              ? <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              : <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          ⚓ Vessel Management
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive fleet management with detailed vessel tracking, technical specifications, and regulatory compliance.
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewMode ? 'View Vessel Details' : (editingVessel ? 'Edit Vessel' : 'Add New Vessel')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="general" className="text-xs"><Ship className="h-3 w-3 mr-1" />General</TabsTrigger>
                  <TabsTrigger value="technical" className="text-xs"><Settings className="h-3 w-3 mr-1" />Technical</TabsTrigger>
                  <TabsTrigger value="machinery" className="text-xs"><Gauge className="h-3 w-3 mr-1" />Machinery</TabsTrigger>
                  <TabsTrigger value="safety" className="text-xs"><Shield className="h-3 w-3 mr-1" />Safety</TabsTrigger>
                  <TabsTrigger value="management" className="text-xs"><Building2 className="h-3 w-3 mr-1" />Management</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderFormField('name', 'Vessel Name *', formData.name, (v) => setFormData({ ...formData, name: v }))}
                    {renderFormField('imo_number', 'IMO Number', formData.imo_number, (v) => setFormData({ ...formData, imo_number: v }), 'text', 'e.g., 9876543')}
                    {renderFormField('official_number', 'Official Number', formData.official_number, (v) => setFormData({ ...formData, official_number: v }))}
                    {renderFormField('call_sign', 'Call Sign', formData.call_sign, (v) => setFormData({ ...formData, call_sign: v }))}
                    {renderFormField('mmsi_number', 'MMSI Number', formData.mmsi_number, (v) => setFormData({ ...formData, mmsi_number: v }))}
                    {renderSelectField('vessel_type', 'Vessel Type', formData.vessel_type, (v) => setFormData({ ...formData, vessel_type: v }), vesselTypes)}
                    {renderSelectField('flag_state', 'Flag State', formData.flag_state, (v) => setFormData({ ...formData, flag_state: v }), 
                      flagStatesHook.flagStates.length > 0 
                        ? flagStatesHook.flagStates.map(f => ({ value: f.flag_name, label: f.flag_name }))
                        : ['Panama', 'Liberia', 'Marshall Islands', 'Hong Kong', 'Singapore', 'Bahamas', 'Malta', 'Cyprus', 'Greece', 'Norway']
                    )}
                    {renderFormField('port_of_registry', 'Port of Registry', formData.port_of_registry, (v) => setFormData({ ...formData, port_of_registry: v }))}
                    {renderFormField('year_built', 'Year Built', formData.year_built, (v) => setFormData({ ...formData, year_built: v }), 'number', 'e.g., 2020')}
                    {renderSelectField('classification_society', 'Classification Society', formData.classification_society, (v) => setFormData({ ...formData, classification_society: v }),
                      classificationSocieties.societies.length > 0
                        ? classificationSocieties.societies.map(s => ({ value: s.society_name, label: `${s.society_name} (${s.abbreviation || ''})` }))
                        : ['DNV GL', "Lloyd's Register", 'ABS', 'Bureau Veritas', 'ClassNK', 'RINA']
                    )}
                    {renderFormField('class_number', 'Class Number', formData.class_number, (v) => setFormData({ ...formData, class_number: v }))}
                    {renderSelectField('status', 'Status', formData.status, (v) => setFormData({ ...formData, status: v }), statusOptions)}
                    {renderSelectField('trading_area', 'Trading Area', formData.trading_area, (v) => setFormData({ ...formData, trading_area: v }), tradingAreas)}
                  </div>
                </TabsContent>

                <TabsContent value="technical" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderFormField('gross_tonnage', 'Gross Tonnage (GT)', formData.gross_tonnage, (v) => setFormData({ ...formData, gross_tonnage: v }), 'number')}
                    {renderFormField('net_tonnage', 'Net Tonnage (NT)', formData.net_tonnage, (v) => setFormData({ ...formData, net_tonnage: v }), 'number')}
                    {renderFormField('deadweight', 'Deadweight (DWT)', formData.deadweight, (v) => setFormData({ ...formData, deadweight: v }), 'number')}
                    {renderFormField('length_overall', 'Length Overall (m)', formData.length_overall, (v) => setFormData({ ...formData, length_overall: v }), 'number')}
                    {renderFormField('beam', 'Beam (m)', formData.beam, (v) => setFormData({ ...formData, beam: v }), 'number')}
                    {renderFormField('depth', 'Depth (m)', formData.depth, (v) => setFormData({ ...formData, depth: v }), 'number')}
                    {renderFormField('draft', 'Draft (m)', formData.draft, (v) => setFormData({ ...formData, draft: v }), 'number')}
                    {renderFormField('cargo_capacity', 'Cargo Capacity (cbm/TEU)', formData.cargo_capacity, (v) => setFormData({ ...formData, cargo_capacity: v }), 'number')}
                    {renderSelectField('hull_material', 'Hull Material', formData.hull_material, (v) => setFormData({ ...formData, hull_material: v }), hullMaterials)}
                    {renderFormField('hull_coating', 'Hull Coating', formData.hull_coating, (v) => setFormData({ ...formData, hull_coating: v }))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderFormField('keel_laid_date', 'Keel Laid Date', formData.keel_laid_date, (v) => setFormData({ ...formData, keel_laid_date: v }), 'date')}
                    {renderFormField('delivery_date', 'Delivery Date', formData.delivery_date, (v) => setFormData({ ...formData, delivery_date: v }), 'date')}
                    {renderFormField('last_drydock_date', 'Last Drydock Date', formData.last_drydock_date, (v) => setFormData({ ...formData, last_drydock_date: v }), 'date')}
                    {renderFormField('next_drydock_date', 'Next Drydock Date', formData.next_drydock_date, (v) => setFormData({ ...formData, next_drydock_date: v }), 'date')}
                  </div>
                </TabsContent>

                <TabsContent value="machinery" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderFormField('engine_make', 'Engine Make', formData.engine_make, (v) => setFormData({ ...formData, engine_make: v }))}
                    {renderFormField('engine_model', 'Engine Model', formData.engine_model, (v) => setFormData({ ...formData, engine_model: v }))}
                    {renderFormField('engine_power', 'Engine Power (kW)', formData.engine_power, (v) => setFormData({ ...formData, engine_power: v }), 'number')}
                    {renderSelectField('propulsion_type', 'Propulsion Type', formData.propulsion_type, (v) => setFormData({ ...formData, propulsion_type: v }), propulsionTypes)}
                    {renderFormField('max_speed', 'Max Speed (knots)', formData.max_speed, (v) => setFormData({ ...formData, max_speed: v }), 'number')}
                    {renderFormField('service_speed', 'Service Speed (knots)', formData.service_speed, (v) => setFormData({ ...formData, service_speed: v }), 'number')}
                    {renderFormField('fuel_consumption', 'Fuel Consumption (MT/day)', formData.fuel_consumption, (v) => setFormData({ ...formData, fuel_consumption: v }), 'number')}
                    {renderSelectField('fuel_type', 'Fuel Type', formData.fuel_type, (v) => setFormData({ ...formData, fuel_type: v }), fuelTypes)}
                  </div>
                </TabsContent>

                <TabsContent value="safety" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderFormField('lifeboats', 'Lifeboats', formData.lifeboats, (v) => setFormData({ ...formData, lifeboats: v }), 'number')}
                    {renderFormField('liferafts', 'Liferafts', formData.liferafts, (v) => setFormData({ ...formData, liferafts: v }), 'number')}
                    {renderFormField('crew_capacity', 'Crew Capacity', formData.crew_capacity, (v) => setFormData({ ...formData, crew_capacity: v }), 'number')}
                    {renderFormField('passenger_capacity', 'Passenger Capacity', formData.passenger_capacity, (v) => setFormData({ ...formData, passenger_capacity: v }), 'number')}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderFormField('purchase_price', 'Purchase Price', formData.purchase_price, (v) => setFormData({ ...formData, purchase_price: v }), 'number')}
                    {renderFormField('insurance_value', 'Insurance Value', formData.insurance_value, (v) => setFormData({ ...formData, insurance_value: v }), 'number')}
                    {renderSelectField('currency', 'Currency', formData.currency, (v) => setFormData({ ...formData, currency: v }), currencies)}
                  </div>
                </TabsContent>

                <TabsContent value="management" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderSelectField('owner_company_id', 'Owner Company', formData.owner_company_id, (v) => setFormData({ ...formData, owner_company_id: v }),
                      ownerCompanies.companies.map(c => ({ value: c.id, label: c.name }))
                    )}
                    {renderSelectField('operator_company_id', 'Operator Company', formData.operator_company_id, (v) => setFormData({ ...formData, operator_company_id: v }),
                      operatorCompanies.companies.map(c => ({ value: c.id, label: c.name }))
                    )}
                    {renderSelectField('technical_manager_id', 'Technical Manager', formData.technical_manager_id, (v) => setFormData({ ...formData, technical_manager_id: v }),
                      technicalManagers.companies.map(c => ({ value: c.id, label: c.name }))
                    )}
                    {renderSelectField('ism_manager_id', 'ISM Manager', formData.ism_manager_id, (v) => setFormData({ ...formData, ism_manager_id: v }),
                      ismManagers.companies.map(c => ({ value: c.id, label: c.name }))
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about the vessel..."
                      rows={4}
                      disabled={viewMode}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {viewMode ? 'Close' : 'Cancel'}
                </Button>
                {!viewMode && (
                  <Button type="submit" className="btn-maritime">
                    {editingVessel ? 'Update Vessel' : 'Add Vessel'}
                  </Button>
                )}
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
                  <TableHead>GT / DWT</TableHead>
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
                    <TableCell>
                      {vessel.gross_tonnage ? `${vessel.gross_tonnage.toLocaleString()} / ${vessel.deadweight?.toLocaleString() || '-'}` : '-'}
                    </TableCell>
                    <TableCell>{vessel.classification_society || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(vessel.status)}>
                        {vessel.status?.charAt(0).toUpperCase() + vessel.status?.slice(1).replace('_', ' ') || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(vessel, true)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(vessel)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(vessel.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete"
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
