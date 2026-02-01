import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, TrendingDown, Target, Award, Plus, Loader2, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCIIRecords } from '@/hooks/useCIIRecords';
import { useVessels } from '@/hooks/useVessels';

const CIIDashboard = () => {
  const { ciiRecords: records, loading, addCIIRecord: addRecord, deleteCIIRecord: deleteRecord } = useCIIRecords();
  const { vessels } = useVessels();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vessel_id: '',
    year: new Date().getFullYear().toString(),
    cii_value: '',
    cii_rating: 'B',
    target_cii: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRecord({
      vessel_id: formData.vessel_id || null,
      year: parseInt(formData.year),
      cii_value: parseFloat(formData.cii_value),
      cii_rating: formData.cii_rating,
      target_value: formData.target_cii ? parseFloat(formData.target_cii) : null,
      fuel_consumption: null,
      distance_travelled: null,
      cargo_carried: null,
      notes: null,
    });
    setFormData({
      vessel_id: '',
      year: new Date().getFullYear().toString(),
      cii_value: '',
      cii_rating: 'B',
      target_cii: '',
    });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteRecord(id);
    }
  };

  // Calculate stats from real data
  const avgCII = records.length > 0 
    ? (records.reduce((sum, r) => sum + r.cii_value, 0) / records.length).toFixed(1)
    : '0.0';
  
  const aRatedCount = records.filter(r => r.cii_rating === 'A').length;
  
  // Group by year for trend chart
  const trendData = [...new Set(records.map(r => r.year))]
    .sort()
    .map(year => {
      const yearRecords = records.filter(r => r.year === year);
      const avg = yearRecords.reduce((sum, r) => sum + r.cii_value, 0) / yearRecords.length;
      return { year: year.toString(), avg: parseFloat(avg.toFixed(1)) };
    });

  // Calculate improvement
  const improvement = trendData.length >= 2
    ? (((trendData[0].avg - trendData[trendData.length - 1].avg) / trendData[0].avg) * 100).toFixed(0)
    : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">🚢 CII Dashboard</h2>
          <p className="text-muted-foreground">
            Carbon Intensity Indicator monitoring and compliance tracking for your fleet.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add CII Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vessel_id">Vessel *</Label>
                <Select value={formData.vessel_id} onValueChange={(v) => setFormData({ ...formData, vessel_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vessel" />
                  </SelectTrigger>
                  <SelectContent>
                    {vessels.map((vessel) => (
                      <SelectItem key={vessel.id} value={vessel.id}>{vessel.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                    min="2020"
                    max="2030"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cii_value">CII Value *</Label>
                  <Input
                    id="cii_value"
                    type="number"
                    step="0.1"
                    value={formData.cii_value}
                    onChange={(e) => setFormData({ ...formData, cii_value: e.target.value })}
                    required
                    placeholder="e.g., 6.2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cii_rating">CII Rating *</Label>
                  <Select value={formData.cii_rating} onValueChange={(v) => setFormData({ ...formData, cii_rating: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Superior</SelectItem>
                      <SelectItem value="B">B - Good</SelectItem>
                      <SelectItem value="C">C - Moderate</SelectItem>
                      <SelectItem value="D">D - Inferior</SelectItem>
                      <SelectItem value="E">E - Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_cii">Target CII</Label>
                  <Input
                    id="target_cii"
                    type="number"
                    step="0.1"
                    value={formData.target_cii}
                    onChange={(e) => setFormData({ ...formData, target_cii: e.target.value })}
                    placeholder="e.g., 5.8"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Record
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fleet Avg CII</p>
                <p className="text-2xl font-bold">{avgCII}</p>
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
                <p className={`text-2xl font-bold ${parseInt(improvement) > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {parseInt(improvement) > 0 ? `-${improvement}%` : '0%'}
                </p>
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
                <p className="text-2xl font-bold">{aRatedCount}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Records</p>
                <p className="text-2xl font-bold">{records.length}</p>
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
            {trendData.length > 0 ? (
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No CII records yet. Add records to see trends.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardHeader>
            <CardTitle>Vessel CII Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No CII records yet. Add your first record above.</p>
            ) : (
              <div className="space-y-4">
                {records.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{record.vessels?.name || 'Unknown vessel'}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {record.cii_value} | Target: {record.target_value || 'N/A'} | Year: {record.year}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        record.cii_rating === 'A' ? 'default' :
                        record.cii_rating === 'B' ? 'secondary' : 'destructive'
                      }>
                        Rating: {record.cii_rating}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CIIDashboard;
