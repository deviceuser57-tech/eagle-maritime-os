import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Users, TrendingUp } from 'lucide-react';

const SafetyManagement = () => {
  const smsElements = [
    { element: 'Safety Policy', status: 'Current', lastReview: '2024-01-10', nextReview: '2024-07-10' },
    { element: 'Risk Assessment', status: 'Current', lastReview: '2023-12-15', nextReview: '2024-06-15' },
    { element: 'Emergency Procedures', status: 'Review Due', lastReview: '2023-10-20', nextReview: '2024-01-20' },
    { element: 'Training Matrix', status: 'Current', lastReview: '2024-01-05', nextReview: '2024-04-05' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">🛡️ Safety Management System</h2>
        <p className="text-muted-foreground">
          Comprehensive ISM Code compliance with integrated safety procedures and documentation.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SMS Compliance</p>
                <p className="text-2xl font-bold">98%</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Procedures</p>
                <p className="text-2xl font-bold">142</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trained Personnel</p>
                <p className="text-2xl font-bold">312</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Safety Improvement</p>
                <p className="text-2xl font-bold text-green-500">+15%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>SMS Elements Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {smsElements.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.element}</p>
                  <p className="text-sm text-muted-foreground">
                    Last reviewed: {item.lastReview}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm">Next review: {item.nextReview}</p>
                  </div>
                  <Badge variant={item.status === 'Current' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyManagement;
