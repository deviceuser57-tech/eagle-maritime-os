import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, Loader2, Download, Upload as UploadIcon, Database } from 'lucide-react';
import { useSetupCompanies } from '@/hooks/useSetupCompanies';
import { useCrewRanks, useNationalities, useContractTypes, useCurrencies } from '@/hooks/useSetupCrewConfig';
import { useAuditTypes, useFindingTypes, useFindingStatuses, useRootCauses } from '@/hooks/useSetupAuditConfig';
import { useClassificationSocieties, useFlagStates } from '@/hooks/useSetupClassification';
import { useCertificateTypes } from '@/hooks/useSetupCertificates';
import { useSetupIncidentTypes } from '@/hooks/useSetupIncidentTypes';
import { useSetupProjectTypes } from '@/hooks/useSetupProjectTypes';
import { useSetupClaimTypes } from '@/hooks/useSetupClaimTypes';
import RegulatoryManager from '@/components/RegulatoryManager';
import { CsvUploader } from '@/components/CsvUploader';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { useDynamicSetupEntities, useDynamicSetupRecords } from '@/hooks/useDynamicSetup';

interface SetupCardConfig {
  type: string;
  title: string;
  headers: string[];
  labels: string[];
  dbFields: string[];
}

// Helper component for dynamic records
const DynamicEntityCard = ({ entity }: { entity: any }) => {
  const { records, isLoading, addRecord, updateRecord, deleteRecord, bulkAddRecords } = useDynamicSetupRecords(entity.id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [showImport, setShowImport] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    if (!records || records.length === 0) {
      toast({ title: 'No Data', description: 'There is no data to export.', variant: 'destructive' });
      return;
    }
    const csvData = records.map(r => r.data);
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${entity.title}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (data: any[]) => {
    setShowImport(false);
    try {
      await bulkAddRecords.mutateAsync(data);
    } catch (e) {
      console.error(e);
    }
  };

  const headers = entity.schema.map((f: any) => f.name);
  const labels = entity.schema.map((f: any) => f.label);

  return (
    <div className="maritime-card group overflow-hidden">
      <div className="flex justify-between items-center p-5 bg-muted/10 border-b border-border">
        <div>
          <h4 className="font-bold text-base tracking-tight uppercase group-hover:text-primary transition-colors text-foreground">{entity.title}</h4>
          <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Custom Metadata</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExport} className="h-9 px-3 rounded-lg text-xs" title="Export CSV">
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowImport(true)} className="h-9 px-3 rounded-lg text-xs" title="Import CSV">
            <UploadIcon className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" onClick={() => setShowAddForm(true)} className="btn-maritime px-4 h-9 rounded-lg text-[10px]">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Record
          </Button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 px-6 border-2 border-dashed border-border rounded-3xl bg-slate-500/5">
            <p className="text-muted-foreground font-bold italic">Zero records detected.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  {labels.map((label: string, index: number) => (
                    <th key={index} className="text-left pb-4 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</th>
                  ))}
                  <th className="text-right pb-4 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Operations</th>
                </tr>
              </thead>
              <tbody>
                {records.map((item: any) => (
                  <tr key={item.id} className="group/row bg-white/50 hover:bg-white transition-all shadow-sm rounded-2xl">
                    {headers.map((field: string, fieldIndex: number) => (
                      <td key={fieldIndex} className="py-4 px-4 text-sm font-medium">
                        {item.data[field] || '-'}
                      </td>
                    ))}
                    <td className="py-4 px-4 text-right">
                      <Button size="sm" variant="destructive" onClick={() => deleteRecord.mutate(item.id)} className="h-7 w-7 p-0 rounded-lg">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showImport && (
        <CsvUploader 
          onImport={handleImport} 
          onCancel={() => setShowImport(false)} 
          expectedHeaders={headers} 
          title={entity.title} 
        />
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Record</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              addRecord.mutate(formData);
              setShowAddForm(false);
              setFormData({});
            }} className="space-y-4">
              {headers.map((field: string, i: number) => (
                <div key={field} className="space-y-2">
                  <Label>{labels[i]}</Label>
                  <Input value={formData[field] || ''} onChange={(e) => setFormData({...formData, [field]: e.target.value})} />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SetupPage = () => {
  const [editingItem, setEditingItem] = useState<{ type: string; id: string; data: any; } | null>(null);
  const [showAddForm, setShowAddForm] = useState<{ type: string; config: SetupCardConfig; } | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const [importConfig, setImportConfig] = useState<{ type: string; config: any } | null>(null);
  const [showNewEntityForm, setShowNewEntityForm] = useState(false);
  const [newEntityData, setNewEntityData] = useState({ title: '', fields: 'name,description' });

  const { toast } = useToast();

  // Dynamic entities
  const { entities, addEntity } = useDynamicSetupEntities();

  // Company hooks
  const companies = useSetupCompanies();

  // Crew config hooks
  const crewRanks = useCrewRanks();
  const nationalities = useNationalities();
  const contractTypes = useContractTypes();
  const currencies = useCurrencies();

  // Audit config hooks
  const auditTypes = useAuditTypes();
  const findingTypes = useFindingTypes();
  const findingStatuses = useFindingStatuses();
  const rootCauses = useRootCauses();

  // Classification hooks
  const classificationSocieties = useClassificationSocieties();
  const flagStates = useFlagStates();

  // Certificate hooks
  const statutoryCerts = useCertificateTypes('statutory');
  const crewCerts = useCertificateTypes('crew');

  // Operational master data hooks
  const incidentTypes = useSetupIncidentTypes();
  const projectTypes = useSetupProjectTypes();
  const claimTypes = useSetupClaimTypes();

  const setupConfigs: Record<string, SetupCardConfig & { data: any[]; isLoading: boolean; add: any; update: any; delete: any; }> = {
    companies: {
      type: 'companies', title: 'Company',
      headers: ['name', 'contact_person', 'phone', 'email', 'roles'],
      labels: ['Company Name', 'Contact Person', 'Phone', 'Email', 'Roles'],
      dbFields: ['name', 'contact_person', 'phone', 'email'],
      data: companies.companies, isLoading: companies.isLoading,
      add: (data: any) => companies.addCompany.mutateAsync(data),
      update: (data: any) => companies.updateCompany.mutate(data),
      delete: (id: string) => companies.deleteCompany.mutate(id)
    },
    crewRanks: {
      type: 'crewRanks', title: 'Crew Rank',
      headers: ['rank_name', 'department'],
      labels: ['Rank Name', 'Department'],
      dbFields: ['rank_name', 'department'],
      data: crewRanks.ranks, isLoading: crewRanks.isLoading,
      add: (data: any) => crewRanks.addRank.mutateAsync(data),
      update: (data: any) => crewRanks.updateRank.mutate(data),
      delete: (id: string) => crewRanks.deleteRank.mutate(id)
    },
    nationalities: {
      type: 'nationalities', title: 'Nationality',
      headers: ['country_name', 'country_code'],
      labels: ['Country Name', 'Code'],
      dbFields: ['country_name', 'country_code'],
      data: nationalities.nationalities, isLoading: nationalities.isLoading,
      add: (data: any) => nationalities.addNationality.mutateAsync(data),
      update: (data: any) => nationalities.updateNationality.mutate(data),
      delete: (id: string) => nationalities.deleteNationality.mutate(id)
    },
    contractTypes: {
      type: 'contractTypes', title: 'Contract Type',
      headers: ['contract_name', 'duration_months'],
      labels: ['Contract Type', 'Duration (months)'],
      dbFields: ['contract_name', 'duration_months'],
      data: contractTypes.contractTypes, isLoading: contractTypes.isLoading,
      add: (data: any) => contractTypes.addContractType.mutateAsync(data),
      update: (data: any) => contractTypes.updateContractType.mutate(data),
      delete: (id: string) => contractTypes.deleteContractType.mutate(id)
    },
    currencies: {
      type: 'currencies', title: 'Currency',
      headers: ['currency_code', 'currency_name', 'symbol'],
      labels: ['Code', 'Currency Name', 'Symbol'],
      dbFields: ['currency_code', 'currency_name', 'symbol'],
      data: currencies.currencies, isLoading: currencies.isLoading,
      add: (data: any) => currencies.addCurrency.mutateAsync(data),
      update: (data: any) => currencies.updateCurrency.mutate(data),
      delete: (id: string) => currencies.deleteCurrency.mutate(id)
    },
    auditTypes: {
      type: 'auditTypes', title: 'Audit Type',
      headers: ['audit_type_name', 'description', 'frequency_months'],
      labels: ['Audit Type', 'Description', 'Frequency (months)'],
      dbFields: ['audit_type_name', 'description', 'frequency_months'],
      data: auditTypes.auditTypes, isLoading: auditTypes.isLoading,
      add: (data: any) => auditTypes.addAuditType.mutateAsync(data),
      update: (data: any) => auditTypes.updateAuditType.mutate(data),
      delete: (id: string) => auditTypes.deleteAuditType.mutate(id)
    },
    findingTypes: {
      type: 'findingTypes', title: 'Finding Type',
      headers: ['finding_type_name', 'severity', 'description'],
      labels: ['Type Name', 'Severity', 'Description'],
      dbFields: ['finding_type_name', 'severity', 'description'],
      data: findingTypes.findingTypes, isLoading: findingTypes.isLoading,
      add: (data: any) => findingTypes.addFindingType.mutateAsync(data),
      update: (data: any) => findingTypes.updateFindingType.mutate(data),
      delete: (id: string) => findingTypes.deleteFindingType.mutate(id)
    },
    findingStatuses: {
      type: 'findingStatuses', title: 'Finding Status',
      headers: ['status_name', 'status_order', 'color'],
      labels: ['Status Name', 'Order', 'Color'],
      dbFields: ['status_name', 'status_order', 'color'],
      data: findingStatuses.findingStatuses, isLoading: findingStatuses.isLoading,
      add: (data: any) => findingStatuses.addFindingStatus.mutateAsync(data),
      update: (data: any) => findingStatuses.updateFindingStatus.mutate(data),
      delete: (id: string) => findingStatuses.deleteFindingStatus.mutate(id)
    },
    rootCauses: {
      type: 'rootCauses', title: 'Root Cause',
      headers: ['cause_name', 'category', 'description'],
      labels: ['Cause Name', 'Category', 'Description'],
      dbFields: ['cause_name', 'category', 'description'],
      data: rootCauses.rootCauses, isLoading: rootCauses.isLoading,
      add: (data: any) => rootCauses.addRootCause.mutateAsync(data),
      update: (data: any) => rootCauses.updateRootCause.mutate(data),
      delete: (id: string) => rootCauses.deleteRootCause.mutate(id)
    },
    classificationSocieties: {
      type: 'classificationSocieties', title: 'Classification Society',
      headers: ['society_name', 'abbreviation', 'website'],
      labels: ['Society Name', 'Abbreviation', 'Website'],
      dbFields: ['society_name', 'abbreviation', 'website'],
      data: classificationSocieties.societies, isLoading: classificationSocieties.isLoading,
      add: (data: any) => classificationSocieties.addSociety.mutateAsync(data),
      update: (data: any) => classificationSocieties.updateSociety.mutate(data),
      delete: (id: string) => classificationSocieties.deleteSociety.mutate(id)
    },
    flagStates: {
      type: 'flagStates', title: 'Flag State',
      headers: ['flag_name', 'flag_code', 'risk_level'],
      labels: ['Flag State', 'Code', 'Risk Level'],
      dbFields: ['flag_name', 'flag_code', 'risk_level'],
      data: flagStates.flagStates, isLoading: flagStates.isLoading,
      add: (data: any) => flagStates.addFlagState.mutateAsync(data),
      update: (data: any) => flagStates.updateFlagState.mutate(data),
      delete: (id: string) => flagStates.deleteFlagState.mutate(id)
    },
    statutoryCertificates: {
      type: 'statutoryCertificates', title: 'Statutory Certificate',
      headers: ['certificate_name', 'issuing_authority', 'validity_months'],
      labels: ['Certificate Name', 'Issuing Authority', 'Validity (months)'],
      dbFields: ['certificate_name', 'issuing_authority', 'validity_months'],
      data: statutoryCerts.certificateTypes, isLoading: statutoryCerts.isLoading,
      add: (data: any) => statutoryCerts.addCertificateType.mutateAsync({ ...data, certificate_category: 'statutory' }),
      update: (data: any) => statutoryCerts.updateCertificateType.mutate(data),
      delete: (id: string) => statutoryCerts.deleteCertificateType.mutate(id)
    },
    crewCertificates: {
      type: 'crewCertificates', title: 'Crew Certificate',
      headers: ['certificate_name', 'issuing_authority', 'validity_months'],
      labels: ['Certificate Name', 'Issuing Authority', 'Validity (months)'],
      dbFields: ['certificate_name', 'issuing_authority', 'validity_months'],
      data: crewCerts.certificateTypes, isLoading: crewCerts.isLoading,
      add: (data: any) => crewCerts.addCertificateType.mutateAsync({ ...data, certificate_category: 'crew' }),
      update: (data: any) => crewCerts.updateCertificateType.mutate(data),
      delete: (id: string) => crewCerts.deleteCertificateType.mutate(id)
    },
    incidentTypes: {
      type: 'incidentTypes', title: 'Incident Type',
      headers: ['name', 'description'],
      labels: ['Incident Type', 'Description'],
      dbFields: ['name', 'description'],
      data: incidentTypes.incidentTypes, isLoading: incidentTypes.isLoading,
      add: (data: any) => incidentTypes.addIncidentType.mutateAsync(data),
      update: (data: any) => incidentTypes.updateIncidentType.mutate(data),
      delete: (id: string) => incidentTypes.deleteIncidentType.mutate(id)
    },
    projectTypes: {
      type: 'projectTypes', title: 'Project Type',
      headers: ['name', 'description'],
      labels: ['Project Type', 'Description'],
      dbFields: ['name', 'description'],
      data: projectTypes.projectTypes, isLoading: projectTypes.isLoading,
      add: (data: any) => projectTypes.addProjectType.mutateAsync(data),
      update: (data: any) => projectTypes.updateProjectType.mutate(data),
      delete: (id: string) => projectTypes.deleteProjectType.mutate(id)
    },
    claimTypes: {
      type: 'claimTypes', title: 'Insurance Claim Type',
      headers: ['name', 'description'],
      labels: ['Claim Type', 'Description'],
      dbFields: ['name', 'description'],
      data: claimTypes.claimTypes, isLoading: claimTypes.isLoading,
      add: (data: any) => claimTypes.addClaimType.mutateAsync(data),
      update: (data: any) => claimTypes.updateClaimType.mutate(data),
      delete: (id: string) => claimTypes.deleteClaimType.mutate(id)
    }
  };

  const handleAddItem = (type: string, newItem: any) => {
    const config = setupConfigs[type];
    if (config) {
      config.add(newItem);
    }
    setShowAddForm(null);
    setFormData({});
  };

  const handleEditItem = (type: string, id: string, updatedItem: any) => {
    const config = setupConfigs[type];
    if (config) {
      config.update({ id, ...updatedItem });
    }
    setEditingItem(null);
  };

  const handleDeleteItem = (type: string, id: string) => {
    const config = setupConfigs[type];
    if (config) {
      config.delete(id);
    }
  };

  const handleExport = (configKey: string) => {
    const config = setupConfigs[configKey];
    if (!config || !config.data || config.data.length === 0) {
      toast({ title: 'No Data', description: 'There is no data to export.', variant: 'destructive' });
      return;
    }
    
    // Pick only the fields we care about
    const exportData = config.data.map(item => {
      const row: any = {};
      config.dbFields.forEach(field => {
        row[field] = item[field];
      });
      return row;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${config.title}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (data: any[]) => {
    if (!importConfig) return;
    const { config } = importConfig;
    let successCount = 0;
    
    // We do sequential inserts so we can reuse the existing single-add mutations
    for (const row of data) {
      try {
        await config.add(row);
        successCount++;
      } catch (err: any) {
        console.error('Failed to import row', row, err);
      }
    }
    
    toast({ 
      title: 'Import Complete', 
      description: `Successfully imported ${successCount} out of ${data.length} records.` 
    });
    setImportConfig(null);
  };

  const handleCreateDynamicEntity = (e: React.FormEvent) => {
    e.preventDefault();
    const schema = newEntityData.fields.split(',').map(f => f.trim()).filter(f => f).map(f => ({
      name: f.toLowerCase().replace(/\s+/g, '_'),
      label: f,
      type: 'text' as const,
      required: false
    }));
    
    if (schema.length === 0) return;

    addEntity.mutate({
      title: newEntityData.title,
      table_name: newEntityData.title.toLowerCase().replace(/\s+/g, '_'),
      description: 'Custom setup table',
      schema
    });
    setShowNewEntityForm(false);
    setNewEntityData({ title: '', fields: 'name,description' });
  };

  const renderDataTable = (configKey: string) => {
    const config = setupConfigs[configKey];
    if (!config) return null;

    const data = config.data || [];

    return (
      <div className="maritime-card group overflow-hidden">
        <div className="flex justify-between items-center p-5 bg-muted/10 border-b border-border">
          <div>
            <h4 className="font-bold text-base tracking-tight uppercase group-hover:text-primary transition-colors text-foreground">{config.title} Registry</h4>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">System Core Configuration</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleExport(configKey)} className="h-9 px-3 rounded-lg text-xs" title="Export CSV">
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setImportConfig({ type: configKey, config })} className="h-9 px-3 rounded-lg text-xs" title="Import CSV">
              <UploadIcon className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={() => setShowAddForm({ type: configKey, config })} className="btn-maritime px-4 h-9 rounded-lg text-[10px]">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Initialize
            </Button>
          </div>
        </div>

        <div className="p-4">
          {config.isLoading ?
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div> :
            data.length === 0 ?
              <div className="text-center py-12 px-6 border-2 border-dashed border-border rounded-3xl bg-slate-500/5">
                <p className="text-muted-foreground font-bold italic">Zero records detected in {config.title.toLowerCase()} sector.</p>
                <Button variant="link" onClick={() => setShowAddForm({ type: configKey, config })} className="mt-2 text-primary font-black">
                  + EXECUTE INITIAL DATA ENTRY
                </Button>
              </div> :

              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      {config.labels.map((label, index) =>
                        <th key={index} className="text-left pb-4 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {label}
                        </th>
                      )}
                      <th className="text-right pb-4 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item: any) =>
                      <tr key={item.id} className="group/row bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 shadow-sm hover:shadow-md rounded-2xl">
                        {config.dbFields.map((field, fieldIndex) =>
                          <td key={fieldIndex} className="py-4 px-4 text-sm font-medium text-foreground first:rounded-l-2xl">
                            {editingItem?.type === configKey && editingItem?.id === item.id ?
                              <Input
                                value={editingItem.data[field] || ''}
                                onChange={(e) => setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, [field]: e.target.value }
                                })}
                                className="h-10 rounded-xl bg-background border-primary/20 focus:ring-primary/40 font-bold" /> :
                              <span className="group-hover/row:text-primary transition-colors">{item[field] || '-'}</span>
                            }
                          </td>
                        )}
                        {configKey === 'companies' && (
                          <td className="py-4 px-4 text-sm font-medium text-foreground">
                            {editingItem?.type === configKey && editingItem?.id === item.id ? (
                              <div className="grid grid-cols-2 gap-1.5 text-xs">
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(editingItem.data.is_owner)}
                                    onChange={(e) => setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, is_owner: e.target.checked }
                                    })}
                                    className="rounded border-gray-300 h-3.5 w-3.5"
                                  />
                                  <span className="text-[11px]">Owner</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(editingItem.data.is_operator)}
                                    onChange={(e) => setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, is_operator: e.target.checked }
                                    })}
                                    className="rounded border-gray-300 h-3.5 w-3.5"
                                  />
                                  <span className="text-[11px]">Operator</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(editingItem.data.is_technical_manager)}
                                    onChange={(e) => setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, is_technical_manager: e.target.checked }
                                    })}
                                    className="rounded border-gray-300 h-3.5 w-3.5"
                                  />
                                  <span className="text-[11px]">Technical</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(editingItem.data.is_ism_manager)}
                                    onChange={(e) => setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, is_ism_manager: e.target.checked }
                                    })}
                                    className="rounded border-gray-300 h-3.5 w-3.5"
                                  />
                                  <span className="text-[11px]">ISM</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(editingItem.data.is_doc_issuer)}
                                    onChange={(e) => setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, is_doc_issuer: e.target.checked }
                                    })}
                                    className="rounded border-gray-300 h-3.5 w-3.5"
                                  />
                                  <span className="text-[11px]">DOC</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(editingItem.data.is_insurer)}
                                    onChange={(e) => setEditingItem({
                                      ...editingItem,
                                      data: { ...editingItem.data, is_insurer: e.target.checked }
                                    })}
                                    className="rounded border-gray-300 h-3.5 w-3.5"
                                  />
                                  <span className="text-[11px]">Insurer</span>
                                </label>
                              </div>
                            ) : (
                              <div className="flex gap-1 flex-wrap max-w-[150px]">
                                {item.is_owner && <Badge variant="outline" className="text-[10px]">Owner</Badge>}
                                {item.is_operator && <Badge variant="outline" className="text-[10px]">Operator</Badge>}
                                {item.is_technical_manager && <Badge variant="outline" className="text-[10px]">Technical</Badge>}
                                {item.is_ism_manager && <Badge variant="outline" className="text-[10px]">ISM</Badge>}
                                {item.is_doc_issuer && <Badge variant="outline" className="text-[10px]">DOC</Badge>}
                                {item.is_insurer && <Badge variant="outline" className="text-[10px]">Insurer</Badge>}
                              </div>
                            )}
                          </td>
                        )}
                        <td className="py-4 px-4 text-right rounded-r-2xl">
                          {editingItem?.type === configKey && editingItem?.id === item.id ?
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditItem(configKey, item.id, editingItem.data)}
                                className="rounded-xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-50"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingItem(null)}
                                className="rounded-xl"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div> :
                            <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingItem({ type: configKey, id: item.id, data: item })}
                                className="rounded-xl hover:text-primary hover:border-primary/40"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteItem(configKey, item.id)}
                                className="rounded-xl shadow-lg shadow-destructive/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
          }
        </div>
      </div>);
  };

  const renderAddForm = () => {
    if (!showAddForm) return null;
    const config = setupConfigs[showAddForm.type];
    if (!config) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddItem(showAddForm.type, formData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add New {config.title}</h3>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {config.dbFields.map((field, index) =>
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{config.labels[index]}</Label>
                <Input
                  id={field}
                  value={formData[field] || ''}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  required={index === 0} />
              </div>
            )}
            
            {showAddForm.type === 'companies' && (
              <div className="space-y-3 pt-2 border-t mt-4">
                <Label>Roles</Label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" checked={formData.is_owner || false} onChange={e => setFormData({...formData, is_owner: e.target.checked})} className="rounded border-gray-300" />
                    <span>Owner</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" checked={formData.is_operator || false} onChange={e => setFormData({...formData, is_operator: e.target.checked})} className="rounded border-gray-300" />
                    <span>Operator</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" checked={formData.is_technical_manager || false} onChange={e => setFormData({...formData, is_technical_manager: e.target.checked})} className="rounded border-gray-300" />
                    <span>Technical Manager</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" checked={formData.is_ism_manager || false} onChange={e => setFormData({...formData, is_ism_manager: e.target.checked})} className="rounded border-gray-300" />
                    <span>ISM Manager</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" checked={formData.is_doc_issuer || false} onChange={e => setFormData({...formData, is_doc_issuer: e.target.checked})} className="rounded border-gray-300" />
                    <span>DOC Issuer</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" checked={formData.is_insurer || false} onChange={e => setFormData({...formData, is_insurer: e.target.checked})} className="rounded border-gray-300" />
                    <span>Insurer</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="btn-maritime flex-1">
                Add {config.title}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>);
  };

  const totalItems = Object.values(setupConfigs).reduce((sum, config) => sum + (config.data?.length || 0), 0);

  return (
    <div className="space-y-10 py-6">
      <div className="text-center pb-8 border-b border-border flex flex-col items-center">
        <h2 className="text-3xl font-black tracking-tighter text-foreground mb-3 uppercase">
          Enterprise Metadata Setup
        </h2>
        <p className="text-base text-muted-foreground font-medium max-w-3xl mx-auto px-4 mb-6">
          Configure the core data models, categories, and parameters that power the compliance management system. Bulk operations via CSV are fully supported.
        </p>
        <Button onClick={() => setShowNewEntityForm(true)} className="btn-maritime">
          <Database className="mr-2 h-4 w-4" />
          Create Custom Setup Table
        </Button>
      </div>

      {showNewEntityForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">New Custom Setup Table</h3>
            <form onSubmit={handleCreateDynamicEntity} className="space-y-4">
              <div className="space-y-2">
                <Label>Table Name (e.g. Port Authorities)</Label>
                <Input value={newEntityData.title} onChange={e => setNewEntityData({...newEntityData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Fields (comma separated, e.g. name, country, port_code)</Label>
                <Input value={newEntityData.fields} onChange={e => setNewEntityData({...newEntityData, fields: e.target.value})} required />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowNewEntityForm(false)}>Cancel</Button>
                <Button type="submit">Create Table</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Entities Rendered First */}
      {entities && entities.length > 0 && (
        <div className="space-y-6 lg:col-span-3">
          <div className="px-1 border-b border-border pb-3 mb-4">
            <h3 className="text-base font-black uppercase tracking-tight text-primary">Custom Enterprise Tables</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {entities.map(entity => (
              <DynamicEntityCard key={entity.id} entity={entity} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Company & Vessel Data */}
        <div className="space-y-6 lg:col-span-3">
          <div className="px-1 border-b border-border pb-3 mb-4">
            <h3 className="text-base font-black uppercase tracking-tight">Company Master Data</h3>
          </div>
          <div className="space-y-6">
            {renderDataTable('companies')}
          </div>
        </div>

        {/* Crew Data */}
        <div className="space-y-6">
          <div className="px-1 border-b border-border pb-3 mb-4">
            <h3 className="text-base font-black uppercase tracking-tight">Crew Data</h3>
          </div>
          <div className="space-y-6">
            {renderDataTable('crewRanks')}
            {renderDataTable('nationalities')}
            {renderDataTable('contractTypes')}
            {renderDataTable('currencies')}
          </div>
        </div>

        {/* Audit & Findings Data */}
        <div className="space-y-6">
          <div className="px-1 border-b border-border pb-3 mb-4">
            <h3 className="text-base font-black uppercase tracking-tight">Audit & Findings Data</h3>
          </div>
          <div className="space-y-6">
            {renderDataTable('auditTypes')}
            {renderDataTable('findingTypes')}
            {renderDataTable('findingStatuses')}
            {renderDataTable('rootCauses')}
          </div>
        </div>

        {/* Classification & Risk Data */}
        <div className="space-y-6">
          <div className="px-1 border-b border-border pb-3 mb-4">
            <h3 className="text-base font-black uppercase tracking-tight">Classification & Risk</h3>
          </div>
          <div className="space-y-6">
            {renderDataTable('classificationSocieties')}
            {renderDataTable('flagStates')}
          </div>
        </div>

        {/* Certificate Types */}
        <div className="space-y-6 lg:col-span-2">
          <div className="px-1 border-b border-border pb-3 mb-4">
            <h3 className="text-base font-black uppercase tracking-tight">Certification Types</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderDataTable('statutoryCertificates')}
            {renderDataTable('crewCertificates')}
          </div>
        </div>

        {/* Operations, Incidents & Claims */}
        <div className="space-y-6 lg:col-span-3">
          <div className="px-1 border-b border-border pb-3 mb-4">
            <h3 className="text-base font-black uppercase tracking-tight">Operations, Incidents & Insurance Claims Master Data</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {renderDataTable('incidentTypes')}
            {renderDataTable('projectTypes')}
            {renderDataTable('claimTypes')}
          </div>
        </div>

        {/* Regulatory Manager */}
        <div className="space-y-6 lg:col-span-3">
          <div className="px-1 border-b border-border pb-3 mb-4">
            <h3 className="text-base font-black uppercase tracking-tight">Regulatory Intelligence Layer</h3>
          </div>
          <RegulatoryManager />
        </div>
      </div>

      {importConfig && (
        <CsvUploader 
          title={importConfig.config.title}
          expectedHeaders={importConfig.config.dbFields}
          onImport={handleImport}
          onCancel={() => setImportConfig(null)}
        />
      )}

      {renderAddForm()}
    </div>
  );
};

export default SetupPage;