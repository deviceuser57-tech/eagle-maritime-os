import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMaintenanceTasks, MaintenanceTask } from '@/hooks/useMaintenanceTasks';
import { useVessels } from '@/hooks/useVessels';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrencies } from '@/hooks/useSetupCrewConfig';
import {
  useSetupMaintenanceTaskTypes,
  useSetupEquipmentCategories,
  useSetupVesselLocations,
} from '@/hooks/useSetupVesselMasterData';
import { format } from 'date-fns';
import {
  Wrench, AlertTriangle, CheckCircle, Clock, Plus, CalendarIcon,
  Trash2, Edit, Filter, LayoutGrid, List
} from 'lucide-react';
import { cn } from '@/lib/utils';


const Maintenance = () => {
  const { user } = useAuth();
  const { tasks, loading, addTask, updateTask, deleteTask } = useMaintenanceTasks();
  const { vessels } = useVessels();
  const { currencies } = useCurrencies();
  const currencyOptions = currencies.length > 0
    ? currencies.map(c => c.currency_code)
    : ['USD', 'EUR', 'GBP', 'AED', 'JPY'];

  // ── Dynamic master data (replaces hardcoded arrays) ───────────────
  const { taskTypes: dbTaskTypes }           = useSetupMaintenanceTaskTypes();
  const { equipmentCategories: dbEquipCats } = useSetupEquipmentCategories();
  const { vesselLocations: dbLocations }     = useSetupVesselLocations();

  // Fallback defaults if org hasn't seeded data yet
  const TASK_TYPES: { value: string; label: string }[] = dbTaskTypes.length > 0
    ? dbTaskTypes.map(t => ({ value: t.value, label: t.label }))
    : [
        { value: 'preventive',       label: 'Preventive Maintenance (PMS)' },
        { value: 'corrective',       label: 'Corrective Maintenance' },
        { value: 'condition_based',  label: 'Condition-Based Maintenance' },
        { value: 'inspection',       label: 'Inspection / Survey' },
        { value: 'drydock',          label: 'Drydock / Overhaul' },
        { value: 'emergency',        label: 'Emergency Repair' },
        { value: 'class_survey',     label: 'Class Survey' },
        { value: 'regulatory',       label: 'Regulatory Compliance' },
      ];

  const EQUIPMENT_CATEGORIES: string[] = dbEquipCats.length > 0
    ? dbEquipCats.map(c => c.name)
    : [
        'Main Engine', 'Auxiliary Engine', 'Electrical Systems', 'Navigation Equipment',
        'Safety Equipment', 'Hull & Structure', 'Deck Machinery', 'HVAC System',
        'Fuel System', 'Ballast System', 'Steering Gear', 'Communication Equipment',
        'Cargo Equipment', 'Piping & Valves', 'Propulsion System', 'Other',
      ];

  const LOCATIONS: { value: string; label: string }[] = dbLocations.length > 0
    ? dbLocations.map(l => ({ value: l.value, label: l.label_ar ? `${l.label_en} (${l.label_ar})` : l.label_en }))
    : [
        { value: 'engine',        label: 'Engine Room (غرفة الماكينات)' },
        { value: 'accommodation', label: 'Accommodation (الاعاشات)' },
        { value: 'deck',          label: 'Main Deck (دك الوحدة)' },
        { value: 'hull',          label: 'Hull / Exterior (البدن / الخارجي)' },
        { value: 'bridge',        label: 'Bridge / Nav Center (البريدج / Nav Center)' },
      ];

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [formData, setFormData] = useState({
    title: '', description: '', vessel_id: '', task_type: 'preventive',
    priority: 'medium', status: 'scheduled', due_date: new Date(),
    assigned_to: '', estimated_hours: '', cost_estimate: '', currency: 'USD', notes: '',
    location: 'engine',
  });

  const getTaskLocationAndNotes = (task: MaintenanceTask) => {
    try {
      if (task.notes && task.notes.trim().startsWith('{')) {
        const parsed = JSON.parse(task.notes);
        return {
          location: parsed.location || 'engine',
          notes: parsed.userNotes || ''
        };
      }
    } catch (e) {
      // Ignore
    }
    return {
      location: 'engine',
      notes: task.notes || ''
    };
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', vessel_id: '', task_type: 'preventive',
      priority: 'medium', status: 'scheduled', due_date: new Date(),
      assigned_to: '', estimated_hours: '', cost_estimate: '', currency: 'USD', notes: '',
      location: 'engine',
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.due_date) return;
    
    const notesWithLocation = JSON.stringify({
      location: formData.location,
      userNotes: formData.notes
    });

    const taskData = {
      title: formData.title,
      description: formData.description,
      vessel_id: formData.vessel_id || null,
      task_type: formData.task_type,
      priority: formData.priority,
      status: formData.status,
      due_date: format(formData.due_date, 'yyyy-MM-dd'),
      assigned_to: formData.assigned_to || null,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      cost_estimate: formData.cost_estimate ? parseFloat(formData.cost_estimate) : null,
      notes: notesWithLocation,
      completed_date: null, actual_hours: null, actual_cost: null,
    };

    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } else {
      await addTask(taskData);
    }
    resetForm();
    setIsAddOpen(false);
  };

  const handleEdit = (task: MaintenanceTask) => {
    setEditingTask(task);
    const locNotes = getTaskLocationAndNotes(task);
    setFormData({
      title: task.title, description: task.description || '', vessel_id: task.vessel_id || '',
      task_type: task.task_type, priority: task.priority, status: task.status,
      due_date: new Date(task.due_date), assigned_to: task.assigned_to || '',
      estimated_hours: task.estimated_hours?.toString() || '',
      cost_estimate: task.cost_estimate?.toString() || '',
      currency: 'USD',
      notes: locNotes.notes,
      location: locNotes.location,
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) await deleteTask(id);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const updates: Partial<MaintenanceTask> = { status: newStatus };
    if (newStatus === 'completed') updates.completed_date = format(new Date(), 'yyyy-MM-dd');
    await updateTask(taskId, updates);
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  const stats = {
    open: tasks.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.status !== 'completed' && new Date(t.due_date) < new Date()).length,
    completed: tasks.filter(t => t.status === 'completed').length,
    dueThisWeek: tasks.filter(t => {
      const d = new Date(t.due_date); const now = new Date();
      return t.status !== 'completed' && d >= now && d <= new Date(now.getTime() + 7 * 86400000);
    }).length,
  };

  const getPriorityColor = (p: string) => {
    switch (p) { case 'critical': return 'destructive'; case 'high': return 'secondary'; default: return 'outline'; }
  };

  const getStatusColor = (s: string, d: string) => {
    if (s === 'completed') return 'default';
    if (new Date(d) < new Date()) return 'destructive';
    if (s === 'in_progress') return 'secondary';
    return 'outline';
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">🛠️ Maintenance</h2>
        <Card className="maritime-card"><CardContent className="py-12 text-center">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Please log in to manage maintenance tasks.</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">🛠️ Maintenance Planner</h2>
          <p className="text-muted-foreground">Plan preventive, corrective, and condition-based maintenance across your fleet.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) { setEditingTask(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button className="btn-maritime"><Plus className="h-4 w-4 mr-2" />Add Task</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingTask ? 'Edit Maintenance Task' : 'Create Maintenance Task'}</DialogTitle></DialogHeader>
            <Tabs defaultValue="general" className="py-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="scheduling">Scheduling & Cost</TabsTrigger>
                <TabsTrigger value="details">Details & Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Task Title *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Main Engine 1000hr Service" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vessel</Label>
                    <Select value={formData.vessel_id} onValueChange={(v) => setFormData({ ...formData, vessel_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                      <SelectContent>{vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Task Type</Label>
                    <Select value={formData.task_type} onValueChange={(v) => setFormData({ ...formData, task_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{TASK_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
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
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="deferred">Deferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Execution Location (موضع التنفيذ) *</Label>
                    <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map(loc => <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scheduling" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.due_date ? format(formData.due_date, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={formData.due_date} onSelect={(d) => d && setFormData({ ...formData, due_date: d })} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <Input value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} placeholder="Technician / Chief Engineer" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Hours</Label>
                    <Input type="number" value={formData.estimated_hours} onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost Estimate</Label>
                    <div className="flex gap-2">
                      <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                        <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{currencyOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="number" value={formData.cost_estimate} onChange={(e) => setFormData({ ...formData, cost_estimate: e.target.value })} placeholder="0.00" className="flex-1" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Detailed work description, scope, and requirements..." />
                </div>
                <div className="space-y-2">
                  <Label>Notes / Special Instructions</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} placeholder="Safety precautions, spare parts needed, reference manuals..." />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmit} className="btn-maritime flex-1">{editingTask ? 'Update Task' : 'Create Task'}</Button>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Open Tasks</p><p className="text-2xl font-bold">{stats.open}</p></div><Wrench className="h-8 w-8 text-primary" /></div></CardContent></Card>
        <Card className="maritime-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Overdue</p><p className="text-2xl font-bold text-destructive">{stats.overdue}</p></div><AlertTriangle className="h-8 w-8 text-destructive" /></div></CardContent></Card>
        <Card className="maritime-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold text-green-500">{stats.completed}</p></div><CheckCircle className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        <Card className="maritime-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Due This Week</p><p className="text-2xl font-bold text-orange-500">{stats.dueThisWeek}</p></div><Clock className="h-8 w-8 text-orange-500" /></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card className="maritime-card">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="deferred">Deferred</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex gap-1">
              <Button size="icon" variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
              <Button size="icon" variant={viewMode === 'grid' ? 'default' : 'outline'} onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card className="maritime-card">
        <CardHeader><CardTitle>Maintenance Tasks ({filteredTasks.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No maintenance tasks found. Create your first task to get started.</div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={getPriorityColor(task.priority) as any}>{task.priority}</Badge>
                      <Badge variant={getStatusColor(task.status, task.due_date) as any}>{task.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.vessels?.name || 'No vessel'} • {TASK_TYPES.find(t => t.value === task.task_type)?.label || task.task_type}
                      {` • ${LOCATIONS.find(l => l.value === getTaskLocationAndNotes(task).location)?.label.split(' (')[0] || 'Engine Room'}`}
                    </p>
                    <p className="text-xs text-muted-foreground">Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</p>
                    <div className="flex gap-1 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(task)}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{task.title}</p>
                      <Badge variant={getPriorityColor(task.priority) as any}>{task.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.vessels?.name || 'No vessel'} • {TASK_TYPES.find(t => t.value === task.task_type)?.label || task.task_type}
                      {` • ${LOCATIONS.find(l => l.value === getTaskLocationAndNotes(task).location)?.label.split(' (')[0] || 'Engine Room'}`}
                      {task.assigned_to && ` • ${task.assigned_to}`}
                    </p>
                    {task.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</p>
                      {task.estimated_hours && <p className="text-xs text-muted-foreground">{task.estimated_hours}h estimated</p>}
                      {task.cost_estimate && <p className="text-xs text-muted-foreground">${Number(task.cost_estimate).toLocaleString()}</p>}
                    </div>
                    <Select value={task.status} onValueChange={(v) => handleStatusChange(task.id, v)}>
                      <SelectTrigger className="w-[130px]">
                        <Badge variant={getStatusColor(task.status, task.due_date) as any}>{task.status.replace('_', ' ')}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="deferred">Deferred</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(task)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;
