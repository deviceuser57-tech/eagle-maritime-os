import { useState } from 'react';
import { Moon, Sun, LogOut, User } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  userEmail?: string;
  onSignOut?: () => void;
}

const Sidebar = ({ activeSection, onSectionChange, theme, onThemeToggle, userEmail, onSignOut }: SidebarProps) => {
  const [_] = useState(false);

  const navigationSections = [
    {
      title: "Core System & AI Support",
      items: [
        { id: "dashboard", label: "📊 Dashboard", badge: null },
        { id: "ai-assistant", label: "✨ AI Assistant", badge: null },
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
      title: "Connectivity & API",
      items: [
        { id: "integrations", label: "🔗 External Integrations", badge: null }
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
    <aside className="w-72 flex-shrink-0 maritime-sidebar flex flex-col h-screen shadow-2xl z-40">
      {/* Header */}
      <div className="p-8 border-b border-border space-y-6 bg-white/10 dark:bg-white/5 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-primary to-blue-600 bg-clip-text text-transparent">
              EAGLE PLATFORM
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Vessel Governance System
            </p>
          </div>
          <button
            onClick={onThemeToggle}
            className="p-2.5 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 shadow-sm"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* App Title Only */}
      </div>

      {/* User Info */}
      {userEmail && (
        <div className="px-6 py-4 border-b border-border bg-muted/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{userEmail.split('@')[0]}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Node</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-2">
            <h3 className="px-4 text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.25em]">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`maritime-nav-link w-full text-left group gap-3 ${activeSection === item.id ? 'active' : ''
                    }`}
                >
                  <span className="flex-1 truncate group-hover:translate-x-1 transition-transform">{item.label}</span>
                  {item.badge && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign Out Button */}
      {onSignOut && (
        <div className="p-6 border-t border-border bg-muted/10 mt-auto">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-destructive hover:bg-destructive/10 transition-all duration-300 font-bold text-sm shadow-sm group"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Terminate Session</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
