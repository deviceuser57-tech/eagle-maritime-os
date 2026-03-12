import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileCheck, TrendingUp, Award, Loader2, ShieldAlert, ShieldCheck as ShieldIcon, Lock } from 'lucide-react';
import { useVesselCertifications } from '@/hooks/useVesselCertifications';
import { useAudits } from '@/hooks/useAudits';
import { useCyberSecurityStatus } from '@/hooks/useCyberSecurityStatus';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DigitalCompliance = () => {
  const { certifications, loading: certsLoading } = useVesselCertifications();
  const { audits, isLoading: auditsLoading } = useAudits();
  const { metrics, totalScore: cyberScore, loading: cyberLoading } = useCyberSecurityStatus();

  const isLoading = certsLoading || auditsLoading || cyberLoading;

  // Calculate real compliance stats
  const validCerts = certifications?.filter(c => c.status === 'valid') || [];
  const totalCerts = certifications?.length || 0;
  const certComplianceRate = totalCerts > 0
    ? Math.round((validCerts.length / totalCerts) * 100)
    : 0;

  const completedAudits = audits?.filter(a => a.status === 'completed') || [];
  const auditComplianceRate = audits?.length > 0
    ? Math.round((completedAudits.length / (audits?.length || 1)) * 100)
    : 0;

  const overallCompliance = totalCerts > 0 || (audits?.length || 0) > 0
    ? Math.round((certComplianceRate + auditComplianceRate) / 2)
    : 0;

  // Group certifications by type for compliance areas
  const certsByType = certifications?.reduce((acc, cert) => {
    const type = cert.certificate_type || 'Other';
    if (!acc[type]) acc[type] = { valid: 0, total: 0 };
    acc[type].total++;
    if (cert.status === 'valid') acc[type].valid++;
    return acc;
  }, {} as Record<string, { valid: number; total: number }>) || {};

  // Build compliance areas from real data
  const complianceAreas = Object.entries(certsByType).map(([type, data]) => {
    const score = data.total > 0 ? Math.round((data.valid / data.total) * 100) : 0;
    const status = score >= 90 ? 'Compliant' : score >= 70 ? 'Action Required' : 'Non-Compliant';
    const lastAudit = completedAudits.find(a =>
      a.audit_type?.toLowerCase().includes(type.toLowerCase())
    );

    return {
      area: type,
      status,
      score,
      lastAudit: lastAudit?.completed_date || 'Not audited',
      validCount: data.valid,
      totalCount: data.total,
    };
  });

  // Add audit-based compliance if no certs
  if (complianceAreas.length === 0 && audits && audits.length > 0) {
    const auditTypes = [...new Set(audits.map(a => a.audit_type))];
    auditTypes.forEach(type => {
      const typeAudits = audits.filter(a => a.audit_type === type);
      const completedTypeAudits = typeAudits.filter(a => a.status === 'completed');
      const score = typeAudits.length > 0
        ? Math.round((completedTypeAudits.length / typeAudits.length) * 100)
        : 0;

      complianceAreas.push({
        area: type,
        status: score >= 90 ? 'Compliant' : score >= 70 ? 'Action Required' : 'Needs Attention',
        score,
        lastAudit: completedTypeAudits[0]?.completed_date || 'Not completed',
        validCount: completedTypeAudits.length,
        totalCount: typeAudits.length,
      });
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading compliance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">✅ Digital Compliance</h2>
        <p className="text-muted-foreground">
          Real-time compliance monitoring across all regulatory requirements and standards.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Compliance</p>
                <p className="text-2xl font-bold">{overallCompliance}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valid Certificates</p>
                <p className="text-2xl font-bold">{validCerts.length}</p>
              </div>
              <FileCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cert Compliance</p>
                <p className={`text-2xl font-bold ${certComplianceRate >= 90 ? 'text-green-500' : 'text-orange-500'}`}>
                  {certComplianceRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Certs</p>
                <p className="text-2xl font-bold">{totalCerts}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="regulatory" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="regulatory" className="rounded-lg px-6 py-2">Statutory Compliance</TabsTrigger>
          <TabsTrigger value="cyber" className="rounded-lg px-6 py-2">Cyber Security (MSC.428)</TabsTrigger>
        </TabsList>

        <TabsContent value="regulatory" className="space-y-6">
          <Card className="maritime-card">
            <CardHeader>
              <CardTitle>Compliance by Area</CardTitle>
            </CardHeader>
            <CardContent>
              {complianceAreas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No compliance data available. Add certificates or audits to see compliance metrics.
                </div>
              ) : (
                <div className="space-y-4">
                  {complianceAreas.map((area, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{area.area}</p>
                          <Badge variant={area.status === 'Compliant' ? 'default' : 'secondary'}>
                            {area.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Last audit: {area.lastAudit}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Compliance Score ({area.validCount}/{area.totalCount})</span>
                          <span className="font-medium">{area.score}%</span>
                        </div>
                        <Progress value={area.score} className={`h-2 ${area.score >= 90 ? 'bg-green-500' : 'bg-orange-500'}`} />
                      </div>
                      {area.status !== 'Compliant' && (
                        <Button size="sm" variant="outline" className="mt-3">View Action Plan</Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cyber" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="maritime-card bg-slate-900 text-white border-none overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lock className="h-24 w-24" />
              </div>
              <CardContent className="pt-8">
                <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-2">Cyber Readiness</p>
                <p className="text-6xl font-black mb-4">{cyberScore}%</p>
                <Badge className={cyberScore >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}>
                  {cyberScore >= 90 ? 'Standard Compliant' : 'Risk Detected'}
                </Badge>
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-4">
              {metrics.map((metric, idx) => (
                <Card key={idx} className="maritime-card">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${metric.status === 'passed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                          {metric.status === 'passed' ? <ShieldIcon className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{metric.name}</p>
                          <p className="text-sm text-muted-foreground mb-3">{metric.description}</p>
                          <div className="flex items-center gap-4">
                            <Progress value={metric.score} className="h-1.5 w-32" />
                            <span className="text-xs font-bold">{metric.score}% Integrity</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={metric.status === 'passed' ? 'default' : 'destructive'} className="uppercase tracking-tighter">
                        {metric.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="maritime-card border-dashed border-2">
            <CardContent className="py-12 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="font-bold text-muted-foreground uppercase tracking-[0.2em] text-xs">MSC.428(98) Regulatory Compliance Note</p>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-2">
                This system automatically monitors cyber risk management parameters to ensure continuous compliance with international maritime cyber safety standards.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DigitalCompliance;
