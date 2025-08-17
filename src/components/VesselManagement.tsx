import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Ship, 
  Building2, 
  Award, 
  DollarSign, 
  Anchor, 
  Cog, 
  Radio, 
  Gauge, 
  Shield, 
  AlertTriangle, 
  FileText, 
  Upload 
} from 'lucide-react';

interface VesselFormData {
  // General Information
  vesselName: string;
  imoNumber: string;
  callSign: string;
  mmsiNumber: string;
  officialNumber: string;
  vesselType: string;
  
  // Ownership
  ownerCompany: string;
  operatorCompany: string;
  technicalManager: string;
  ismManager: string;
  docIssuer: string;
  
  // Classification Society
  classificationSociety: string;
  classNumber: string;
  
  // Financial Information
  purchasePrice: string;
  currency: string;
  insuranceValue: string;
  
  // Hull Information
  hullType: string;
  hullCoating: string;
  yearBuilt: string;
  shipyard: string;
  
  // Technical Specifications
  length: string;
  beam: string;
  depth: string;
  grossTonnage: string;
  netTonnage: string;
  deadweight: string;
  
  // Machinery
  engineMake: string;
  engineModel: string;
  enginePower: string;
  propulsionType: string;
  
  // Communications & Navigation
  gmdssArea: string;
  satelliteProvider: string;
  
  // Performance Data
  maxSpeed: string;
  serviceSpeed: string;
  fuelConsumption: string;
  
  // Safety Equipment
  lifeboats: string;
  liferafts: string;
  fireExtinguishers: string;
  
  // Status
  registryStatus: string;
  flagState: string;
  isActive: boolean;
}

const VesselManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<VesselFormData>({
    vesselName: '',
    imoNumber: '',
    callSign: '',
    mmsiNumber: '',
    officialNumber: '',
    vesselType: '',
    ownerCompany: '',
    operatorCompany: '',
    technicalManager: '',
    ismManager: '',
    docIssuer: '',
    classificationSociety: '',
    classNumber: '',
    purchasePrice: '',
    currency: 'USD',
    insuranceValue: '',
    hullType: '',
    hullCoating: '',
    yearBuilt: '',
    shipyard: '',
    length: '',
    beam: '',
    depth: '',
    grossTonnage: '',
    netTonnage: '',
    deadweight: '',
    engineMake: '',
    engineModel: '',
    enginePower: '',
    propulsionType: '',
    gmdssArea: '',
    satelliteProvider: '',
    maxSpeed: '',
    serviceSpeed: '',
    fuelConsumption: '',
    lifeboats: '',
    liferafts: '',
    fireExtinguishers: '',
    registryStatus: '',
    flagState: '',
    isActive: true
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Success",
      description: "Vessel information saved successfully"
    });
  };

  const vesselTabs = [
    { id: 'general', label: 'General', icon: Ship },
    { id: 'ownership', label: 'Ownership', icon: Building2 },
    { id: 'classification', label: 'Classification', icon: Award },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'hull', label: 'Hull', icon: Anchor },
    { id: 'machinery', label: 'Machinery', icon: Cog },
    { id: 'communications', label: 'Communications', icon: Radio },
    { id: 'performance', label: 'Performance', icon: Gauge },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'audit-risk', label: 'AI Audit Risk', icon: AlertTriangle },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'uploads', label: 'Uploads', icon: Upload }
  ];

  const renderFormField = (label: string, field: string, type: string = 'text', options?: string[]) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      {type === 'select' && options ? (
        <Select value={formData[field as keyof VesselFormData] as string} onValueChange={(value) => updateFormData(field, value)}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'textarea' ? (
        <Textarea
          id={field}
          value={formData[field as keyof VesselFormData] as string}
          onChange={(e) => updateFormData(field, e.target.value)}
          rows={3}
        />
      ) : (
        <Input
          id={field}
          type={type}
          value={formData[field as keyof VesselFormData] as string}
          onChange={(e) => updateFormData(field, e.target.value)}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          ⚓ Full Vessel Management
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Manage all aspects of vessel data, from registration and ownership to technical specifications and compliance documentation.
        </p>
      </div>

      <Card className="maritime-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Navigation */}
              <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 gap-1 h-auto p-2 bg-muted/50">
                {vesselTabs.map(tab => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex flex-col items-center gap-1 p-3 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="hidden sm:block">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* General Information */}
              <TabsContent value="general" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">General Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderFormField('Vessel Name', 'vesselName')}
                    {renderFormField('IMO Number', 'imoNumber')}
                    {renderFormField('Call Sign', 'callSign')}
                    {renderFormField('MMSI Number', 'mmsiNumber')}
                    {renderFormField('Official Number', 'officialNumber')}
                    {renderFormField('Vessel Type', 'vesselType', 'select', [
                      'Bulk Carrier', 'Container Ship', 'Tanker', 'General Cargo', 
                      'Passenger Ship', 'RoRo Ship', 'LNG Carrier', 'Chemical Tanker'
                    ])}
                  </div>
                </div>
              </TabsContent>

              {/* Ownership */}
              <TabsContent value="ownership" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Ownership & Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderFormField('Owner Company', 'ownerCompany', 'select', ['Maersk', 'MSC', 'CMA CGM'])}
                    {renderFormField('Operator Company', 'operatorCompany', 'select', ['Maersk', 'MSC', 'CMA CGM'])}
                    {renderFormField('Technical Manager', 'technicalManager', 'select', ['TechMarine Ltd', 'Baltic Marine', 'Ocean Tech'])}
                    {renderFormField('ISM Manager', 'ismManager', 'select', ['ISM Solutions', 'Maritime Safety Corp'])}
                    {renderFormField('DOC Issuer', 'docIssuer', 'select', ['DNV GL', 'Lloyd\'s Register', 'ABS'])}
                  </div>
                </div>
              </TabsContent>

              {/* Classification Society */}
              <TabsContent value="classification" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Classification Society</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderFormField('Classification Society', 'classificationSociety', 'select', [
                      'DNV GL', 'Lloyd\'s Register', 'ABS', 'Bureau Veritas', 'ClassNK', 'RINA'
                    ])}
                    {renderFormField('Class Number', 'classNumber')}
                  </div>
                </div>
              </TabsContent>

              {/* Financial Information */}
              <TabsContent value="financial" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Financial Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderFormField('Purchase Price', 'purchasePrice', 'number')}
                    {renderFormField('Currency', 'currency', 'select', ['USD', 'EUR', 'GBP', 'JPY'])}
                    {renderFormField('Insurance Value', 'insuranceValue', 'number')}
                  </div>
                </div>
              </TabsContent>

              {/* Hull Information */}
              <TabsContent value="hull" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Hull Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {renderFormField('Hull Type', 'hullType', 'select', ['Single Hull', 'Double Hull', 'Ice Class'])}
                    {renderFormField('Hull Coating', 'hullCoating', 'select', ['Antifouling', 'Epoxy', 'Zinc Rich'])}
                    {renderFormField('Year Built', 'yearBuilt', 'number')}
                    {renderFormField('Shipyard', 'shipyard')}
                  </div>
                </div>
              </TabsContent>

              {/* Technical Specifications */}
              <TabsContent value="machinery" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">Dimensions</h4>
                      {renderFormField('Length (m)', 'length', 'number')}
                      {renderFormField('Beam (m)', 'beam', 'number')}
                      {renderFormField('Depth (m)', 'depth', 'number')}
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">Tonnage</h4>
                      {renderFormField('Gross Tonnage', 'grossTonnage', 'number')}
                      {renderFormField('Net Tonnage', 'netTonnage', 'number')}
                      {renderFormField('Deadweight (MT)', 'deadweight', 'number')}
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">Machinery</h4>
                      {renderFormField('Engine Make', 'engineMake')}
                      {renderFormField('Engine Model', 'engineModel')}
                      {renderFormField('Engine Power (kW)', 'enginePower', 'number')}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Communications & Navigation */}
              <TabsContent value="communications" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Communications & Navigation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderFormField('GMDSS Area', 'gmdssArea', 'select', ['A1', 'A2', 'A3', 'A4'])}
                    {renderFormField('Satellite Provider', 'satelliteProvider', 'select', ['Inmarsat', 'Iridium', 'Thuraya'])}
                  </div>
                </div>
              </TabsContent>

              {/* Performance Data */}
              <TabsContent value="performance" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Performance Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderFormField('Max Speed (knots)', 'maxSpeed', 'number')}
                    {renderFormField('Service Speed (knots)', 'serviceSpeed', 'number')}
                    {renderFormField('Fuel Consumption (MT/day)', 'fuelConsumption', 'number')}
                  </div>
                </div>
              </TabsContent>

              {/* Safety Equipment */}
              <TabsContent value="safety" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Safety Equipment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderFormField('Lifeboats', 'lifeboats', 'number')}
                    {renderFormField('Life Rafts', 'liferafts', 'number')}
                    {renderFormField('Fire Extinguishers', 'fireExtinguishers', 'number')}
                  </div>
                </div>
              </TabsContent>

              {/* AI Audit Risk */}
              <TabsContent value="audit-risk" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">AI Audit Risk Assessment</h3>
                  <div className="maritime-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-lg font-medium mb-4">Risk Factors</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Vessel Age:</span>
                            <Badge variant="outline">Medium Risk</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Flag State:</span>
                            <Badge className="status-valid">Low Risk</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Classification Society:</span>
                            <Badge className="status-valid">Low Risk</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Inspection History:</span>
                            <Badge className="status-warning">Medium Risk</Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium mb-4">Overall Risk Score</h4>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary mb-2">7.2/10</div>
                          <Badge className="status-warning">Medium Risk</Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            Based on AI analysis of vessel data, inspection history, and regulatory factors.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Documentation & Uploads placeholders */}
              <TabsContent value="documentation" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Documentation</h3>
                  <div className="text-center text-muted-foreground py-8">
                    Documentation management features coming soon...
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="uploads" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">Document Uploads</h3>
                  <div className="text-center text-muted-foreground py-8">
                    Document upload functionality coming soon...
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-border">
              <Button type="submit" className="btn-maritime">
                Save Vessel Information
              </Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="button" variant="outline" className="ml-auto">
                Preview Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VesselManagement;