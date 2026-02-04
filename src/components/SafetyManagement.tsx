import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Users, TrendingUp, Loader2 } from 'lucide-react';
import { useAudits } from '@/hooks/useAudits';
import { useIncidents } from '@/hooks/useIncidents';
import { useCrewMembers } from '@/hooks/useCrewMembers';

const SafetyManagement = () => {
  const { audits, isLoading: auditsLoading } = useAudits();
  const { incidents, isLoading: incidentsLoading } = useIncidents();
  const { crewMembers, isLoading: crewLoading } = useCrewMembers();

  const isLoading = auditsLoading || incidentsLoading || crewLoading;

  // Calculate real stats from database
  const completedAudits = audits?.filter(a => a.status === 'completed') || [];
  const totalAudits = audits?.length || 0;
  const complianceScore = totalAudits > 0 
    ? Math.round((completedAudits.length / totalAudits) * 100) 
    : 0;

  const activeCrewCount = crewMembers?.filter(c => c.status === 'active').length || 0;

  // Calculate safety improvement (comparing recent incidents)
  const recentIncidents = incidents?.filter(i => {
    const date = new Date(i.incident_date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return date > threeMonthsAgo;
  }) || [];

  const olderIncidents = incidents?.filter(i => {
    const date = new Date(i.incident_date);
    const sixMonthsAgo = new Date();
    const threeMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return date > sixMonthsAgo && date <= threeMonthsAgo;
  }) || [];

  const safetyImprovement = olderIncidents.length > 0
    ? Math.round(((olderIncidents.length - recentIncidents.length) / olderIncidents.length) * 100)
    : 0;

  // Build SMS elements from real data
  const smsElements = [
    { 
      element: 'Safety Policy', 
      status: completedAudits.length > 0 ? 'Current' : 'Review Due', 
      lastReview: completedAudits[0]?.completed_date || 'Not reviewed',
      nextReview: 'In 6 months'
    },
    { 
      element: 'Risk Assessment', 
      status: incidents?.length === 0 || recentIncidents.length < olderIncidents.length ? 'Current' : 'Action Required', 
      lastReview: incidents?.[0]?.incident_date ? new Date(incidents[0].incident_date).toLocaleDateString() : 'No data',
      nextReview: 'Quarterly'
    },
    { 
      element: 'Emergency Procedures', 
      status: audits?.some(a => a.audit_type?.toLowerCase().includes('emergency')) ? 'Current' : 'Review Due', 
      lastReview: 'Based on audits',
      nextReview: 'Annual'
    },
    { 
      element: 'Training Matrix', 
      status: activeCrewCount > 0 ? 'Current' : 'Needs Update', 
      lastReview: crewMembers?.[0]?.updated_at ? new Date(crewMembers[0].updated_at).toLocaleDateString() : 'No data',
      nextReview: 'Quarterly'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading safety data...</span>
      </div>
    );
  }

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
                <p className="text-2xl font-bold">{complianceScore}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Audits</p>
                <p className="text-2xl font-bold">{completedAudits.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Crew</p>
                <p className="text-2xl font-bold">{activeCrewCount}</p>
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
                <p className={`text-2xl font-bold ${safetyImprovement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {safetyImprovement >= 0 ? '+' : ''}{safetyImprovement}%
                </p>
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
          {smsElements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No SMS elements configured. Add audits and incidents to populate this section.
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyManagement;
