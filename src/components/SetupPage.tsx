import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SetupData {
  [key: string]: any[];
}

interface SetupCardConfig {
  type: string;
  title: string;
  headers: string[];
  labels: string[];
}

const SetupPage = () => {
  const { toast } = useToast();
  const [setupData, setSetupData] = useState<SetupData>({});
  const [editingItem, setEditingItem] = useState<{ type: string; index: number; data: any } | null>(null);
  const [showAddForm, setShowAddForm] = useState<{ type: string; config: SetupCardConfig } | null>(null);

  // Setup configurations for different categories
  const setupConfigs = {
    // Company & Vessel Data
    ownerCompanies: {
      type: 'ownerCompanies',
      title: 'Owner Company',
      headers: ['name', 'contactPerson', 'title', 'phone', 'email', 'address', 'remarks'],
      labels: ['Company Name', 'Contact Person', 'Title', 'Phone', 'Email', 'Address', 'Remarks']
    },
    operatorCompanies: {
      type: 'operatorCompanies',
      title: 'Operator Company',
      headers: ['name', 'contactPerson', 'title', 'phone', 'email', 'address', 'remarks'],
      labels: ['Company Name', 'Contact Person', 'Title', 'Phone', 'Email', 'Address', 'Remarks']
    },
    technicalManagers: {
      type: 'technicalManagers',
      title: 'Technical Manager',
      headers: ['name', 'contactPerson', 'title', 'phone', 'email', 'address', 'remarks'],
      labels: ['Manager Name', 'Contact Person', 'Title', 'Phone', 'Email', 'Address', 'Remarks']
    },
    ismManagers: {
      type: 'ismManagers',
      title: 'ISM Manager',
      headers: ['name', 'contactPerson', 'title', 'phone', 'email', 'address', 'remarks'],
      labels: ['Manager Name', 'Contact Person', 'Title', 'Phone', 'Email', 'Address', 'Remarks']
    },
    docIssuers: {
      type: 'docIssuers',
      title: 'DOC Issuer',
      headers: ['name', 'contactPerson', 'title', 'phone', 'email', 'address', 'remarks'],
      labels: ['Issuer Name', 'Contact Person', 'Title', 'Phone', 'Email', 'Address', 'Remarks']
    },
    
    // Crew Data
    crewRanks: {
      type: 'crewRanks',
      title: 'Crew Rank',
      headers: ['name', 'department', 'level'],
      labels: ['Rank Name', 'Department', 'Level']
    },
    nationalities: {
      type: 'nationalities',
      title: 'Nationality',
      headers: ['name', 'code'],
      labels: ['Country Name', 'Code']
    },
    crewContractTypes: {
      type: 'crewContractTypes',
      title: 'Crew Contract Type',
      headers: ['name', 'duration'],
      labels: ['Contract Type', 'Duration (months)']
    },
    currencyCodes: {
      type: 'currencyCodes',
      title: 'Currency Code',
      headers: ['code', 'name', 'symbol'],
      labels: ['Code', 'Currency Name', 'Symbol']
    },

    // Audit & Findings Data
    auditTypes: {
      type: 'auditTypes',
      title: 'Audit Type',
      headers: ['name', 'description', 'frequency'],
      labels: ['Audit Type', 'Description', 'Frequency']
    },
    findingTypes: {
      type: 'findingTypes',
      title: 'Finding Type',
      headers: ['name', 'weight', 'severity'],
      labels: ['Type Name', 'Weight (%)', 'Severity']
    },
    findingStatuses: {
      type: 'findingStatuses',
      title: 'Finding Status',
      headers: ['name', 'description', 'color'],
      labels: ['Status Name', 'Description', 'Color']
    },
    rootCauseCategories: {
      type: 'rootCauseCategories',
      title: 'Root Cause Category',
      headers: ['name', 'description'],
      labels: ['Category Name', 'Description']
    },
    findingOwners: {
      type: 'findingOwners',
      title: 'Finding Owner',
      headers: ['name', 'department', 'email'],
      labels: ['Name', 'Department', 'Email']
    },

    // Classification & Risk Data
    classificationSocieties: {
      type: 'classificationSocieties',
      title: 'Classification Society',
      headers: ['name', 'code', 'headquarters'],
      labels: ['Society Name', 'Code', 'Headquarters']
    },
    flagStates: {
      type: 'flagStates',
      title: 'Flag State',
      headers: ['name', 'score', 'riskLevel'],
      labels: ['Flag State', 'Risk Score', 'Risk Level']
    },
    riskCalculations: {
      type: 'riskCalculations',
      title: 'Risk Calculation',
      headers: ['type', 'cargo', 'score', 'reason'],
      labels: ['Ship Type', 'Typical Cargo', 'Score (1-10)', 'Reason']
    },

    // Certificate Types
    standardCertificates: {
      type: 'standardCertificates',
      title: 'Standard Certificate',
      headers: ['name', 'issuer', 'validityPeriod'],
      labels: ['Certificate Name', 'Issuer', 'Validity (months)']
    },
    crewTrainingCertificates: {
      type: 'crewTrainingCertificates',
      title: 'Crew Training Certificate',
      headers: ['name', 'level', 'validityPeriod'],
      labels: ['Certificate Name', 'Level', 'Validity (months)']
    },
    cargoCertificates: {
      type: 'cargoCertificates',
      title: 'Specialized Cargo Certificate',
      headers: ['name', 'cargoType'],
      labels: ['Certificate Name', 'Cargo Type']
    },
    environmentalCertificates: {
      type: 'environmentalCertificates',
      title: 'Environmental Certificate',
      headers: ['name', 'standard'],
      labels: ['Certificate Name', 'Environmental Standard']
    }
  };

  // Initialize setup data
  useEffect(() => {
    const initialData: SetupData = {};
    Object.keys(setupConfigs).forEach(key => {
      initialData[key] = [];
    });
    setSetupData(initialData);
  }, []);

  const handleAddItem = (type: string, newItem: any) => {
    setSetupData(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), { ...newItem, id: Date.now().toString() }]
    }));
    setShowAddForm(null);
    toast({
      title: "Success",
      description: "Item added successfully"
    });
  };

  const handleEditItem = (type: string, index: number, updatedItem: any) => {
    setSetupData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? updatedItem : item)
    }));
    setEditingItem(null);
    toast({
      title: "Success",
      description: "Item updated successfully"
    });
  };

  const handleDeleteItem = (type: string, index: number) => {
    setSetupData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
    toast({
      title: "Success",
      description: "Item deleted successfully"
    });
  };

  const renderDataTable = (config: SetupCardConfig) => {
    const data = setupData[config.type] || [];
    
    return (
      <div className="maritime-card">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
          <h4 className="font-semibold">{config.title}s</h4>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm({ type: config.type, config })}
            className="btn-ocean"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New
          </Button>
        </div>
        
        <div className="p-4">
          {data.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No {config.title.toLowerCase()}s configured yet. Click "Add New" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {config.labels.map((label, index) => (
                      <th key={index} className="text-left py-2 px-3 text-sm font-semibold text-muted-foreground">
                        {label}
                      </th>
                    ))}
                    <th className="text-left py-2 px-3 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-accent/50">
                      {config.headers.map((header, headerIndex) => (
                        <td key={headerIndex} className="py-2 px-3 text-sm">
                          {editingItem?.type === config.type && editingItem?.index === index ? (
                            <Input
                              value={editingItem.data[header] || ''}
                              onChange={(e) => setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, [header]: e.target.value }
                              })}
                              className="h-8"
                            />
                          ) : (
                            <span>{item[header] || '-'}</span>
                          )}
                        </td>
                      ))}
                      <td className="py-2 px-3">
                        {editingItem?.type === config.type && editingItem?.index === index ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditItem(config.type, index, editingItem.data)}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItem(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItem({ type: config.type, index, data: item })}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteItem(config.type, index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAddForm = () => {
    if (!showAddForm) return null;

    const [formData, setFormData] = useState<any>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddItem(showAddForm.type, formData);
      setFormData({});
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add New {showAddForm.config.title}</h3>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {showAddForm.config.headers.map((header, index) => (
              <div key={header} className="space-y-2">
                <Label htmlFor={header}>{showAddForm.config.labels[index]}</Label>
                <Input
                  id={header}
                  value={formData[header] || ''}
                  onChange={(e) => setFormData({ ...formData, [header]: e.target.value })}
                  required
                />
              </div>
            ))}
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="btn-maritime flex-1">
                Add {showAddForm.config.title}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          🛠️ Platform Setup
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Configure the core data models, categories, and parameters that power the compliance management system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Company & Vessel Data */}
        <div className="space-y-6">
          <div className="maritime-card">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-bold">Company & Vessel Data</h3>
            </div>
            <div className="p-4 space-y-4">
              {renderDataTable(setupConfigs.ownerCompanies)}
              {renderDataTable(setupConfigs.operatorCompanies)}
              {renderDataTable(setupConfigs.technicalManagers)}
              {renderDataTable(setupConfigs.ismManagers)}
              {renderDataTable(setupConfigs.docIssuers)}
            </div>
          </div>
        </div>

        {/* Crew Data */}
        <div className="space-y-6">
          <div className="maritime-card">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-bold">Crew Data</h3>
            </div>
            <div className="p-4 space-y-4">
              {renderDataTable(setupConfigs.crewRanks)}
              {renderDataTable(setupConfigs.nationalities)}
              {renderDataTable(setupConfigs.crewContractTypes)}
              {renderDataTable(setupConfigs.currencyCodes)}
            </div>
          </div>
        </div>

        {/* Audit & Findings Data */}
        <div className="space-y-6">
          <div className="maritime-card">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-bold">Audit & Findings Data</h3>
            </div>
            <div className="p-4 space-y-4">
              {renderDataTable(setupConfigs.auditTypes)}
              {renderDataTable(setupConfigs.findingTypes)}
              {renderDataTable(setupConfigs.findingStatuses)}
              {renderDataTable(setupConfigs.rootCauseCategories)}
              {renderDataTable(setupConfigs.findingOwners)}
            </div>
          </div>
        </div>

        {/* Classification & Risk Data */}
        <div className="space-y-6">
          <div className="maritime-card">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-bold">Classification & Risk Data</h3>
            </div>
            <div className="p-4 space-y-4">
              {renderDataTable(setupConfigs.classificationSocieties)}
              {renderDataTable(setupConfigs.flagStates)}
              {renderDataTable(setupConfigs.riskCalculations)}
            </div>
          </div>
        </div>

        {/* Certificate Types */}
        <div className="space-y-6 lg:col-span-2">
          <div className="maritime-card">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-bold">Certification Types</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderDataTable(setupConfigs.standardCertificates)}
              {renderDataTable(setupConfigs.crewTrainingCertificates)}
              {renderDataTable(setupConfigs.cargoCertificates)}
              {renderDataTable(setupConfigs.environmentalCertificates)}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="maritime-card p-6">
        <h3 className="text-xl font-semibold mb-4">Configuration Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(setupConfigs).map(([key, config]) => {
            const count = setupData[key]?.length || 0;
            return (
              <div key={key} className="text-center">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-sm text-muted-foreground">{config.title}s</div>
              </div>
            );
          })}
        </div>
      </div>

      {renderAddForm()}
    </div>
  );
};

export default SetupPage;