import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileCheck, TrendingUp, Award } from 'lucide-react';

const DigitalCompliance = () => {
  const complianceAreas = [
    { area: 'SOLAS Compliance', status: 'Compliant', score: 98, lastAudit: '2024-01-10' },
    { area: 'MARPOL Annex I-VI', status: 'Compliant', score: 96, lastAudit: '2023-12-20' },
    { area: 'ISM Code', status: 'Compliant', score: 100, lastAudit: '2024-01-05' },
    { area: 'ISPS Code', status: 'Action Required', score: 88, lastAudit: '2023-11-15' },
  ];

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
                <p className="text-2xl font-bold">95.5%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certificates Valid</p>
                <p className="text-2xl font-bold">142</p>
              </div>
              <FileCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Improvement</p>
                <p className="text-2xl font-bold text-green-500">+3.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certifications</p>
                <p className="text-2xl font-bold">18</p>
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
                  <p className="text-sm text-muted-foreground">Last audit: {area.lastAudit}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Compliance Score</span>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalCompliance;
