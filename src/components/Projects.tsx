import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder, TrendingUp, Users, Clock, Plus, Loader2, Trash2, Ship, X, Calendar } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useVessels } from '@/hooks/useVessels';
import { useProjectVessels } from '@/hooks/useProjectVessels';
import { useAudits } from '@/hooks/useAudits';
import { useCurrencies } from '@/hooks/useSetupCrewConfig';
import { useSetupProjectTypes } from '@/hooks/useSetupProjectTypes';
import { useAuditTypes } from '@/hooks/useSetupAuditConfig';
import { format } from 'date-fns';

const computeStatus = (startDate: string, endDate: string): string => {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (end && end < now) return 'completed';
  if (start && start > now) return 'planning';
  if (start && start <= now && (!end || end >= now)) return 'active';
  return 'planning';
};

const Projects = () => {
  const { projects, loading, addProject, updateProject, deleteProject } = useProjects();
  const { vessels } = useVessels();
  const { projectVessels, addVesselToProject, removeVesselFromProject } = useProjectVessels();
  const { createAudit } = useAudits();
  const { currencies } = useCurrencies();
  const { projectTypes } = useSetupProjectTypes();
  const { auditTypes } = useAuditTypes();
  const currencyOptions = currencies.map(c => c.currency_code);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', project_type: '', start_date: '', end_date: '',
    status: 'planning', progress: '0', priority: 'medium', budget: '', currency: 'USD',
    project_manager: '', location: '', notes: '',
  });

  // Vessel assignment within form
  const [vesselRows, setVesselRows] = useState<{ vessel_id: string; planned_audit_date: string; audit_type: string }[]>([]);

  // Auto-compute status when dates change
  useEffect(() => {
    if (formData.start_date || formData.end_date) {
      const auto = computeStatus(formData.start_date, formData.end_date);
      setFormData(prev => ({ ...prev, status: auto }));
    }
  }, [formData.start_date, formData.end_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addProject({
      name: formData.name,
      description: formData.description || null,
      project_type: formData.project_type || null,
      status: formData.status,
      start_date: formData.start_date || null,
      deadline: formData.end_date || null,
      completed_date: formData.status === 'completed' ? new Date().toISOString().split('T')[0] : null,
      progress: parseInt(formData.progress) || 0,
      vessel_count: vesselRows.length || null,
    });

    if (result?.data) {
      const projectId = result.data.id;
      // Save vessel assignments and create audit entries
      for (const row of vesselRows) {
        if (row.vessel_id) {
          await addVesselToProject.mutateAsync({
            project_id: projectId,
            vessel_id: row.vessel_id,
            planned_audit_date: row.planned_audit_date || undefined,
            audit_type: row.audit_type || 'Internal Audit',
          });
          // Create scheduled audit in Audit Plan
          if (row.planned_audit_date) {
            await createAudit.mutateAsync({
              audit_type: row.audit_type || 'Internal Audit',
              vessel_id: row.vessel_id,
              scheduled_date: row.planned_audit_date,
              status: 'scheduled',
              notes: `Auto-created from project: ${formData.name}`,
              location: formData.location || null,
            });
          }
        }
      }
    }

    setFormData({ name: '', description: '', project_type: '', start_date: '', end_date: '', status: 'planning', progress: '0', priority: 'medium', budget: '', currency: 'USD', project_manager: '', location: '', notes: '' });
    setVesselRows([]);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  };

  const addVesselRow = () => {
    setVesselRows(prev => [...prev, { vessel_id: '', planned_audit_date: '', audit_type: 'Internal Audit' }]);
  };

  const updateVesselRow = (index: number, field: string, value: string) => {
    setVesselRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const removeVesselRow = (index: number) => {
    setVesselRows(prev => prev.filter((_, i) => i !== index));
  };

  const activeCount = projects.filter(p => p.status === 'active' || p.status === 'planning').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0;
  const overdueCount = projects.filter(p =>
    p.status !== 'completed' && p.deadline && new Date(p.deadline) < new Date()
  ).length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground mb-2">Projects</h2>
          <p className="text-muted-foreground">Manage audit projects, assign vessels, and track progress.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Project Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <Select value={formData.project_type} onValueChange={(v) => setFormData({ ...formData, project_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {projectTypes.map(pt => (
                        <SelectItem key={pt.id} value={pt.name}>{pt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status <span className="text-xs text-muted-foreground">(auto-calculated, editable)</span></Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Project Manager</Label>
                  <Input value={formData.project_manager} onChange={(e) => setFormData({ ...formData, project_manager: e.target.value })} placeholder="Manager name" />
                </div>
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <div className="flex gap-2">
                    <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                      <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{currencyOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="0.00" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Port / Region" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
              </div>

              {/* Vessel Assignment Section */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Ship className="h-4 w-4" /> Assign Vessels & Planned Audit Dates
                  </Label>
                  <Button type="button" size="sm" variant="outline" onClick={addVesselRow}>
                    <Plus className="h-3 w-3 mr-1" />Add Vessel
                  </Button>
                </div>
                {vesselRows.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">No vessels assigned yet. Click "Add Vessel" to assign.</p>
                )}
                {vesselRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Vessel</Label>
                      <Select value={row.vessel_id} onValueChange={(v) => updateVesselRow(idx, 'vessel_id', v)}>
                        <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                        <SelectContent>
                          {vessels.map(v => (
                            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Planned Audit Date</Label>
                      <Input type="date" value={row.planned_audit_date} onChange={(e) => updateVesselRow(idx, 'planned_audit_date', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Audit Type</Label>
                      <Select value={row.audit_type} onValueChange={(v) => updateVesselRow(idx, 'audit_type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {auditTypes.map(at => (
                            <SelectItem key={at.id} value={at.audit_type_name}>{at.audit_type_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeVesselRow(idx)}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create Project</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Active Projects</p><p className="text-2xl font-bold">{activeCount}</p></div>
              <Folder className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Avg Completion</p><p className="text-2xl font-bold">{avgProgress}%</p></div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold">{completedCount}</p></div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Overdue</p><p className="text-2xl font-bold text-orange-500">{overdueCount}</p></div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project List */}
      <Card className="maritime-card">
        <CardHeader><CardTitle>Project Overview</CardTitle></CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No projects yet. Create your first project above.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const pvs = projectVessels.filter(pv => pv.project_id === project.id);
                return (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        {project.description && <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={project.status === 'active' ? 'default' : project.status === 'completed' ? 'secondary' : 'outline'}>
                          {project.status}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(project.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{project.project_type || 'No type'}</span>
                      <span>Due: {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : 'No deadline'}</span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                    </div>
                    {/* Assigned vessels */}
                    {pvs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pvs.map(pv => (
                          <Badge key={pv.id} variant="outline" className="flex items-center gap-1 text-xs">
                            <Ship className="h-3 w-3" />
                            {pv.vessels?.name || 'Unknown'}
                            {pv.planned_audit_date && (
                              <span className="ml-1 flex items-center gap-0.5">
                                <Calendar className="h-2.5 w-2.5" />
                                {format(new Date(pv.planned_audit_date), 'MMM dd')}
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateProject(project.id, { progress: Math.min((project.progress || 0) + 10, 100) })}>
                        Update Progress
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
