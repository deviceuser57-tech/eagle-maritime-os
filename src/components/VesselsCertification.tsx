import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const VesselsCertification = () => {
  const certificates = [
    { vessel: 'MV Atlantic Pride', cert: 'Safety Management Certificate', expires: '2024-03-15', status: 'valid', daysLeft: 45 },
    { vessel: 'MV Pacific Star', cert: 'Load Line Certificate', expires: '2024-02-20', status: 'expiring', daysLeft: 20 },
    { vessel: 'MV Nordic Wave', cert: 'Cargo Ship Safety Certificate', expires: '2024-01-25', status: 'critical', daysLeft: 5 },
    { vessel: 'MV Southern Cross', cert: 'IOPP Certificate', expires: '2024-04-10', status: 'valid', daysLeft: 70 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">📜 Vessel Certification</h2>
        <p className="text-muted-foreground">
          Track and manage all vessel certificates, compliance documents, and renewal schedules.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Certificates</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valid</p>
                <p className="text-2xl font-bold text-green-500">142</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-500">9</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-500">5</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Certificate Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificates.map((cert, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{cert.vessel}</p>
                  <p className="text-sm text-muted-foreground">{cert.cert}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm">Expires: {cert.expires}</p>
                    <p className="text-xs text-muted-foreground">{cert.daysLeft} days left</p>
                  </div>
                  <Badge variant={
                    cert.status === 'valid' ? 'default' :
                    cert.status === 'expiring' ? 'secondary' : 'destructive'
                  }>
                    {cert.status}
                  </Badge>
                  <Button size="sm" variant="outline">Renew</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VesselsCertification;
