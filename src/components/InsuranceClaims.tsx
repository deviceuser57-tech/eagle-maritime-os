import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, DollarSign, Clock, CheckCircle, Plus, Loader2, Trash2 } from 'lucide-react';
import { useInsuranceClaims } from '@/hooks/useInsuranceClaims';
import { useVessels } from '@/hooks/useVessels';
import { useSetupClaimTypes } from '@/hooks/useSetupClaimTypes';
import { useSetupCompanies } from '@/hooks/useSetupCompanies';
import { format } from 'date-fns';

const InsuranceClaims = () => {
  const { claims, loading, addClaim, deleteClaim } = useInsuranceClaims();
  const { vessels } = useVessels();
  const { claimTypes } = useSetupClaimTypes();
  const insurerCompanies = useSetupCompanies('insurer' as any);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vessel_id: '',
    claim_type: '',
    claim_amount: '',
    incident_date: '',
    description: '',
    status: 'submitted',
    policy_number: '',
    insurer_name: '',
    broker_name: '',
    loss_adjuster: '',
    deductible_amount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addClaim({
      vessel_id: formData.vessel_id || null,
      claim_type: formData.claim_type,
      claim_amount: formData.claim_amount ? parseFloat(formData.claim_amount) : null,
      incident_date: formData.incident_date || null,
      description: formData.description || null,
      status: formData.status,
      policy_number: formData.policy_number || null,
      insurer_name: formData.insurer_name || null,
      claim_number: null,
      submitted_date: new Date().toISOString().split('T')[0],
      resolved_date: null,
      approved_amount: null
    });
    setFormData({
      vessel_id: '',
      claim_type: '',
      claim_amount: '',
      incident_date: '',
      description: '',
      status: 'submitted',
      policy_number: '',
      insurer_name: '',
      broker_name: '',
      loss_adjuster: '',
      deductible_amount: '',
    });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this claim?')) {
      await deleteClaim(id);
    }
  };

  const activeCount = claims.filter(c => c.status === 'submitted' || c.status === 'under_review').length;
  const pendingCount = claims.filter(c => c.status === 'under_review' || c.status === 'approved').length;
  const settledCount = claims.filter(c => c.status === 'settled').length;
  const totalValue = claims.reduce((sum, c) => sum + (c.claim_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">📋 Insurance Claim Management</h2>
          <p className="text-muted-foreground">
            Track and manage insurance claims with documentation, status updates, and financial tracking.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              File Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>File New Claim</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="claim_type">Claim Type *</Label>
                <Select value={formData.claim_type} onValueChange={(v) => setFormData({ ...formData, claim_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    {claimTypes.map(ct => (
                      <SelectItem key={ct.id} value={ct.name}>{ct.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vessel_id">Vessel</Label>
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
                  <Label htmlFor="policy_number">Marine Policy #</Label>
                  <Input
                    id="policy_number"
                    value={formData.policy_number}
                    onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurer_name">Lead Insurer</Label>
                  <Select value={formData.insurer_name} onValueChange={(v) => setFormData({ ...formData, insurer_name: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Insurer" />
                    </SelectTrigger>
                    <SelectContent>
                      {insurerCompanies.companies.map(c => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="broker_name">Assigned Broker</Label>
                  <Input id="broker_name" value={formData.broker_name} onChange={(e) => setFormData({ ...formData, broker_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loss_adjuster">Loss Adjuster</Label>
                  <Input id="loss_adjuster" value={formData.loss_adjuster} onChange={(e) => setFormData({ ...formData, loss_adjuster: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="claim_amount">Estimated Loss (USD)</Label>
                  <Input
                    id="claim_amount"
                    type="number"
                    value={formData.claim_amount}
                    onChange={(e) => setFormData({ ...formData, claim_amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductible_amount">Deductible</Label>
                  <Input id="deductible_amount" type="number" value={formData.deductible_amount} onChange={(e) => setFormData({ ...formData, deductible_amount: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incident_date">Incident Date</Label>
                <Input
                  id="incident_date"
                  type="date"
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Event Narrative *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive narrative of the casualty or event..."
                  required
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Claim
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
                <p className="text-sm text-muted-foreground">Active Claims</p>
                <p className="text-2xl font-bold">{activeCount}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
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
                <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
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
                <p className="text-2xl font-bold text-green-500">{settledCount}</p>
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
          {claims.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No claims filed yet. File your first claim above.</p>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">CLM-{claim.id.slice(0, 8).toUpperCase()}</p>
                      <Badge variant="outline">{claim.claim_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{claim.description?.slice(0, 50) || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-medium">
                        {claim.claim_amount ? `$${claim.claim_amount.toLocaleString()}` : 'TBD'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {claim.incident_date ? format(new Date(claim.incident_date), 'MMM dd, yyyy') : 'No date'}
                      </p>
                    </div>
                    <Badge variant={
                      claim.status === 'settled' ? 'default' :
                        claim.status === 'approved' ? 'secondary' : 'outline'
                    }>
                      {claim.status.replace('_', ' ')}
                    </Badge>
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(claim.id)}
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
  );
};

export default InsuranceClaims;
