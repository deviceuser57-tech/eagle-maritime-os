import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Terminal, ShieldCheck } from 'lucide-react';

type ToolDoc = {
  name: string;
  title: string;
  description: string;
  readOnly: boolean;
  args: Record<string, unknown>;
};

const TOOLS: ToolDoc[] = [
  {
    name: 'fleet_compliance_summary',
    title: 'Fleet compliance summary',
    description:
      'Summarize fleet compliance: vessel count, certificates expired or expiring within 90 days, and open incidents.',
    readOnly: true,
    args: {},
  },
  {
    name: 'list_vessels',
    title: 'List vessels',
    description: "List vessels in the signed-in user's organization fleet, optionally filtered by name or IMO number.",
    readOnly: true,
    args: { search: 'EAGLE', limit: 25 },
  },
  {
    name: 'get_vessel_profile',
    title: 'Get vessel profile',
    description: 'Full profile for one vessel: particulars, certificates, recent audits and incidents.',
    readOnly: true,
    args: { vessel_id: '00000000-0000-0000-0000-000000000000' },
  },
  {
    name: 'list_expiring_certificates',
    title: 'List expiring certificates',
    description: 'Certificates expiring inside a look-ahead window, optionally restricted to one vessel.',
    readOnly: true,
    args: { within_days: 90 },
  },
  {
    name: 'list_audit_findings',
    title: 'List audit findings',
    description: 'Audit findings for the organization, optionally restricted to a single vessel.',
    readOnly: true,
    args: { limit: 25 },
  },
  {
    name: 'list_incidents',
    title: 'List incidents',
    description: 'Reported incidents for the organization, optionally restricted to a single vessel.',
    readOnly: true,
    args: { limit: 25 },
  },
  {
    name: 'report_incident',
    title: 'Report an incident',
    description: 'Create a new incident record for the signed-in user’s organization.',
    readOnly: false,
    args: {
      title: 'Main engine oil leak',
      incident_type: 'machinery',
      incident_date: '2026-08-20',
    },
  },
];

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 text-xs leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        aria-label="Copy code"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute top-2 right-2 p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary transition-colors"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

const McpApi = () => {
  const base = useMemo(() => {
    const ref = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
    return `https://${ref ?? 'project-ref'}.supabase.co/functions/v1/mcp`;
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to app
        </Link>

        <header className="space-y-3">
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">MCP API reference</h1>
          <p className="text-muted-foreground font-medium">
            Eagle-Maritime COG. OS exposes seven agent tools over the Model Context Protocol. Use this page to test the
            tools with plain HTTP before handing the endpoint to any client (ChatGPT, Claude, Cursor, Lovable).
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Endpoint</h2>
          <CodeBlock code={base} />
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              The server is protected with OAuth 2.1. Unauthenticated calls return <code>401</code> with a{' '}
              <code>WWW-Authenticate</code> header. MCP clients discover the authorization server automatically and let
              you sign in as a user of this app — every tool then runs under that user’s permissions.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Discovery &amp; tool list</h2>
          <CodeBlock
            code={`# Protected-resource metadata (no auth required)
curl -s ${base}/.well-known/oauth-protected-resource

# List the seven tools (bearer token required)
curl -s ${base}/.mcp/list-tools \\
  -H "Authorization: Bearer $ACCESS_TOKEN"`}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Invoke a tool</h2>
          <p className="text-sm text-muted-foreground">
            Every tool is callable at <code>/.mcp/invoke-tool/&lt;tool_name&gt;</code> with a JSON body of arguments.
          </p>
          <div className="space-y-6">
            {TOOLS.map((tool) => (
              <article key={tool.name} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Terminal className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-foreground">{tool.title}</h3>
                  <code className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">{tool.name}</code>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                      tool.readOnly ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {tool.readOnly ? 'Read only' : 'Writes data'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                <CodeBlock
                  code={`curl -s ${base}/.mcp/invoke-tool/${tool.name} \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(tool.args)}'`}
                />
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">JSON-RPC (MCP clients)</h2>
          <p className="text-sm text-muted-foreground">
            Clients speaking Streamable HTTP post JSON-RPC to the endpoint root and must accept both content types.
          </p>
          <CodeBlock
            code={`curl -s ${base} \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}
          />
        </section>
      </div>
    </main>
  );
};

export default McpApi;
