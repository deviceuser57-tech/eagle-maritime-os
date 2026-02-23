import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import { useSetupCompanies, SetupCompany } from '@/hooks/useSetupCompanies';
import { useCrewRanks, useNationalities, useContractTypes, useCurrencies } from '@/hooks/useSetupCrewConfig';
import { useAuditTypes, useFindingTypes, useFindingStatuses, useRootCauses } from '@/hooks/useSetupAuditConfig';
import { useClassificationSocieties, useFlagStates } from '@/hooks/useSetupClassification';
import { useCertificateTypes } from '@/hooks/useSetupCertificates';
import RegulatoryManager from '@/components/RegulatoryManager';

interface SetupCardConfig {
  type: string;
  title: string;
  headers: string[];
  labels: string[];
  dbFields: string[];
}

const SetupPage = () => {
  const [editingItem, setEditingItem] = useState<{ type: string; id: string; data: any; } | null>(null);
  const [showAddForm, setShowAddForm] = useState<{ type: string; config: SetupCardConfig; } | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Company hooks
  const ownerCompanies = useSetupCompanies('owner');
  const operatorCompanies = useSetupCompanies('operator');
  const technicalManagers = useSetupCompanies('technical');
  const ismManagers = useSetupCompanies('ism');
  const docIssuers = useSetupCompanies('doc');

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

  const setupConfigs: Record<string, SetupCardConfig & { data: any[]; isLoading: boolean; add: any; update: any; delete: any; }> = {
    ownerCompanies: {
      type: 'ownerCompanies',
      title: 'Owner Company',
      headers: ['name', 'contact_person', 'phone', 'email'],
      labels: ['Company Name', 'Contact Person', 'Phone', 'Email'],
      dbFields: ['name', 'contact_person', 'phone', 'email'],
      data: ownerCompanies.companies,
      isLoading: ownerCompanies.isLoading,
      add: (data: any) => ownerCompanies.addCompany.mutate({ ...data, company_type: 'owner' as const }),
      update: (data: any) => ownerCompanies.updateCompany.mutate(data),
      delete: (id: string) => ownerCompanies.deleteCompany.mutate(id)
    },
    operatorCompanies: {
      type: 'operatorCompanies',
      title: 'Operator Company',
      headers: ['name', 'contact_person', 'phone', 'email'],
      labels: ['Company Name', 'Contact Person', 'Phone', 'Email'],
      dbFields: ['name', 'contact_person', 'phone', 'email'],
      data: operatorCompanies.companies,
      isLoading: operatorCompanies.isLoading,
      add: (data: any) => operatorCompanies.addCompany.mutate({ ...data, company_type: 'operator' as const }),
      update: (data: any) => operatorCompanies.updateCompany.mutate(data),
      delete: (id: string) => operatorCompanies.deleteCompany.mutate(id)
    },
    technicalManagers: {
      type: 'technicalManagers',
      title: 'Technical Manager',
      headers: ['name', 'contact_person', 'phone', 'email'],
      labels: ['Manager Name', 'Contact Person', 'Phone', 'Email'],
      dbFields: ['name', 'contact_person', 'phone', 'email'],
      data: technicalManagers.companies,
      isLoading: technicalManagers.isLoading,
      add: (data: any) => technicalManagers.addCompany.mutate({ ...data, company_type: 'technical' as const }),
      update: (data: any) => technicalManagers.updateCompany.mutate(data),
      delete: (id: string) => technicalManagers.deleteCompany.mutate(id)
    },
    ismManagers: {
      type: 'ismManagers',
      title: 'ISM Manager',
      headers: ['name', 'contact_person', 'phone', 'email'],
      labels: ['Manager Name', 'Contact Person', 'Phone', 'Email'],
      dbFields: ['name', 'contact_person', 'phone', 'email'],
      data: ismManagers.companies,
      isLoading: ismManagers.isLoading,
      add: (data: any) => ismManagers.addCompany.mutate({ ...data, company_type: 'ism' as const }),
      update: (data: any) => ismManagers.updateCompany.mutate(data),
      delete: (id: string) => ismManagers.deleteCompany.mutate(id)
    },
    docIssuers: {
      type: 'docIssuers',
      title: 'DOC Issuer',
      headers: ['name', 'contact_person', 'phone', 'email'],
      labels: ['Issuer Name', 'Contact Person', 'Phone', 'Email'],
      dbFields: ['name', 'contact_person', 'phone', 'email'],
      data: docIssuers.companies,
      isLoading: docIssuers.isLoading,
      add: (data: any) => docIssuers.addCompany.mutate({ ...data, company_type: 'doc' as const }),
      update: (data: any) => docIssuers.updateCompany.mutate(data),
      delete: (id: string) => docIssuers.deleteCompany.mutate(id)
    },
    crewRanks: {
      type: 'crewRanks',
      title: 'Crew Rank',
      headers: ['rank_name', 'department'],
      labels: ['Rank Name', 'Department'],
      dbFields: ['rank_name', 'department'],
      data: crewRanks.ranks,
      isLoading: crewRanks.isLoading,
      add: (data: any) => crewRanks.addRank.mutate(data),
      update: (data: any) => crewRanks.updateRank.mutate(data),
      delete: (id: string) => crewRanks.deleteRank.mutate(id)
    },
    nationalities: {
      type: 'nationalities',
      title: 'Nationality',
      headers: ['country_name', 'country_code'],
      labels: ['Country Name', 'Code'],
      dbFields: ['country_name', 'country_code'],
      data: nationalities.nationalities,
      isLoading: nationalities.isLoading,
      add: (data: any) => nationalities.addNationality.mutate(data),
      update: (data: any) => nationalities.updateNationality.mutate(data),
      delete: (id: string) => nationalities.deleteNationality.mutate(id)
    },
    contractTypes: {
      type: 'contractTypes',
      title: 'Contract Type',
      headers: ['contract_name', 'duration_months'],
      labels: ['Contract Type', 'Duration (months)'],
      dbFields: ['contract_name', 'duration_months'],
      data: contractTypes.contractTypes,
      isLoading: contractTypes.isLoading,
      add: (data: any) => contractTypes.addContractType.mutate(data),
      update: (data: any) => contractTypes.updateContractType.mutate(data),
      delete: (id: string) => contractTypes.deleteContractType.mutate(id)
    },
    currencies: {
      type: 'currencies',
      title: 'Currency',
      headers: ['currency_code', 'currency_name', 'symbol'],
      labels: ['Code', 'Currency Name', 'Symbol'],
      dbFields: ['currency_code', 'currency_name', 'symbol'],
      data: currencies.currencies,
      isLoading: currencies.isLoading,
      add: (data: any) => currencies.addCurrency.mutate(data),
      update: (data: any) => currencies.updateCurrency.mutate(data),
      delete: (id: string) => currencies.deleteCurrency.mutate(id)
    },
    auditTypes: {
      type: 'auditTypes',
      title: 'Audit Type',
      headers: ['audit_type_name', 'description', 'frequency_months'],
      labels: ['Audit Type', 'Description', 'Frequency (months)'],
      dbFields: ['audit_type_name', 'description', 'frequency_months'],
      data: auditTypes.auditTypes,
      isLoading: auditTypes.isLoading,
      add: (data: any) => auditTypes.addAuditType.mutate(data),
      update: (data: any) => auditTypes.updateAuditType.mutate(data),
      delete: (id: string) => auditTypes.deleteAuditType.mutate(id)
    },
    findingTypes: {
      type: 'findingTypes',
      title: 'Finding Type',
      headers: ['finding_type_name', 'severity', 'description'],
      labels: ['Type Name', 'Severity', 'Description'],
      dbFields: ['finding_type_name', 'severity', 'description'],
      data: findingTypes.findingTypes,
      isLoading: findingTypes.isLoading,
      add: (data: any) => findingTypes.addFindingType.mutate(data),
      update: (data: any) => findingTypes.updateFindingType.mutate(data),
      delete: (id: string) => findingTypes.deleteFindingType.mutate(id)
    },
    findingStatuses: {
      type: 'findingStatuses',
      title: 'Finding Status',
      headers: ['status_name', 'status_order', 'color'],
      labels: ['Status Name', 'Order', 'Color'],
      dbFields: ['status_name', 'status_order', 'color'],
      data: findingStatuses.findingStatuses,
      isLoading: findingStatuses.isLoading,
      add: (data: any) => findingStatuses.addFindingStatus.mutate(data),
      update: (data: any) => findingStatuses.updateFindingStatus.mutate(data),
      delete: (id: string) => findingStatuses.deleteFindingStatus.mutate(id)
    },
    rootCauses: {
      type: 'rootCauses',
      title: 'Root Cause',
      headers: ['cause_name', 'category', 'description'],
      labels: ['Cause Name', 'Category', 'Description'],
      dbFields: ['cause_name', 'category', 'description'],
      data: rootCauses.rootCauses,
      isLoading: rootCauses.isLoading,
      add: (data: any) => rootCauses.addRootCause.mutate(data),
      update: (data: any) => rootCauses.updateRootCause.mutate(data),
      delete: (id: string) => rootCauses.deleteRootCause.mutate(id)
    },
    classificationSocieties: {
      type: 'classificationSocieties',
      title: 'Classification Society',
      headers: ['society_name', 'abbreviation', 'website'],
      labels: ['Society Name', 'Abbreviation', 'Website'],
      dbFields: ['society_name', 'abbreviation', 'website'],
      data: classificationSocieties.societies,
      isLoading: classificationSocieties.isLoading,
      add: (data: any) => classificationSocieties.addSociety.mutate(data),
      update: (data: any) => classificationSocieties.updateSociety.mutate(data),
      delete: (id: string) => classificationSocieties.deleteSociety.mutate(id)
    },
    flagStates: {
      type: 'flagStates',
      title: 'Flag State',
      headers: ['flag_name', 'flag_code', 'risk_level'],
      labels: ['Flag State', 'Code', 'Risk Level'],
      dbFields: ['flag_name', 'flag_code', 'risk_level'],
      data: flagStates.flagStates,
      isLoading: flagStates.isLoading,
      add: (data: any) => flagStates.addFlagState.mutate(data),
      update: (data: any) => flagStates.updateFlagState.mutate(data),
      delete: (id: string) => flagStates.deleteFlagState.mutate(id)
    },
    statutoryCertificates: {
      type: 'statutoryCertificates',
      title: 'Statutory Certificate',
      headers: ['certificate_name', 'issuing_authority', 'validity_months'],
      labels: ['Certificate Name', 'Issuing Authority', 'Validity (months)'],
      dbFields: ['certificate_name', 'issuing_authority', 'validity_months'],
      data: statutoryCerts.certificateTypes,
      isLoading: statutoryCerts.isLoading,
      add: (data: any) => statutoryCerts.addCertificateType.mutate({ ...data, certificate_category: 'statutory' as const }),
      update: (data: any) => statutoryCerts.updateCertificateType.mutate(data),
      delete: (id: string) => statutoryCerts.deleteCertificateType.mutate(id)
    },
    crewCertificates: {
      type: 'crewCertificates',
      title: 'Crew Certificate',
      headers: ['certificate_name', 'issuing_authority', 'validity_months'],
      labels: ['Certificate Name', 'Issuing Authority', 'Validity (months)'],
      dbFields: ['certificate_name', 'issuing_authority', 'validity_months'],
      data: crewCerts.certificateTypes,
      isLoading: crewCerts.isLoading,
      add: (data: any) => crewCerts.addCertificateType.mutate({ ...data, certificate_category: 'crew' as const }),
      update: (data: any) => crewCerts.updateCertificateType.mutate(data),
      delete: (id: string) => crewCerts.deleteCertificateType.mutate(id)
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
          <Button
            size="sm"
            onClick={() => setShowAddForm({ type: configKey, config })}
            className="btn-maritime px-4 h-9 rounded-lg text-[10px]"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Initialize
          </Button>
        </div>

        <div className="p-4">
          {config.isLoading ?
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-xs font-black text-muted-foreground uppercase tracking-tighter">Accessing Database...</p>
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
                          <td key={fieldIndex} className="py-4 px-4 text-sm font-medium text-foreground first:rounded-l-2xl last:rounded-r-2xl">
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
      setFormData({});
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

  // Calculate totals for summary
  const totalItems = Object.values(setupConfigs).reduce((sum, config) => sum + (config.data?.length || 0), 0);

  return (
    <div className="space-y-10 py-6">
      <div className="text-center pb-8 border-b border-border">
        <h2 className="text-3xl font-black tracking-tighter text-foreground mb-3 uppercase">
          Platform Setup
        </h2>
        <p className="text-base text-muted-foreground font-medium max-w-3xl mx-auto px-4">
          Configure the core data models, categories, and parameters that power the compliance management system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Company & Vessel Data */}
        <div className="space-y-6">
          <div className="px-1 border-b border-border pb-3 mb-4">
            <h3 className="text-base font-black uppercase tracking-tight">Company & Vessel Data</h3>
          </div>
          <div className="space-y-6">
            {renderDataTable('ownerCompanies')}
            {renderDataTable('operatorCompanies')}
            {renderDataTable('technicalManagers')}
            {renderDataTable('ismManagers')}
            {renderDataTable('docIssuers')}
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

        {/* Regulatory Manager */}
        <div className="space-y-6 lg:col-span-3">
          <div className="px-1 border-b border-border pb-3 mb-4">
            <h3 className="text-base font-black uppercase tracking-tight">Regulatory Intelligence Layer</h3>
          </div>
          <RegulatoryManager />
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="maritime-card p-6">
        <h3 className="text-xl font-semibold mb-4">Configuration Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(setupConfigs).map(([key, config]) => {
            const count = config.data?.length || 0;
            return (
              <div key={key} className="text-center">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-sm text-muted-foreground">{config.title}s</div>
              </div>);

          })}
        </div>
        <div className="mt-4 pt-4 border-t border-border text-center">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Total Configuration Items: {totalItems}
          </Badge>
        </div>
      </div>

      {renderAddForm()}
    </div>);

};

export default SetupPage;