import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, FileText, AlertTriangle } from 'lucide-react';

const RulesRegulations = () => {
  const regulations = [
    { code: 'SOLAS', title: 'Safety of Life at Sea', version: 'Consolidated 2023', category: 'Safety', updates: 3 },
    { code: 'MARPOL', title: 'Marine Pollution', version: 'Annex I-VI 2023', category: 'Environmental', updates: 5 },
    { code: 'ISM Code', title: 'International Safety Management', version: '2018 Edition', category: 'Management', updates: 0 },
    { code: 'ISPS Code', title: 'Ship and Port Facility Security', version: '2003 + Amendments', category: 'Security', updates: 1 },
    { code: 'MLC 2006', title: 'Maritime Labour Convention', version: '2006 as amended', category: 'Labour', updates: 2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">📜 Rules & Regulations</h2>
        <p className="text-muted-foreground">
          Access the latest maritime regulations, conventions, and compliance requirements.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Regulations</p>
                <p className="text-2xl font-bold">48</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Updates</p>
                <p className="text-2xl font-bold text-orange-500">11</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
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
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold text-green-500">96%</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Search Regulations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by code, title, or keyword..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Key Maritime Regulations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regulations.map((reg, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{reg.code} - {reg.title}</p>
                  <p className="text-sm text-muted-foreground">{reg.version}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{reg.category}</Badge>
                  {reg.updates > 0 && (
                    <Badge variant="secondary">{reg.updates} updates</Badge>
                  )}
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

export default RulesRegulations;
