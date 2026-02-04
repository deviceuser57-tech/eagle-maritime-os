import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import FrontPage from '@/components/FrontPage';
import Sidebar from '@/components/Sidebar';
import UniversalSearch from '@/components/UniversalSearch';
import Dashboard from '@/components/Dashboard';
import AIAssistant from '@/components/AIAssistant';
import SetupPage from '@/components/SetupPage';
import VesselManagement from '@/components/VesselManagement';
import AuthPage from '@/components/AuthPage';
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
import Reports from '@/components/Reports';

const IndexContent = () => {
  const { user, loading, signOut } = useAuth();
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
    // If user is authenticated, go to dashboard
    // If not, they'll be redirected to auth page
    setShowFrontPage(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowFrontPage(true);
    setActiveSection('dashboard');
  };

  const handleSearch = (query: string) => {
    console.log('Search:', query);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'ai-assistant': return <AIAssistant />;
      case 'user-auth': return <AuthPage />;
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
      case 'reports': return <Reports />;
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show front page if user hasn't clicked "Enter Dashboard"
  if (showFrontPage) {
    return <FrontPage onEnterDashboard={handleEnterDashboard} />;
  }

  // If user is not authenticated, show auth page
  if (!user) {
    return (
      <AuthPage 
        onAuthSuccess={() => {
          // User successfully authenticated, they'll now see the dashboard
        }} 
      />
    );
  }

  // User is authenticated, show the main app
  return (
    <div className="flex h-screen">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        userEmail={user.email}
        onSignOut={handleSignOut}
      />
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <UniversalSearch onSearch={handleSearch} />
        {renderContent()}
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
};

export default Index;
