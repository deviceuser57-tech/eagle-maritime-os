import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileCheck, TrendingUp, Award, Loader2 } from 'lucide-react';
import { useVesselCertifications } from '@/hooks/useVesselCertifications';
import { useAudits } from '@/hooks/useAudits';

const DigitalCompliance = () => {
  const { certifications, loading: certsLoading } = useVesselCertifications();
  const { audits, isLoading: auditsLoading } = useAudits();

  const isLoading = certsLoading || auditsLoading;

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
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`rounded-full h-2 ${area.score >= 95 ? 'bg-green-500' : area.score >= 90 ? 'bg-primary' : 'bg-orange-500'}`}
                        style={{ width: `${area.score}%` }}
                      />
                    </div>
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
    </div>
  );
};

export default DigitalCompliance;
