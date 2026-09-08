import { useEffect, useRef } from 'react';
import {
  Moon,
  Sun,
  LogOut,
  User,
  X,
  LayoutDashboard,
  Sparkles,
  Building2,
  HelpCircle,
  Settings2,
  Anchor,
  FileBadge,
  Users,
  UserCog,
  BookOpen,
  Ship,
  Wrench,
  Map,
  FolderKanban,
  CalendarDays,
  ClipboardCheck,
  FileSearch,
  Cog,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Shield,
  CheckSquare,
  FileText,
  BarChart3,
  Lock,
  ScrollText,
  Eye,
  Waves,
  Radar,
  Binary,
  Cpu
} from 'lucide-react';
import eagleLogo from '@/assets/eagle-maritime-logo.png';
import gsap from 'gsap';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  userEmail?: string;
  onSignOut?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({
  activeSection,
  onSectionChange,
  theme,
  onThemeToggle,
  userEmail,
  onSignOut,
  isOpen,
  onToggle
}: SidebarProps) => {
  const sidebarRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const navigationSections = [
    {
      title: 'Core System & AI',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: null },
        { id: 'organization', label: 'Organization', icon: Building2, badge: null },
        { id: 'help-center', label: 'Help Center', icon: HelpCircle, badge: null }
      ]
    },
    {
      title: 'Initial Configuration',
      items: [
        { id: 'setup', label: 'Platform Setup', icon: Settings2, badge: null },
        { id: 'vessel-management', label: 'Vessels', icon: Anchor, badge: null },
        { id: 'vessels-certification', label: 'Vessel Certification', icon: FileBadge, badge: null },
        { id: 'crew-management', label: 'Crew', icon: Users, badge: null },
        { id: 'auditor-management', label: 'Auditors', icon: UserCog, badge: null },
        { id: 'rules-regulations', label: 'Rules & Regs', icon: BookOpen, badge: null }
      ]
    },
    {
      title: 'CII Calculator',
      items: [
        { id: 'cii-dashboard', label: 'CII Dashboard', icon: Ship, badge: null }
      ]
    },
    {
      title: 'Operations & Maintenance',
      items: [
        { id: 'operations', label: 'Operations', icon: Ship, badge: null },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench, badge: null },
        { id: 'layout-mapper', label: 'Layout Mapper', icon: Map, badge: null }
      ]
    },
    {
      title: 'Audit Lifecycle',
      items: [
        { id: 'projects', label: 'Projects', icon: FolderKanban, badge: '3' },
        { id: 'audit-plan', label: 'Audit Plan', icon: CalendarDays, badge: null },
        { id: 'audit-execution', label: 'Audit Execution', icon: ClipboardCheck, badge: '2' },
        { id: 'audit-findings', label: 'Audit Findings', icon: FileSearch, badge: null },
        { id: 'corrective-action', label: 'Corrective Actions', icon: Cog, badge: null },
        { id: 'interactive-closure', label: 'Interactive Closure', icon: CheckCircle, badge: null }
      ]
    },
    {
      title: 'Incident Management',
      items: [
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle, badge: null },
        { id: 'communications', label: 'Communications', icon: MessageSquare, badge: null }
      ]
    },
    {
      title: 'Safety & Compliance',
      items: [
        { id: 'sms', label: 'Safety Management', icon: Shield, badge: null },
        { id: 'digital-compliance', label: 'Digital Compliance', icon: CheckSquare, badge: null }
      ]
    },
    {
      title: 'Insurance',
      items: [
        { id: 'insurance-claims', label: 'Claim Management', icon: FileText, badge: null }
      ]
    },
    {
      title: 'Connectivity & API',
      items: [
        { id: 'integrations', label: 'External Integrations', icon: Radar, badge: null }
      ]
    },
    {
      title: 'Reporting & Oversight',
      items: [
        { id: 'reports', label: 'Reports', icon: BarChart3, badge: null },
        { id: 'sim-dashboard', label: 'SIM Dashboard', icon: ScrollText, badge: null }
      ]
    },
    {
      title: 'Security & Governance',
      items: [
        { id: 'security-posture', label: 'Security Posture', icon: Lock, badge: null },
        { id: 'enterprise-audit-log', label: 'Enterprise Audit Log', icon: Eye, badge: null }
      ]
    },
    {
      title: 'Advanced Intelligence',
      items: [
        { id: 'predictive-compliance', label: 'Predictive Compliance', icon: Waves, badge: null },
        { id: 'motion-risk-analyzer', label: 'Motion Risk Analyzer', icon: Binary, badge: null },
        { id: 'digital-twin', label: 'Digital Twin', icon: Cpu, badge: null }
      ]
    }
  ];

  useEffect(() => {
    if (!sidebarRef.current) return;

    const ctx = gsap.context(() => {
      // Header entrance
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      // Section titles and nav links staggered entrance
      const sectionEls = sectionsRef.current?.querySelectorAll('.nav-section');
      if (sectionEls) {
        gsap.fromTo(
          sectionEls,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            delay: 0.2
          }
        );
      }

      // Footer entrance
      if (footerRef.current) {
        gsap.fromTo(
          footerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.6 }
        );
      }
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  const handleItemClick = (id: string) => {
    onSectionChange(id);
    if (window.innerWidth < 1024) onToggle();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    gsap.to(target, {
      x: 4,
      duration: 0.25,
      ease: 'power2.out'
    });
    const icon = target.querySelector('.nav-icon');
    if (icon) {
      gsap.to(icon, {
        rotate: 8,
        scale: 1.1,
        duration: 0.3,
        ease: 'back.out(1.7)'
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    gsap.to(target, {
      x: 0,
      duration: 0.25,
      ease: 'power2.out'
    });
    const icon = target.querySelector('.nav-icon');
    if (icon) {
      gsap.to(icon, {
        rotate: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-all duration-500"
          onClick={onToggle}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed lg:static inset-y-0 left-0 w-72 flex-shrink-0 maritime-sidebar-glass flex flex-col h-screen z-50 transition-all duration-500 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Decorative top glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div
          ref={headerRef}
          className="relative p-6 border-b border-border/50 bg-gradient-to-b from-white/60 to-transparent dark:from-white/5 dark:to-transparent backdrop-blur-md"
        >
          <div className="flex justify-between items-start">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-accent/30 blur-xl opacity-60" />
                <img
                  src={eagleLogo}
                  alt="Eagle Maritime OS"
                  className="relative h-14 w-14 object-contain drop-shadow-lg"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-black tracking-tight bg-gradient-to-br from-primary to-accent-foreground bg-clip-text text-transparent leading-tight">
                  EAGLE
                  <br />
                  MARITIME OS
                </h1>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
                  Vessel Governance
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onThemeToggle}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className="p-2 rounded-xl bg-secondary/60 text-foreground hover:bg-accent/20 hover:text-accent-foreground transition-all duration-300 shadow-sm"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={onToggle}
                aria-label="Close navigation menu"
                className="lg:hidden p-2 rounded-xl bg-secondary/60 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        {userEmail && (
          <div className="px-5 py-4 border-b border-border/50 bg-secondary/20">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
                <div className="absolute inset-0 bg-accent/20" />
                <User className="h-5 w-5 text-primary-foreground relative z-10" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{userEmail.split('@')[0]}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Active Node
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          ref={sectionsRef}
          className="flex-1 overflow-y-auto px-3 py-5 space-y-6 scrollbar-hide"
        >
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section space-y-2">
              <h3 className="font-black uppercase text-muted-foreground/60 tracking-[0.22em] text-[10px] px-3 py-1">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      className={`maritime-nav-link-v2 ${isActive ? 'active' : ''}`}
                    >
                      <span className="nav-icon relative z-10 flex items-center justify-center w-7 h-7 rounded-lg bg-secondary/60 text-foreground/80 transition-colors">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="relative z-10 flex-1 truncate text-left">{item.label}</span>
                      {item.badge && (
                        <span className="relative z-10 bg-accent text-accent-foreground text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer / Sign Out */}
        {onSignOut && (
          <div ref={footerRef} className="p-4 border-t border-border/50 bg-secondary/10 mt-auto">
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-300 font-bold text-xs uppercase tracking-wider group"
            >
              <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Terminate Session</span>
            </button>
          </div>
        )}

        {/* Bottom wave decoration */}
        <div className="wave-decoration opacity-[0.06]" />
      </aside>
    </>
  );
};

export default Sidebar;
