import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Camera, Award } from 'lucide-react';

const InteractiveClosure = () => {
  const pendingClosures = [
    { id: 'CL-001', finding: 'F-2024-001', vessel: 'MV Atlantic Pride', evidence: 4, photos: 8, readyForReview: true },
    { id: 'CL-002', finding: 'F-2024-004', vessel: 'MV Southern Cross', evidence: 2, photos: 5, readyForReview: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">✅ Interactive Closure</h2>
        <p className="text-muted-foreground">
          Streamlined finding closure process with evidence verification and approval workflow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Closure</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready for Review</p>
                <p className="text-2xl font-bold text-orange-500">7</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed This Month</p>
                <p className="text-2xl font-bold text-green-500">34</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Evidence Items</p>
                <p className="text-2xl font-bold">87</p>
              </div>
              <Camera className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Findings Awaiting Closure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingClosures.map((closure) => (
              <div key={closure.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{closure.id}</p>
                    <Badge variant="outline">{closure.finding}</Badge>
                  </div>
                  {closure.readyForReview && (
                    <Badge variant="default">Ready for Review</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{closure.vessel}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{closure.evidence} evidence documents</span>
                  <span>{closure.photos} verification photos</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Review Evidence</Button>
                  <Button size="sm" variant="outline">Request More Info</Button>
                  {closure.readyForReview && (
                    <Button size="sm" variant="outline">Approve Closure</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveClosure;
