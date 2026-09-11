import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useVessels } from '@/hooks/useVessels';
import { useAudits } from '@/hooks/useAudits';
import { useIncidents } from '@/hooks/useIncidents';
import { useVesselCertifications } from '@/hooks/useVesselCertifications';
import { useCorrectiveActions } from '@/hooks/useCorrectiveActions';
import { useCrewMembers } from '@/hooks/useCrewMembers';
import { differenceInDays } from 'date-fns';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const { vessels } = useVessels();
  const { audits } = useAudits();
  const { incidents } = useIncidents();
  const { certifications } = useVesselCertifications();
  const { correctiveActions } = useCorrectiveActions();
  const { crewMembers } = useCrewMembers();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your fleet compliance assistant. I have access to your real-time fleet data. Ask me about vessels, audits, certificates, crew, or any compliance concerns.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Vessel queries
    if (lowerQuery.includes('vessel') || lowerQuery.includes('ship') || lowerQuery.includes('fleet')) {
      const activeVessels = vessels.filter(v => v.status === 'active').length;
      const maintenanceVessels = vessels.filter(v => v.status === 'maintenance' || v.status === 'drydock').length;
      
      if (lowerQuery.includes('how many') || lowerQuery.includes('total')) {
        return `Your fleet consists of ${vessels.length} vessels:\n• ${activeVessels} active\n• ${maintenanceVessels} in maintenance/drydock\n• ${vessels.length - activeVessels - maintenanceVessels} other status\n\nWould you like details on specific vessels or their compliance status?`;
      }
      
      if (lowerQuery.includes('list') || lowerQuery.includes('show')) {
        if (vessels.length === 0) {
          return 'No vessels found in your fleet. You can add vessels in the Vessel Management section.';
        }
        const vesselList = vessels.slice(0, 5).map(v => `• ${v.name} (${v.vessel_type || 'Type N/A'}) - ${v.status || 'Active'}`).join('\n');
        return `Here are your vessels:\n${vesselList}${vessels.length > 5 ? `\n\n...and ${vessels.length - 5} more vessels.` : ''}`;
      }
      
      return `Your fleet has ${vessels.length} vessels with ${activeVessels} currently active. I can provide details on specific vessels, their compliance status, or upcoming inspections. What would you like to know?`;
    }
    
    // Certificate/Compliance queries
    if (lowerQuery.includes('compliance') || lowerQuery.includes('certificate') || lowerQuery.includes('expir')) {
      const today = new Date();
      const expiringCerts = certifications.filter(c => {
        const daysLeft = differenceInDays(new Date(c.expiry_date), today);
        return daysLeft <= 30 && daysLeft > 0;
      });
      const expiredCerts = certifications.filter(c => new Date(c.expiry_date) < today);
      const validCerts = certifications.filter(c => new Date(c.expiry_date) > today);
      const complianceRate = certifications.length > 0 
        ? Math.round((validCerts.length / certifications.length) * 100) 
        : 100;

      if (lowerQuery.includes('expir')) {
        if (expiringCerts.length === 0 && expiredCerts.length === 0) {
          return 'Great news! No certificates are expiring within the next 30 days and none have expired.';
        }
        const certList = expiringCerts.slice(0, 5).map(c => {
          const daysLeft = differenceInDays(new Date(c.expiry_date), today);
          return `• ${c.certificate_name} - ${daysLeft} days remaining`;
        }).join('\n');
        return `Certificate Status:\n• ${expiredCerts.length} expired\n• ${expiringCerts.length} expiring within 30 days\n\nExpiring soon:\n${certList || 'None'}`;
      }

      return `Fleet Compliance Overview:\n• Compliance Rate: ${complianceRate}%\n• Valid Certificates: ${validCerts.length}\n• Expiring (30 days): ${expiringCerts.length}\n• Expired: ${expiredCerts.length}\n\nWould you like to see specific certificates or vessels needing attention?`;
    }
    
    // Audit/Findings queries
    if (lowerQuery.includes('audit') || lowerQuery.includes('finding') || lowerQuery.includes('inspection')) {
      const scheduledAudits = audits.filter(a => a.status === 'scheduled').length;
      const completedAudits = audits.filter(a => a.status === 'completed').length;
      const inProgressAudits = audits.filter(a => a.status === 'in_progress').length;
      const openActions = correctiveActions.filter(a => a.status !== 'completed').length;
      const overdueActions = correctiveActions.filter(a => {
        if (!a.due_date || a.status === 'completed') return false;
        return new Date(a.due_date) < new Date();
      }).length;

      if (lowerQuery.includes('finding') || lowerQuery.includes('corrective') || lowerQuery.includes('action')) {
        return `Findings & Corrective Actions:\n• Open Actions: ${openActions}\n• Overdue: ${overdueActions}\n• Completed: ${correctiveActions.filter(a => a.status === 'completed').length}\n\nI can help prioritize actions or show details for specific vessels.`;
      }

      return `Audit Overview:\n• Scheduled: ${scheduledAudits}\n• In Progress: ${inProgressAudits}\n• Completed: ${completedAudits}\n• Open Corrective Actions: ${openActions}\n\nWould you like to see upcoming audits or outstanding findings?`;
    }
    
    // Crew queries
    if (lowerQuery.includes('crew') || lowerQuery.includes('training') || lowerQuery.includes('seafarer')) {
      const activeCrew = crewMembers.filter(c => c.status === 'active').length;
      const expiringCerts = crewMembers.filter(c => {
        if (!c.certificate_expiry) return false;
        const daysLeft = differenceInDays(new Date(c.certificate_expiry), new Date());
        return daysLeft <= 30 && daysLeft > 0;
      }).length;

      return `Crew Overview:\n• Total Crew: ${crewMembers.length}\n• Active: ${activeCrew}\n• Certificates expiring (30 days): ${expiringCerts}\n\nI can provide details on specific crew members, training requirements, or certification status.`;
    }
    
    // Incident queries
    if (lowerQuery.includes('incident') || lowerQuery.includes('accident') || lowerQuery.includes('safety')) {
      const pendingIncidents = incidents.filter(i => i.investigation_status === 'pending').length;
      const criticalIncidents = incidents.filter(i => i.severity === 'critical' || i.severity === 'major').length;

      return `Safety & Incidents:\n• Total Incidents: ${incidents.length}\n• Pending Investigation: ${pendingIncidents}\n• Critical/Major: ${criticalIncidents}\n\nWould you like details on specific incidents or safety trends?`;
    }

    // Summary/Dashboard query
    if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('dashboard') || lowerQuery.includes('status')) {
      const validCerts = certifications.filter(c => new Date(c.expiry_date) > new Date()).length;
      const complianceRate = certifications.length > 0 
        ? Math.round((validCerts / certifications.length) * 100) 
        : 100;
      
      return `Fleet Summary:\n\n📊 Fleet: ${vessels.length} vessels (${vessels.filter(v => v.status === 'active').length} active)\n\n📋 Compliance: ${complianceRate}% (${validCerts}/${certifications.length} valid)\n\n🔍 Audits: ${audits.filter(a => a.status === 'in_progress').length} in progress, ${correctiveActions.filter(a => a.status !== 'completed').length} open actions\n\n👥 Crew: ${crewMembers.length} members\n\n⚠️ Incidents: ${incidents.filter(i => i.investigation_status === 'pending').length} pending investigation`;
    }

    // Default response
    return `I can help you with:\n• Fleet status and vessel details\n• Certificate compliance and expiration tracking\n• Audit schedules and findings\n• Crew certifications and training\n• Incident reports and investigations\n\nJust ask about any specific area you'd like to explore!`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate processing delay for better UX
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getAIResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground mb-2">AI Assistant</h2>
        <p className="text-muted-foreground">
          Your intelligent partner for navigating fleet data and compliance insights in real-time.
        </p>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Fleet Compliance Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Chat Window */}
          <div className="h-96 overflow-y-auto p-4 bg-muted/50 rounded-lg mb-4 border space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg rounded-lg px-4 py-2 flex items-start space-x-2 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  {message.type === 'bot' && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                  <span className="text-sm whitespace-pre-line">{message.content}</span>
                  {message.type === 'user' && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background border rounded-lg px-4 py-2 flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Analyzing data...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about vessels, certificates, audits, crew..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          onClick={() => setInput('Show me vessels with expiring certificates')}
        >
          <div className="text-2xl">📋</div>
          <span className="text-sm">Certificate Status</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          onClick={() => setInput('What is the current audit status?')}
        >
          <div className="text-2xl">🔍</div>
          <span className="text-sm">Audit Overview</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          onClick={() => setInput('Give me a fleet summary')}
        >
          <div className="text-2xl">📊</div>
          <span className="text-sm">Fleet Summary</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center space-y-2"
          onClick={() => setInput('Show crew certification status')}
        >
          <div className="text-2xl">👥</div>
          <span className="text-sm">Crew Status</span>
        </Button>
      </div>
    </div>
  );
};

export default AIAssistant;
