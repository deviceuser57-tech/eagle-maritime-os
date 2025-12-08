import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useVessels } from '@/hooks/useVessels';
import { useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FileText, 
  Download, 
  Ship, 
  ClipboardCheck, 
  Wrench, 
  AlertTriangle,
  Users,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';

const Reports = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { vessels } = useVessels();
  const { tasks } = useMaintenanceTasks();
  
  const [selectedReportType, setSelectedReportType] = useState('fleet-status');
  const [selectedVessel, setSelectedVessel] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { id: 'fleet-status', name: 'Fleet Status Report', icon: Ship, description: 'Overview of all vessels and their current status' },
    { id: 'audit-compliance', name: 'Audit & Compliance Report', icon: ClipboardCheck, description: 'Audit history, findings, and compliance metrics' },
    { id: 'maintenance', name: 'Maintenance Report', icon: Wrench, description: 'Maintenance tasks, schedules, and completion rates' },
    { id: 'incidents', name: 'Incident Report', icon: AlertTriangle, description: 'Safety incidents and investigation status' },
    { id: 'crew', name: 'Crew Report', icon: Users, description: 'Crew certifications, contracts, and assignments' },
    { id: 'certificate-expiry', name: 'Certificate Expiry Report', icon: Calendar, description: 'Upcoming certificate and document expirations' },
  ];

  const generateFleetStatusPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Fleet Status Report', 14, 25);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    if (includeSummary) {
      doc.setFontSize(16);
      doc.text('Executive Summary', 14, 55);
      doc.setFontSize(11);
      doc.text(`Total Vessels: ${vessels.length}`, 14, 65);
      doc.text(`Active Vessels: ${vessels.filter(v => v.status === 'active').length}`, 14, 72);
      doc.text(`Under Maintenance: ${vessels.filter(v => v.status === 'maintenance').length}`, 14, 79);
    }
    
    if (includeDetails && vessels.length > 0) {
      doc.setFontSize(16);
      doc.text('Vessel Details', 14, 95);
      
      autoTable(doc, {
        startY: 100,
        head: [['Vessel Name', 'IMO Number', 'Type', 'Flag State', 'Status']],
        body: vessels.map(v => [
          v.name,
          v.imo_number || 'N/A',
          v.vessel_type || 'N/A',
          v.flag_state || 'N/A',
          v.status || 'Active'
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 64, 175] }
      });
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
      doc.text('Maritime Compliance System', 14, doc.internal.pageSize.getHeight() - 10);
    }
    
    return doc;
  };

  const generateMaintenancePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Maintenance Report', 14, 25);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35);
    
    doc.setTextColor(0, 0, 0);
    
    const filteredTasks = tasks.filter(t => {
      if (selectedVessel !== 'all' && t.vessel_id !== selectedVessel) return false;
      if (dateFrom && new Date(t.due_date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.due_date) > new Date(dateTo)) return false;
      return true;
    });
    
    if (includeSummary) {
      doc.setFontSize(16);
      doc.text('Summary', 14, 55);
      doc.setFontSize(11);
      doc.text(`Total Tasks: ${filteredTasks.length}`, 14, 65);
      doc.text(`Scheduled: ${filteredTasks.filter(t => t.status === 'scheduled').length}`, 14, 72);
      doc.text(`In Progress: ${filteredTasks.filter(t => t.status === 'in_progress').length}`, 14, 79);
      doc.text(`Completed: ${filteredTasks.filter(t => t.status === 'completed').length}`, 14, 86);
      doc.text(`Overdue: ${filteredTasks.filter(t => t.status === 'overdue').length}`, 14, 93);
    }
    
    if (includeDetails && filteredTasks.length > 0) {
      doc.setFontSize(16);
      doc.text('Task Details', 14, 110);
      
      autoTable(doc, {
        startY: 115,
        head: [['Task', 'Vessel', 'Type', 'Priority', 'Due Date', 'Status']],
        body: filteredTasks.map(t => [
          t.title,
          t.vessels?.name || 'N/A',
          t.task_type,
          t.priority,
          new Date(t.due_date).toLocaleDateString(),
          t.status
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 163, 74] }
      });
    }
    
    return doc;
  };

  const generateAuditPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Fetch audits
    const { data: audits } = await supabase
      .from('audits')
      .select('*, vessels(name)')
      .order('scheduled_date', { ascending: false });
    
    // Header
    doc.setFillColor(147, 51, 234);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Audit & Compliance Report', 14, 25);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35);
    
    doc.setTextColor(0, 0, 0);
    
    if (includeSummary) {
      doc.setFontSize(16);
      doc.text('Summary', 14, 55);
      doc.setFontSize(11);
      doc.text(`Total Audits: ${audits?.length || 0}`, 14, 65);
      doc.text(`Completed: ${audits?.filter(a => a.status === 'completed').length || 0}`, 14, 72);
      doc.text(`Scheduled: ${audits?.filter(a => a.status === 'scheduled').length || 0}`, 14, 79);
    }
    
    if (includeDetails && audits && audits.length > 0) {
      doc.setFontSize(16);
      doc.text('Audit Details', 14, 95);
      
      autoTable(doc, {
        startY: 100,
        head: [['Vessel', 'Type', 'Auditor', 'Date', 'Status', 'Score']],
        body: audits.map(a => [
          (a.vessels as any)?.name || 'N/A',
          a.audit_type,
          a.auditor_name || 'N/A',
          new Date(a.scheduled_date).toLocaleDateString(),
          a.status,
          a.score ? `${a.score}%` : 'N/A'
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [147, 51, 234] }
      });
    }
    
    return doc;
  };

  const generateIncidentsPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    const { data: incidents } = await supabase
      .from('incidents')
      .select('*, vessels(name)')
      .order('incident_date', { ascending: false });
    
    // Header
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Incident Report', 14, 25);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35);
    
    doc.setTextColor(0, 0, 0);
    
    if (includeSummary) {
      doc.setFontSize(16);
      doc.text('Summary', 14, 55);
      doc.setFontSize(11);
      doc.text(`Total Incidents: ${incidents?.length || 0}`, 14, 65);
      doc.text(`Critical: ${incidents?.filter(i => i.severity === 'critical').length || 0}`, 14, 72);
      doc.text(`Major: ${incidents?.filter(i => i.severity === 'major').length || 0}`, 14, 79);
      doc.text(`Minor: ${incidents?.filter(i => i.severity === 'minor').length || 0}`, 14, 86);
    }
    
    if (includeDetails && incidents && incidents.length > 0) {
      doc.setFontSize(16);
      doc.text('Incident Details', 14, 103);
      
      autoTable(doc, {
        startY: 108,
        head: [['Title', 'Vessel', 'Type', 'Severity', 'Date', 'Status']],
        body: incidents.map(i => [
          i.title,
          (i.vessels as any)?.name || 'N/A',
          i.incident_type,
          i.severity,
          new Date(i.incident_date).toLocaleDateString(),
          i.investigation_status
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [220, 38, 38] }
      });
    }
    
    return doc;
  };

  const generateCrewPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    const { data: crew } = await supabase
      .from('crew_members')
      .select('*, vessels(name)')
      .order('last_name', { ascending: true });
    
    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Crew Report', 14, 25);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35);
    
    doc.setTextColor(0, 0, 0);
    
    if (includeSummary) {
      doc.setFontSize(16);
      doc.text('Summary', 14, 55);
      doc.setFontSize(11);
      doc.text(`Total Crew Members: ${crew?.length || 0}`, 14, 65);
      doc.text(`Active: ${crew?.filter(c => c.status === 'active').length || 0}`, 14, 72);
      doc.text(`On Leave: ${crew?.filter(c => c.status === 'on_leave').length || 0}`, 14, 79);
    }
    
    if (includeDetails && crew && crew.length > 0) {
      doc.setFontSize(16);
      doc.text('Crew Details', 14, 95);
      
      autoTable(doc, {
        startY: 100,
        head: [['Name', 'Rank', 'Vessel', 'Nationality', 'Cert. Expiry', 'Status']],
        body: crew.map(c => [
          `${c.first_name} ${c.last_name}`,
          c.rank,
          (c.vessels as any)?.name || 'Unassigned',
          c.nationality || 'N/A',
          c.certificate_expiry ? new Date(c.certificate_expiry).toLocaleDateString() : 'N/A',
          c.status
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });
    }
    
    return doc;
  };

  const generateReport = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'Please log in to generate reports', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    
    try {
      let doc: jsPDF;
      
      switch (selectedReportType) {
        case 'fleet-status':
          doc = generateFleetStatusPDF();
          break;
        case 'maintenance':
          doc = generateMaintenancePDF();
          break;
        case 'audit-compliance':
          doc = await generateAuditPDF();
          break;
        case 'incidents':
          doc = await generateIncidentsPDF();
          break;
        case 'crew':
          doc = await generateCrewPDF();
          break;
        default:
          doc = generateFleetStatusPDF();
      }
      
      // Save report record
      await supabase.from('reports').insert([{
        user_id: user.id,
        report_type: selectedReportType,
        title: reportTypes.find(r => r.id === selectedReportType)?.name || 'Report',
        parameters: { 
          vessel: selectedVessel, 
          dateFrom, 
          dateTo, 
          includeCharts, 
          includeSummary, 
          includeDetails 
        }
      }]);
      
      doc.save(`${selectedReportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({ title: 'Success', description: 'Report generated and downloaded successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">📊 Reports & Analytics</h2>
        <p className="text-muted-foreground">
          Generate customizable PDF reports for audits, compliance, fleet status, and more.
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Report Type Selection */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card 
                  key={type.id}
                  className={`maritime-card cursor-pointer transition-all ${
                    selectedReportType === type.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedReportType(type.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        selectedReportType === type.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Report Configuration */}
          <Card className="maritime-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Configuration
              </CardTitle>
              <CardDescription>Customize your report parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Vessel Filter</Label>
                  <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vessel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vessels</SelectItem>
                      {vessels.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input 
                    type="date" 
                    value={dateFrom} 
                    onChange={(e) => setDateFrom(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Input 
                    type="date" 
                    value={dateTo} 
                    onChange={(e) => setDateTo(e.target.value)} 
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="summary" 
                    checked={includeSummary}
                    onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
                  />
                  <Label htmlFor="summary">Include Executive Summary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="details" 
                    checked={includeDetails}
                    onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
                  />
                  <Label htmlFor="details">Include Detailed Tables</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="charts" 
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  />
                  <Label htmlFor="charts">Include Charts (when available)</Label>
                </div>
              </div>

              <Button 
                onClick={generateReport} 
                disabled={generating}
                className="btn-maritime"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {generating ? 'Generating...' : 'Generate & Download PDF'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <ReportHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ReportHistory = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(20);
      
      setReports(data || []);
      setLoading(false);
    };
    
    fetchReports();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading report history...</div>;
  }

  if (reports.length === 0) {
    return (
      <Card className="maritime-card">
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No reports generated yet</h3>
          <p className="text-muted-foreground">Generate your first report to see it here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="maritime-card">
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{report.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Generated on {new Date(report.generated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{report.report_type}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Reports;
