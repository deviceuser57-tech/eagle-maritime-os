import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ship, TrendingDown, Target, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CIIDashboard = () => {
  const ciiData = [
    { vessel: 'MV Atlantic', rating: 'B', value: 6.2, target: 5.8, year: '2024' },
    { vessel: 'MV Pacific', rating: 'A', value: 5.1, target: 5.8, year: '2024' },
    { vessel: 'MV Nordic', rating: 'C', value: 7.1, target: 5.8, year: '2024' },
    { vessel: 'MV Southern', rating: 'B', value: 6.4, target: 5.8, year: '2024' },
  ];

  const trendData = [
    { year: '2020', avg: 7.8 },
    { year: '2021', avg: 7.2 },
    { year: '2022', avg: 6.8 },
    { year: '2023', avg: 6.3 },
    { year: '2024', avg: 6.2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">🚢 CII Dashboard</h2>
        <p className="text-muted-foreground">
          Carbon Intensity Indicator monitoring and compliance tracking for your fleet.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fleet Avg CII</p>
                <p className="text-2xl font-bold">6.2</p>
              </div>
              <Ship className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Improvement</p>
                <p className="text-2xl font-bold text-green-500">-15%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A-Rated Vessels</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Target 2025</p>
                <p className="text-2xl font-bold">5.8</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="maritime-card">
          <CardHeader>
            <CardTitle>Fleet CII Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" fill="hsl(var(--primary))" name="Average CII" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardHeader>
            <CardTitle>Vessel CII Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ciiData.map((vessel, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{vessel.vessel}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {vessel.value} | Target: {vessel.target}
                    </p>
                  </div>
                  <Badge variant={
                    vessel.rating === 'A' ? 'default' :
                    vessel.rating === 'B' ? 'secondary' : 'destructive'
                  }>
                    Rating: {vessel.rating}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CIIDashboard;
