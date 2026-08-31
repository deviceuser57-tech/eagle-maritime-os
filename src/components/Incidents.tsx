import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Activity, TrendingDown, FileText, Plus, Loader2, Trash2 } from 'lucide-react';
import { useIncidents } from '@/hooks/useIncidents';
import { useSetupIncidentTypes } from '@/hooks/useSetupIncidentTypes';
import { useVessels } from '@/hooks/useVessels';
import { useRootCauses } from '@/hooks/useSetupAuditConfig';
import { format } from 'date-fns';

const Incidents = () => {
  const { incidents, isLoading, createIncident, deleteIncident } = useIncidents();
  const { vessels } = useVessels();
  const { rootCauses } = useRootCauses();
  const { incidentTypes } = useSetupIncidentTypes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    incident_type: '',
    severity: 'minor',
    vessel_id: '',
    incident_date: '',
    location: '',
    description: '',
    reported_by: '',
    root_cause: '',
    risk_category: 'Operational',
    witnesses: '',
    immediate_action: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createIncident.mutateAsync({
      title: formData.title,
      incident_type: formData.incident_type,
      severity: formData.severity,
      vessel_id: formData.vessel_id || null,
      incident_date: formData.incident_date || new Date().toISOString(),
      location: formData.location,
      description: formData.description,
      reported_by: formData.reported_by,
      root_cause: formData.root_cause,
      corrective_actions: JSON.stringify({
        risk_category: formData.risk_category,
        witnesses: formData.witnesses,
        immediate_action: formData.immediate_action
      })
    });
    setFormData({
      title: '',
      incident_type: '',
      severity: 'minor',
      vessel_id: '',
      incident_date: '',
      location: '',
      description: '',
      reported_by: '',
      root_cause: '',
      risk_category: 'Operational',
      witnesses: '',
      immediate_action: '',
    });
    setIsDialogOpen(false);
  };

  const openCases = incidents.filter(i => i.investigation_status !== 'closed').length;
  const thisMonth = incidents.filter(i => {
    const incidentDate = new Date(i.incident_date);
    const now = new Date();
    return incidentDate.getMonth() === now.getMonth() && incidentDate.getFullYear() === now.getFullYear();
  }).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'major': return 'destructive';
      case 'minor': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">🚨 Incident Management</h2>
          <p className="text-muted-foreground">
            Report, investigate, and track incidents with comprehensive documentation and analysis.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report New Incident</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="title">Incident Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Brief description of the incident"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incident_type">Incident Type *</Label>
                  <Select value={formData.incident_type} onValueChange={(v) => setFormData({ ...formData, incident_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                    {incidentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity *</Label>
                  <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
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
                  <Label htmlFor="incident_date">Date & Time *</Label>
                  <Input
                    id="incident_date"
                    type="datetime-local"
                    value={formData.incident_date}
                    onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Where did it occur?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reported_by">Reported By</Label>
                  <Input
                    id="reported_by"
                    value={formData.reported_by}
                    onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Situation Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Full account of the occurrence as per SOLAS/ISM requirements..."
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risk_category">Risk Category (HSQE)</Label>
                  <Select value={formData.risk_category} onValueChange={(v) => setFormData({ ...formData, risk_category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operational">Operational</SelectItem>
                      <SelectItem value="Environmental">Environmental</SelectItem>
                      <SelectItem value="Safety">Technical/Safety</SelectItem>
                      <SelectItem value="Security">Security/ISPS</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="witnesses">Witnesses / Crew Involved</Label>
                  <Input
                    id="witnesses"
                    value={formData.witnesses}
                    onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="immediate_action">Immediate Action Taken (Containment)</Label>
                  <Textarea
                    id="immediate_action"
                    value={formData.immediate_action}
                    onChange={(e) => setFormData({ ...formData, immediate_action: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="root_cause">Preliminary Root Cause Analysis (RCA)</Label>
                  {rootCauses.length > 0 ? (
                    <Select value={formData.root_cause} onValueChange={(v) => setFormData({ ...formData, root_cause: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select root cause" />
                      </SelectTrigger>
                      <SelectContent>
                        {rootCauses.map((cause) => (
                          <SelectItem key={cause.id} value={cause.cause_name}>{cause.cause_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="root_cause"
                      value={formData.root_cause}
                      onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                      placeholder="Initial root cause assessment..."
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createIncident.isPending}>
                  {createIncident.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Report Incident
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
                <p className="text-sm text-muted-foreground">Total Incidents</p>
                <p className="text-2xl font-bold">{incidents.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Cases</p>
                <p className="text-2xl font-bold text-orange-500">{openCases}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{thisMonth}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">
                  {incidents.filter(i => i.severity === 'critical').length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No incidents reported yet.</p>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{incident.title}</p>
                      <Badge variant={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {incident.vessels?.name || 'No vessel'} - {incident.incident_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant={incident.investigation_status === 'closed' ? 'secondary' : 'default'}>
                        {incident.investigation_status || 'pending'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(incident.incident_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteIncident.mutate(incident.id)}
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
    </div>
  );
};

export default Incidents;
