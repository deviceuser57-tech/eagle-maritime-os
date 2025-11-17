import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';

const InsuranceClaims = () => {
  const claims = [
    { id: 'CLM-2024-005', vessel: 'MV Atlantic Pride', type: 'Hull Damage', amount: '$45,000', status: 'Under Review', date: '2024-01-12' },
    { id: 'CLM-2024-004', vessel: 'MV Pacific Star', type: 'Cargo Loss', amount: '$28,000', status: 'Approved', date: '2024-01-08' },
    { id: 'CLM-2023-089', vessel: 'MV Nordic Wave', type: 'Equipment Failure', amount: '$12,500', status: 'Settled', date: '2023-12-20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">📋 Insurance Claim Management</h2>
        <p className="text-muted-foreground">
          Track and manage insurance claims with documentation, status updates, and financial tracking.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Claims</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">$385K</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-500">5</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Settled</p>
                <p className="text-2xl font-bold text-green-500">23</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{claim.id}</p>
                    <Badge variant="outline">{claim.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{claim.vessel}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-medium">{claim.amount}</p>
                    <p className="text-xs text-muted-foreground">{claim.date}</p>
                  </div>
                  <Badge variant={
                    claim.status === 'Settled' ? 'default' :
                    claim.status === 'Approved' ? 'secondary' : 'outline'
                  }>
                    {claim.status}
                  </Badge>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsuranceClaims;
