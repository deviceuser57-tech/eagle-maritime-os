import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const Sidebar = ({ activeSection, onSectionChange, theme, onThemeToggle }: SidebarProps) => {
  const navigationSections = [
    {
      title: "Core System & AI Support",
      items: [
        { id: "dashboard", label: "📊 Dashboard", badge: null },
        { id: "ai-assistant", label: "✨ AI Assistant", badge: null },
        { id: "user-auth", label: "🔒 User Auth", badge: null }
      ]
    },
    {
      title: "Initial Configuration", 
      items: [
        { id: "setup", label: "🛠️ Setup", badge: null },
        { id: "vessel-management", label: "⚓ Vessels", badge: null },
        { id: "vessels-certification", label: "📜 Vessel Certification", badge: null },
        { id: "crew-management", label: "👨‍✈️ Crew", badge: null },
        { id: "auditor-management", label: "🧑‍💻 Auditors", badge: null },
        { id: "rules-regulations", label: "📜 Rules & Regs", badge: null }
      ]
    },
    {
      title: "CII Calculator",
      items: [
        { id: "cii-dashboard", label: "🚢 CII Dashboard", badge: null }
      ]
    },
    {
      title: "Operations & Maintenance",
      items: [
        { id: "operations", label: "🛥️ Operations", badge: null },
        { id: "maintenance", label: "🛠️ Maintenance", badge: null },
        { id: "maintenance-planner", label: "📅 Maintenance Planner", badge: null },
        { id: "layout-mapper", label: "🗺️ Layout Mapper", badge: null }
      ]
    },
    {
      title: "Audit Lifecycle",
      items: [
        { id: "projects", label: "📈 Projects", badge: "3" },
        { id: "audit-plan", label: "🗓️ Audit Plan", badge: null },
        { id: "audit-execution", label: "✍️ Audit Execution", badge: "2" },
        { id: "audit-findings", label: "📝 Audit Findings", badge: null },
        { id: "corrective-action", label: "⚙️ Corrective Actions", badge: null },
        { id: "interactive-closure", label: "✅ Interactive Closure", badge: null }
      ]
    },
    {
      title: "Incident Management",
      items: [
        { id: "incidents", label: "🚨 Incidents", badge: null },
        { id: "communications", label: "💬 Communications", badge: null }
      ]
    },
    {
      title: "Safety & Compliance",
      items: [
        { id: "sms", label: "🛡️ Safety Management", badge: null },
        { id: "digital-compliance", label: "✅ Digital Compliance", badge: null }
      ]
    },
    {
      title: "Insurance",
      items: [
        { id: "insurance-claims", label: "📋 Claim Management", badge: null }
      ]
    },
    {
      title: "Reporting & Oversight",
      items: [
        { id: "reports", label: "📄 Reports", badge: null },
        { id: "sim-dashboard", label: "📁 SIM Dashboard", badge: null }
      ]
    },
    {
      title: "Advanced Intelligence",
      items: [
        { id: "predictive-compliance", label: "🔮 Predictive Compliance", badge: null },
        { id: "motion-risk-analyzer", label: "🌊 Motion Risk Analyzer", badge: null },
        { id: "digital-twin", label: "🧬 Digital Twin", badge: null }
      ]
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 maritime-sidebar flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">EAGLE CAR'S</h1>
          <p className="text-sm text-blue-200">Compliance Mgt.</p>
        </div>
        <button 
          onClick={onThemeToggle}
          className="p-2 rounded-full text-blue-200 hover:bg-white/10 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="px-3 text-xs font-semibold uppercase text-blue-200 tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`maritime-nav-link w-full text-left group ${
                    activeSection === item.id ? 'active' : ''
                  }`}
                >
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;