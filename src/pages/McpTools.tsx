import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Loader2, Terminal, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MCP_TOOLS, type McpToolDef } from '@/lib/mcpRunner';

type RunState = { loading: boolean; output?: string; error?: string; ms?: number };

const ToolRunner = ({ tool }: { tool: McpToolDef }) => {
  const [input, setInput] = useState<Record<string, string>>({});
  const [state, setState] = useState<RunState>({ loading: false });

  const run = async () => {
    setState({ loading: true });
    const started = performance.now();
    try {
      const result = await tool.run(input);
      setState({ loading: false, output: JSON.stringify(result, null, 2), ms: Math.round(performance.now() - started) });
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        ms: Math.round(performance.now() - started),
      });
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-5 space-y-4">
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

      {tool.args.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {tool.args.map((arg) => (
            <div key={arg.key} className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                {arg.label}
                {arg.required && <span className="text-destructive"> *</span>}
              </Label>
              <Input
                type={arg.type === 'number' ? 'number' : arg.type === 'date' ? 'date' : 'text'}
                placeholder={arg.placeholder}
                value={input[arg.key] ?? ''}
                onChange={(e) => setInput((prev) => ({ ...prev, [arg.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={run} disabled={state.loading} size="sm">
          {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run tool
        </Button>
        {state.ms !== undefined && <span className="text-xs text-muted-foreground">{state.ms} ms</span>}
      </div>

      {state.error && (
        <pre className="overflow-x-auto rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">
          {state.error}
        </pre>
      )}
      {state.output && (
        <pre className="max-h-96 overflow-auto rounded-xl border border-border bg-muted/40 p-4 text-xs leading-relaxed text-foreground">
          <code>{state.output}</code>
        </pre>
      )}
    </article>
  );
};

const McpTools = () => (
  <main className="min-h-screen bg-background">
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to app
      </Link>

      <header className="space-y-3">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">MCP tools — live</h1>
        <p className="text-muted-foreground font-medium">
          Run the seven agent tools right here and see real data from your organization. These are the same queries an
          MCP client (ChatGPT, Claude, Cursor) executes after signing in — run here under your own session and
          permissions.
        </p>
      </header>

      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Every result is scoped to your organization by row-level security. For the raw HTTP endpoint and curl
          examples see the{' '}
          <Link to="/mcp-api" className="text-primary font-bold hover:underline">
            MCP API reference
          </Link>
          .
        </p>
      </div>

      <section className="space-y-6">
        {MCP_TOOLS.map((tool) => (
          <ToolRunner key={tool.name} tool={tool} />
        ))}
      </section>
    </div>
  </main>
);

export default McpTools;
