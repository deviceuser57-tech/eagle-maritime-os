import { FileText, FileDown, HelpCircle, LifeBuoy, BookOpen, MessageSquare, Terminal, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const GUIDE_PDF = '/guides/Eagle-Maritime-OS-User-Guide.pdf';
const GUIDE_DOCX = '/guides/Eagle-Maritime-OS-User-Guide.docx';

const topics = [
  { icon: BookOpen, title: 'Getting Started', desc: 'Sign-in, interface tour, first 5 minutes.' },
  { icon: HelpCircle, title: 'FAQ', desc: 'Login, permissions, and report generation answers.' },
  { icon: LifeBuoy, title: 'Troubleshooting', desc: 'Symptom matrix and escalation guidance.' },
  { icon: MessageSquare, title: 'Contact Support', desc: 'Reach the Eagle Maritime OS team.' },
];

const HelpCenter = () => {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">Help Center</h2>
        <p className="text-muted-foreground font-medium max-w-2xl">
          Full documentation for Eagle Maritime OS — for end users and organization admins.
          Includes FAQ and troubleshooting for common login, permissions, and report issues.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <a
          href={GUIDE_PDF}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">User Guide (PDF)</h3>
            <p className="text-sm text-muted-foreground mt-1">Open the complete guide in your browser.</p>
            <span className="inline-block mt-3 text-xs font-bold uppercase tracking-widest text-primary group-hover:underline">
              Open PDF →
            </span>
          </div>
        </a>

        <a
          href={GUIDE_DOCX}
          download
          className="group flex items-start gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="p-3 rounded-xl bg-accent/20 text-accent-foreground">
            <FileDown className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">User Guide (DOCX)</h3>
            <p className="text-sm text-muted-foreground mt-1">Download the editable Word document.</p>
            <span className="inline-block mt-3 text-xs font-bold uppercase tracking-widest text-primary group-hover:underline">
              Download DOCX ↓
            </span>
          </div>
        </a>

        <Link
          to="/connect"
          className="group flex items-start gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Connect an AI assistant</h3>
            <p className="text-sm text-muted-foreground mt-1">Link ChatGPT, Claude, or Claude Code to your fleet data via MCP.</p>
            <span className="inline-block mt-3 text-xs font-bold uppercase tracking-widest text-primary group-hover:underline">
              Connect →
            </span>
          </div>
        </Link>

        <Link
          to="/mcp-api"
          className="group flex items-start gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <Terminal className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">MCP API Reference</h3>
            <p className="text-sm text-muted-foreground mt-1">Test the 7 AI tools locally via HTTP.</p>
            <span className="inline-block mt-3 text-xs font-bold uppercase tracking-widest text-primary group-hover:underline">
              View API →
            </span>
          </div>
        </Link>

        <Link
          to="/join"
          className="group flex items-start gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="p-3 rounded-xl bg-accent/20 text-accent-foreground">
            <UserPlus className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Join an organization</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Open your invitation link to connect your account to a client organization and see its records.
            </p>
            <span className="inline-block mt-3 text-xs font-bold uppercase tracking-widest text-primary group-hover:underline">
              Link my account →
            </span>
          </div>
        </Link>
      </section>

      <section>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Inside the guide</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {topics.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
              <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
        <h3 className="font-bold text-foreground mb-2">Quick help</h3>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
          <li>Cannot sign in → use "Forgot Password"; if the reset email is missing, ask your org admin to resend the invite.</li>
          <li>No data appears → confirm you belong to the correct organization (header switcher) and have the right role.</li>
          <li>Report fails to generate → widen the date range and retry; check Reports → History for the finished file.</li>
        </ul>
      </section>
    </div>
  );
};

export default HelpCenter;
