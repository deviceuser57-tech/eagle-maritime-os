import { useState, useEffect } from 'react';
import FrontPage from '@/components/FrontPage';
import Sidebar from '@/components/Sidebar';
import UniversalSearch from '@/components/UniversalSearch';
import Dashboard from '@/components/Dashboard';
import AIAssistant from '@/components/AIAssistant';
import SetupPage from '@/components/SetupPage';
import VesselManagement from '@/components/VesselManagement';
import UserAuth from '@/components/UserAuth';
import VesselsCertification from '@/components/VesselsCertification';
import CrewManagement from '@/components/CrewManagement';
import AuditorManagement from '@/components/AuditorManagement';
import RulesRegulations from '@/components/RulesRegulations';
import CIIDashboard from '@/components/CIIDashboard';
import Operations from '@/components/Operations';
import Maintenance from '@/components/Maintenance';
import Projects from '@/components/Projects';
import AuditPlan from '@/components/AuditPlan';
import AuditExecution from '@/components/AuditExecution';
import AuditFindings from '@/components/AuditFindings';
import CorrectiveAction from '@/components/CorrectiveAction';
import InteractiveClosure from '@/components/InteractiveClosure';
import Incidents from '@/components/Incidents';
import Communications from '@/components/Communications';
import SafetyManagement from '@/components/SafetyManagement';
import DigitalCompliance from '@/components/DigitalCompliance';
import InsuranceClaims from '@/components/InsuranceClaims';

const Index = () => {
  const [showFrontPage, setShowFrontPage] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleEnterDashboard = () => {
    setShowFrontPage(false);
  };

  const handleSearch = (query: string) => {
    console.log('Search:', query);
    // Implement search functionality
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'ai-assistant': return <AIAssistant />;
      case 'user-auth': return <UserAuth />;
      case 'setup': return <SetupPage />;
      case 'vessel-management': return <VesselManagement />;
      case 'vessels-certification': return <VesselsCertification />;
      case 'crew-management': return <CrewManagement />;
      case 'auditor-management': return <AuditorManagement />;
      case 'rules-regulations': return <RulesRegulations />;
      case 'cii-dashboard': return <CIIDashboard />;
      case 'operations': return <Operations />;
      case 'maintenance': return <Maintenance />;
      case 'projects': return <Projects />;
      case 'audit-plan': return <AuditPlan />;
      case 'audit-execution': return <AuditExecution />;
      case 'audit-findings': return <AuditFindings />;
      case 'corrective-action': return <CorrectiveAction />;
      case 'interactive-closure': return <InteractiveClosure />;
      case 'incidents': return <Incidents />;
      case 'communications': return <Communications />;
      case 'sms': return <SafetyManagement />;
      case 'digital-compliance': return <DigitalCompliance />;
      case 'insurance-claims': return <InsuranceClaims />;
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace(/-/g, ' ')}
            </h2>
            <p className="text-muted-foreground">This section is under development.</p>
          </div>
        );
    }
  };

  if (showFrontPage) {
    return <FrontPage onEnterDashboard={handleEnterDashboard} />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <UniversalSearch onSearch={handleSearch} />
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
