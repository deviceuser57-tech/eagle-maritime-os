import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, FileText, AlertTriangle, Loader2, Plus, ExternalLink } from 'lucide-react';
import { useAudits } from '@/hooks/useAudits';
import { useVesselCertifications } from '@/hooks/useVesselCertifications';

// Standard maritime regulations - these are reference data (static by nature)
const STANDARD_REGULATIONS = [
  { code: 'SOLAS', title: 'Safety of Life at Sea', version: 'Consolidated 2024', category: 'Safety', link: 'https://www.imo.org/en/About/Conventions/Pages/International-Convention-for-the-Safety-of-Life-at-Sea-(SOLAS),-1974.aspx' },
  { code: 'MARPOL', title: 'Marine Pollution', version: 'Annex I-VI 2024', category: 'Environmental', link: 'https://www.imo.org/en/About/Conventions/Pages/International-Convention-for-the-Prevention-of-Pollution-from-Ships-(MARPOL).aspx' },
  { code: 'ISM Code', title: 'International Safety Management', version: '2018 Edition', category: 'Management', link: 'https://www.imo.org/en/OurWork/HumanElement/Pages/ISMCode.aspx' },
  { code: 'ISPS Code', title: 'Ship and Port Facility Security', version: '2003 + Amendments', category: 'Security', link: 'https://www.imo.org/en/OurWork/Security/Pages/SOLAS-XI-2%20ISPS%20Code.aspx' },
  { code: 'MLC 2006', title: 'Maritime Labour Convention', version: '2006 as amended', category: 'Labour', link: 'https://www.ilo.org/global/standards/maritime-labour-convention/lang--en/index.htm' },
  { code: 'STCW', title: 'Standards of Training, Certification and Watchkeeping', version: '2010 Manila Amendments', category: 'Training', link: 'https://www.imo.org/en/OurWork/HumanElement/Pages/STCW-Convention.aspx' },
  { code: 'BWM', title: 'Ballast Water Management', version: '2017 Convention', category: 'Environmental', link: 'https://www.imo.org/en/OurWork/Environment/Pages/BWMConventionandGuidelines.aspx' },
  { code: 'CII/EEXI', title: 'Carbon Intensity Indicator / Energy Efficiency', version: 'MEPC.328(76)', category: 'Environmental', link: 'https://www.imo.org/en/OurWork/Environment/Pages/Technical-and-Operational-Measures.aspx' },
];

const RulesRegulations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { audits, isLoading: auditsLoading } = useAudits();
  const { certifications, loading: certsLoading } = useVesselCertifications();

  const isLoading = auditsLoading || certsLoading;

  // Calculate real stats from database
  const totalRegulations = STANDARD_REGULATIONS.length;
  
  // Check for recent updates based on audit types
  const auditTypes = [...new Set(audits?.map(a => a.audit_type) || [])];
  const recentAudits = audits?.filter(a => {
    const date = new Date(a.scheduled_date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return date > threeMonthsAgo;
  }) || [];

  // Calculate compliance rate based on completed audits and valid certs
  const completedAudits = audits?.filter(a => a.status === 'completed') || [];
  const validCerts = certifications?.filter(c => c.status === 'valid') || [];
  const totalItems = (audits?.length || 0) + (certifications?.length || 0);
  const compliantItems = completedAudits.length + validCerts.length;
  const complianceRate = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 100;

  // Filter regulations based on search
  const filteredRegulations = STANDARD_REGULATIONS.filter(reg => 
    searchQuery === '' ||
    reg.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add updates count based on recent audit activity
  const regulationsWithUpdates = filteredRegulations.map(reg => {
    const relatedAudits = recentAudits.filter(a => 
      a.audit_type?.toLowerCase().includes(reg.code.toLowerCase()) ||
      a.audit_type?.toLowerCase().includes(reg.category.toLowerCase())
    );
    return {
      ...reg,
      updates: relatedAudits.length,
    };
  });

  const totalUpdates = regulationsWithUpdates.reduce((sum, reg) => sum + reg.updates, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading regulations data...</span>
      </div>
    );
  }

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
                <p className="text-2xl font-bold">{totalRegulations}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Activity</p>
                <p className={`text-2xl font-bold ${totalUpdates > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                  {totalUpdates}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${totalUpdates > 0 ? 'text-orange-500' : 'text-green-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">
                  {[...new Set(STANDARD_REGULATIONS.map(r => r.category))].length}
                </p>
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
                <p className={`text-2xl font-bold ${complianceRate >= 90 ? 'text-green-500' : 'text-orange-500'}`}>
                  {complianceRate}%
                </p>
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
            <Input 
              placeholder="Search by code, title, or keyword..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Key Maritime Regulations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regulationsWithUpdates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No regulations match your search criteria.
              </div>
            ) : (
              regulationsWithUpdates.map((reg, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{reg.code} - {reg.title}</p>
                    <p className="text-sm text-muted-foreground">{reg.version}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{reg.category}</Badge>
                    {reg.updates > 0 && (
                      <Badge variant="secondary">{reg.updates} recent audits</Badge>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(reg.link, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RulesRegulations;
