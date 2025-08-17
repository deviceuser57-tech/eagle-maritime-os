import { useState, useEffect } from 'react';
import FrontPage from '@/components/FrontPage';
import Sidebar from '@/components/Sidebar';
import UniversalSearch from '@/components/UniversalSearch';
import Dashboard from '@/components/Dashboard';
import AIAssistant from '@/components/AIAssistant';
import SetupPage from '@/components/SetupPage';
import VesselManagement from '@/components/VesselManagement';

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
      case 'dashboard':
        return <Dashboard />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'setup':
        return <SetupPage />;
      case 'vessel-management':
        return <VesselManagement />;
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace('-', ' ')}
            </h2>
            <p className="text-muted-foreground">
              This section is under development. More features coming soon!
            </p>
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
