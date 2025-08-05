import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit } from 'lucide-react';

interface SetupData {
  [key: string]: any[];
}

const SetupPage = () => {
  const [setupData, setSetupData] = useState<SetupData>({
    ownerCompanies: [
      { id: 1, name: 'Eagle Maritime Ltd', contactPerson: 'John Smith', title: 'Fleet Manager', phone: '+1-555-0123', email: 'j.smith@eagle.com', address: '123 Harbor Drive', remarks: 'Primary owner' }
    ],
    auditTypes: [
      { id: 1, name: 'ISM Audit' },
      { id: 2, name: 'PSC Inspection' },
      { id: 3, name: 'Class Survey' }
    ],
    findingTypes: [
      { id: 1, name: 'Major Non-Conformity', weight: 100 },
      { id: 2, name: 'Minor Non-Conformity', weight: 50 },
      { id: 3, name: 'Observation', weight: 10 }
    ],
    flagStates: [
      { id: 1, name: 'Marshall Islands', score: 8 },
      { id: 2, name: 'Liberia', score: 7 },
      { id: 3, name: 'Panama', score: 6 }
    ]
  });

  const [editingItem, setEditingItem] = useState<{ type: string; item: any } | null>(null);

  const setupCategories = [
    {
      title: "Company & Vessel Data",
      items: [
        { type: 'ownerCompanies', title: 'Owner Companies', fields: ['name', 'contactPerson', 'title', 'phone', 'email', 'address', 'remarks'] },
        { type: 'operatorCompanies', title: 'Operator Companies', fields: ['name', 'contactPerson', 'title', 'phone', 'email', 'address', 'remarks'] }
      ]
    },
    {
      title: "Audit & Findings Data",
      items: [
        { type: 'auditTypes', title: 'Audit Types', fields: ['name'] },
        { type: 'findingTypes', title: 'Finding Types', fields: ['name', 'weight'] },
        { type: 'findingStatuses', title: 'Finding Statuses', fields: ['name'] }
      ]
    },
    {
      title: "Risk Management",
      items: [
        { type: 'flagStates', title: 'Flag States', fields: ['name', 'score'] },
        { type: 'riskCategories', title: 'Risk Categories', fields: ['name', 'range'] }
      ]
    }
  ];

  const addItem = (type: string, fields: string[]) => {
    const newItem: any = { id: Date.now() };
    fields.forEach(field => {
      newItem[field] = '';
    });
    setEditingItem({ type, item: newItem });
  };

  const saveItem = (type: string, item: any) => {
    setSetupData(prev => ({
      ...prev,
      [type]: prev[type] ? [...prev[type].filter(i => i.id !== item.id), item] : [item]
    }));
    setEditingItem(null);
  };

  const deleteItem = (type: string, id: number) => {
    setSetupData(prev => ({
      ...prev,
      [type]: prev[type]?.filter(item => item.id !== id) || []
    }));
  };

  const EditModal = () => {
    if (!editingItem) return null;

    const { type, item } = editingItem;
    const category = setupCategories.find(cat => 
      cat.items.some(i => i.type === type)
    );
    const itemConfig = category?.items.find(i => i.type === type);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-lg mx-4">
          <CardHeader>
            <CardTitle>{item.id ? 'Edit' : 'Add'} {itemConfig?.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {itemConfig?.fields.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1 capitalize">
                  {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <Input
                  value={item[field] || ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    item: { ...item, [field]: e.target.value }
                  })}
                  placeholder={`Enter ${field}`}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Button onClick={() => saveItem(type, item)}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">🛠️ Platform Setup</h2>
        <p className="text-muted-foreground">
          Configure the core data models, categories, and parameters that power the compliance management system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {setupCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="maritime-card">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {category.items.map((item) => {
                const data = setupData[item.type] || [];
                return (
                  <div key={item.type} className="border rounded-lg">
                    <div className="flex justify-between items-center p-3 border-b bg-muted/50">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addItem(item.type, item.fields)}
                        className="h-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {data.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                          No items configured
                        </div>
                      ) : (
                        <div className="space-y-2 p-2">
                          {data.map((dataItem) => (
                            <div key={dataItem.id} className="flex items-center justify-between p-2 bg-background rounded border">
                              <span className="text-sm font-medium">{dataItem.name}</span>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingItem({ type: item.type, item: dataItem })}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteItem(item.type, dataItem.id)}
                                  className="h-6 w-6 p-0 text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <EditModal />
    </div>
  );
};

export default SetupPage;