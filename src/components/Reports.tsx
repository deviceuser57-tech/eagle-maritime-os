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
  Settings,
  ShieldCheck,
  FileDown,
  Table
} from 'lucide-react';
import { reportUtils } from '@/utils/reportUtils';
import { falFormsService } from '@/services/falFormsService';
import { useCyberSecurityStatus } from '@/hooks/useCyberSecurityStatus';
import { useVesselCertifications } from '@/hooks/useVesselCertifications';
import { useAudits } from '@/hooks/useAudits';
import { useIncidents } from '@/hooks/useIncidents';
import { useCrewMembers } from '@/hooks/useCrewMembers';

const Reports = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { vessels } = useVessels();
  const { tasks } = useMaintenanceTasks();
  const { certifications } = useVesselCertifications();
  const { audits } = useAudits();
  const { incidents } = useIncidents();
  const { crewMembers: crew } = useCrewMembers();
  const { metrics: cyberMetrics, totalScore: cyberScore } = useCyberSecurityStatus();

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
    { id: 'cyber-security', name: 'Cyber Security Report', icon: ShieldCheck, description: 'MSC.428(98) compliance and integrity metrics' },
    { id: 'imo-fal', name: 'IMO FAL Form 1/5', icon: FileText, description: 'International standardized port reporting forms' },
  ];

  const generateFleetStatusPDF = () => {
    const doc = new jsPDF();
    reportUtils.applyProfessionalBranding(doc, {
      title: 'Fleet Status Report',
      subtitle: 'Overview of all vessels and their current status'
    });

    let y = 45;
    if (includeSummary) {
      y = reportUtils.addSectionHeader(doc, 'Executive Summary', y);
      doc.text(`Total Vessels: ${vessels.length}`, 14, y);
      doc.text(`Active Vessels: ${vessels.filter(v => v.status === 'active').length}`, 14, y + 7);
      doc.text(`Under Maintenance: ${vessels.filter(v => v.status === 'maintenance').length}`, 14, y + 14);
      y += 25;
    }

    if (includeDetails && vessels.length > 0) {
      y = reportUtils.addSectionHeader(doc, 'Vessel Details', y);

      autoTable(doc, {
        startY: y,
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

    return doc;
  };

  const generateMaintenancePDF = () => {
    const doc = new jsPDF();
    reportUtils.applyProfessionalBranding(doc, {
      title: 'Maintenance Report',
      subtitle: 'Maintenance tasks, schedules, and completion rates',
      accentColor: [22, 163, 74]
    });

    let y = 45;
    const filteredTasks = tasks.filter(t => {
      if (selectedVessel !== 'all' && t.vessel_id !== selectedVessel) return false;
      if (dateFrom && new Date(t.due_date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.due_date) > new Date(dateTo)) return false;
      return true;
    });

    if (includeSummary) {
      y = reportUtils.addSectionHeader(doc, 'Summary', y);
      doc.text(`Total Tasks: ${filteredTasks.length}`, 14, y);
      doc.text(`Scheduled: ${filteredTasks.filter(t => t.status === 'scheduled').length}`, 14, y + 7);
      doc.text(`Completed: ${filteredTasks.filter(t => t.status === 'completed').length}`, 14, y + 14);
      y += 25;
    }

    if (includeDetails && filteredTasks.length > 0) {
      y = reportUtils.addSectionHeader(doc, 'Task Details', y);

      autoTable(doc, {
        startY: y,
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
    reportUtils.applyProfessionalBranding(doc, {
      title: 'Audit & Compliance Report',
      subtitle: 'Audit history, findings, and compliance metrics',
      accentColor: [147, 51, 234]
    });

    let y = 45;
    const { data: audits } = await supabase
      .from('audits')
      .select('*, vessels(name)')
      .order('scheduled_date', { ascending: false });

    if (includeSummary) {
      y = reportUtils.addSectionHeader(doc, 'Summary', y);
      doc.text(`Total Audits: ${audits?.length || 0}`, 14, y);
      doc.text(`Average Compliance Score: ${audits?.length ? Math.round(audits.reduce((acc, a) => acc + (a.score || 0), 0) / audits.length) : 0}%`, 14, y + 7);
      y += 20;
    }

    if (includeDetails && audits && audits.length > 0) {
      y = reportUtils.addSectionHeader(doc, 'Audit Details', y);

      autoTable(doc, {
        startY: y,
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
    reportUtils.applyProfessionalBranding(doc, {
      title: 'Incident Report',
      subtitle: 'Safety incidents and investigation status',
      accentColor: [220, 38, 38]
    });

    let y = 45;
    const { data: incidents } = await supabase
      .from('incidents')
      .select('*, vessels(name)')
      .order('incident_date', { ascending: false });

    if (includeSummary) {
      y = reportUtils.addSectionHeader(doc, 'Summary', y);
      doc.text(`Total Incidents: ${incidents?.length || 0}`, 14, y);
      doc.text(`Critical: ${incidents?.filter(i => i.severity === 'critical').length || 0}`, 14, y + 7);
      doc.text(`Major: ${incidents?.filter(i => i.severity === 'major').length || 0}`, 14, y + 14);
      y += 25;
    }

    if (includeDetails && incidents && incidents.length > 0) {
      y = reportUtils.addSectionHeader(doc, 'Incident Details', y);

      autoTable(doc, {
        startY: y,
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
    reportUtils.applyProfessionalBranding(doc, {
      title: 'Crew Report',
      subtitle: 'Crew certifications, contracts, and assignments',
      accentColor: [59, 130, 246]
    });

    let y = 45;
    const { data: crew } = await supabase
      .from('crew_members')
      .select('*, vessels(name)')
      .order('last_name', { ascending: true });

    if (includeSummary) {
      y = reportUtils.addSectionHeader(doc, 'Manpower Summary', y);
      doc.text(`Total Crew Members: ${crew?.length || 0}`, 14, y);
      doc.text(`Active on Board: ${crew?.filter(c => c.status === 'active').length || 0}`, 14, y + 7);
      y += 20;
    }

    if (includeDetails && crew && crew.length > 0) {
      y = reportUtils.addSectionHeader(doc, 'Crew Manifest', y);

      autoTable(doc, {
        startY: y,
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

  const generateCertificateExpiryPDF = () => {
    const doc = new jsPDF();
    reportUtils.applyProfessionalBranding(doc, {
      title: 'Certificate Expiry Report',
      subtitle: 'Critical documentation threshold monitoring',
      accentColor: [245, 158, 11],
      confidential: true
    });

    let y = 45;
    const certs = certifications.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
    const criticalCerts = certs.filter(c => {
      const days = Math.ceil((new Date(c.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return days <= 30;
    });

    if (includeSummary) {
      y = reportUtils.addSectionHeader(doc, 'Urgency Summary', y);
      doc.setTextColor(220, 38, 38);
      doc.text(`Critical Expirations (Within 30 Days): ${criticalCerts.length}`, 14, y);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Active Certificates: ${certs.length}`, 14, y + 7);
      y += 20;
    }

    if (includeDetails && certs.length > 0) {
      y = reportUtils.addSectionHeader(doc, 'Registry Status', y);
      autoTable(doc, {
        startY: y,
        head: [['Vessel', 'Certificate Name', 'Expiry Date', 'Authority', 'Status']],
        body: certs.map(c => [
          vessels.find(v => v.id === c.vessel_id)?.name || 'N/A',
          c.certificate_name,
          new Date(c.expiry_date).toLocaleDateString(),
          c.issuing_authority || 'N/A',
          new Date(c.expiry_date) < new Date() ? 'EXPIRED' : 'VALID'
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [245, 158, 11] },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            if (data.cell.text[0] === 'EXPIRED') data.cell.styles.textColor = [220, 38, 38];
          }
        }
      });
    }

    return doc;
  };

  const generateCyberSecurityPDF = () => {
    const doc = new jsPDF();
    reportUtils.applyProfessionalBranding(doc, {
      title: 'Cyber Security Compliance',
      subtitle: 'IMO Resolution MSC.428(98) Readiness Report',
      accentColor: [15, 23, 42],
      confidential: true
    });

    let y = 45;
    y = reportUtils.addSectionHeader(doc, 'Security Readiness Score', y);
    doc.setFontSize(22);
    doc.setTextColor(cyberScore >= 90 ? 22 : 220, cyberScore >= 90 ? 163 : 38, cyberScore >= 90 ? 74 : 38);
    doc.text(`${cyberScore}%`, 14, y + 10);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    y += 25;

    y = reportUtils.addSectionHeader(doc, 'Compliance Metrics', y);
    autoTable(doc, {
      startY: y,
      head: [['Metric Name', 'Integrity Status', 'Score', 'Assessment']],
      body: cyberMetrics.map(m => [
        m.name,
        m.status.toUpperCase(),
        `${m.score}%`,
        m.description
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] }
    });

    return doc;
  };

  const generateIMOFALPDF = async () => {
    if (selectedVessel === 'all') {
      toast({ title: 'Error', description: 'Please select a specific vessel for IMO FAL Forms', variant: 'destructive' });
      return null;
    }

    const doc = new jsPDF();
    const fal1 = await falFormsService.generateForm1(selectedVessel);
    const fal5 = await falFormsService.generateForm5(selectedVessel);

    reportUtils.applyProfessionalBranding(doc, {
      title: 'IMO FAL Form 1 / 5',
      subtitle: 'General Declaration & Crew List (Standardized)',
      accentColor: [30, 64, 175]
    });

    let y = 45;
    if (fal1) {
      y = reportUtils.addSectionHeader(doc, 'Form 1: General Declaration', y);
      const data = [
        ['Vessel Name', fal1.vessel_name, 'IMO Number', fal1.imo_number],
        ['Call Sign', fal1.call_sign, 'Flag State', fal1.flag_state],
        ['Crew Count', fal1.crew_count.toString(), 'Passenger Count', fal1.passenger_count.toString()]
      ];
      autoTable(doc, {
        startY: y,
        body: data,
        theme: 'grid',
        styles: { fontSize: 9 }
      });
      y = (doc as any).lastAutoTable.finalY + 15;
    }

    if (fal5.length > 0) {
      y = reportUtils.addSectionHeader(doc, 'Form 5: Crew List', y);
      autoTable(doc, {
        startY: y,
        head: [['Rank', 'First Name', 'Last Name', 'Nationality', 'Cert Number']],
        body: fal5.map(c => [c.rank, c.first_name, c.last_name, c.nationality, c.passport_number]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 64, 175] }
      });
    }

    return doc;
  };

  const generateCSV = (type: string) => {
    let data: any[] = [];
    let headers: string[] = [];
    let filename = `${type}-export.csv`;

    switch (type) {
      case 'fleet-status':
        headers = ['Name', 'IMO', 'Type', 'Flag', 'Status'];
        data = vessels.map(v => [v.name, v.imo_number, v.vessel_type, v.flag_state, v.status]);
        break;
      case 'maintenance':
        headers = ['Title', 'Vessel', 'Type', 'Priority', 'Due Date', 'Status'];
        data = tasks.map(t => [t.title, t.vessels?.name, t.task_type, t.priority, t.due_date, t.status]);
        break;
      case 'certificate-expiry':
        headers = ['Vessel', 'Certificate', 'Expiry', 'Authority'];
        data = certifications.map(c => [
          vessels.find(v => v.id === c.vessel_id)?.name,
          c.certificate_name,
          c.expiry_date,
          c.issuing_authority
        ]);
        break;
      case 'audit-compliance':
        headers = ['Vessel', 'Type', 'Auditor', 'Date', 'Status', 'Score'];
        data = (audits || []).map(a => [a.vessels?.name, a.audit_type, a.auditor_name, a.scheduled_date, a.status, a.score]);
        break;
      case 'incidents':
        headers = ['Title', 'Vessel', 'Type', 'Severity', 'Date', 'Status'];
        data = (incidents || []).map(i => [i.title, i.vessels?.name, i.incident_type, i.severity, i.incident_date, i.investigation_status]);
        break;
      case 'crew':
        headers = ['Name', 'Rank', 'Vessel', 'Nationality', 'Cert Expiry', 'Status'];
        data = (crew || []).map(c => [`${c.first_name} ${c.last_name}`, c.rank, c.vessels?.name, c.nationality, c.certificate_expiry, c.status]);
        break;
      case 'cyber-security':
        headers = ['Metric', 'Status', 'Score', 'Description'];
        data = cyberMetrics.map(m => [m.name, m.status, m.score, m.description]);
        break;
    }

    if (data.length === 0) return;

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map((cell: any) => `"${cell || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        case 'certificate-expiry':
          doc = generateCertificateExpiryPDF();
          break;
        case 'cyber-security':
          doc = generateCyberSecurityPDF();
          break;
        case 'imo-fal':
          const falDoc = await generateIMOFALPDF();
          if (!falDoc) return;
          doc = falDoc;
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
                  className={`maritime-card cursor-pointer transition-all ${selectedReportType === type.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                    }`}
                  onClick={() => setSelectedReportType(type.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${selectedReportType === type.id
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

              <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                <Button
                  onClick={generateReport}
                  disabled={generating}
                  className="btn-maritime flex-1 md:flex-none h-12 px-10 rounded-xl"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {generating ? 'Finalizing...' : 'Generate PDF Official'}
                </Button>

                <Button
                  onClick={() => generateCSV(selectedReportType)}
                  disabled={generating}
                  variant="outline"
                  className="h-12 px-8 rounded-xl border-border hover:bg-slate-50 text-slate-600"
                >
                  <Table className="h-4 w-4 mr-2" />
                  Export to CSV/Excel
                </Button>
              </div>
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
