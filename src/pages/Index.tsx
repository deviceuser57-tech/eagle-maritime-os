import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
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
import SIMDashboard from '@/components/SIMDashboard';
import LayoutMapper from '@/components/LayoutMapper';
import PredictiveCompliance from '@/components/PredictiveCompliance';
import MotionRiskAnalyzer from '@/components/MotionRiskAnalyzer';
import DigitalTwin from '@/components/DigitalTwin';
import IntegrationSettings from '@/components/IntegrationSettings';
import Organization from '@/components/Organization';
import HelpCenter from '@/components/HelpCenter';

const IndexContent = () => {
  const { user, loading, signOut } = useAuth();
  const [showFrontPage, setShowFrontPage] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      case 'dashboard': return <Dashboard onSectionChange={setActiveSection} />;
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
      case 'sim-dashboard': return <SIMDashboard />;
      case 'layout-mapper': return <LayoutMapper />;
      case 'predictive-compliance': return <PredictiveCompliance />;
      case 'motion-risk-analyzer': return <MotionRiskAnalyzer />;
      case 'digital-twin': return <DigitalTwin />;
      case 'integrations': return <IntegrationSettings />;
      case 'organization': return <Organization />;
      case 'help-center': return <HelpCenter />;
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tighter text-foreground mb-2 uppercase">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace(/-/g, ' ')}
            </h2>
            <p className="text-muted-foreground font-medium">This section is currently being integrated into the maritime node.</p>
          </div>);

    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6 shadow-glow"></div>
          <p className="text-foreground text-sm font-black uppercase tracking-[0.3em] animate-pulse">Syncing Vessel Core...</p>
        </div>
      </div>);

  }

  // Show front page if user hasn't clicked "Enter Dashboard"
  if (showFrontPage) {
    return <FrontPage onEnterDashboard={handleEnterDashboard} />;
  }

  // Require authentication - users must login/signup
  if (!user) {
    return (
      <AuthPage
        onAuthSuccess={() => {
          console.log("Authentication secure. Access granted.");
        }} />);
  }

  // Main app - user is authenticated
  return (
    <div className="flex h-screen bg-background overflow-hidden preserve-3d">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        userEmail={user?.email || 'trial@eagle-platform.com'}
        onSignOut={handleSignOut}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)} />


      <main className="flex-1 overflow-y-auto relative scrollbar-hide bg-background">
        {/* Background Decorative Element */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center gap-4 mb-8 lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="p-3 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-md border border-border/50 text-foreground"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-black tracking-tight text-primary">EAGLE</h1>
            </div>
            <UniversalSearch onSearch={handleSearch} />
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>);

};

const Index = () => {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>);

};

export default Index;