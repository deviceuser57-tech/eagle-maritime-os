import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Plug, RefreshCw, MessageSquare, Terminal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function useMcpUrl(): string {
  return useMemo(() => {
    const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseUrl = new URL(configuredSupabaseUrl);
    const authority = configuredSupabaseUrl.match(/^https?:\/\/([^/?#]*)/i)?.[1];
    const loopbackAuthority = /^(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?$/i.test(authority ?? "");
    if (
      !authority ||
      authority.includes("@") ||
      configuredSupabaseUrl.includes("?") ||
      configuredSupabaseUrl.includes("#") ||
      (supabaseUrl.protocol === "http:" && !loopbackAuthority)
    ) {
      throw new Error(
        "VITE_SUPABASE_URL must use HTTPS unless it targets localhost or a loopback IP, and must not contain credentials, query, or fragment",
      );
    }
    const legacyLovableCloud =
      supabaseUrl.hostname.endsWith(".lovable.cloud") && !supabaseUrl.hostname.startsWith("c--");
    const dataPlaneUrl = legacyLovableCloud
      ? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
      : supabaseUrl.toString().replace(/\/+$/, "");
    return `${dataPlaneUrl}/functions/v1/mcp`;
  }, []);
}

const APP_NAME = "Eagle-Maritime COG. OS";
const APP_SLUG = "eagle-maritime-cog-os";

function CopyBlock({ text, mono = true }: { text: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border">
      <code className={`flex-1 text-xs break-all ${mono ? "font-mono" : ""}`}>{text}</code>
      <Button size="sm" variant="ghost" onClick={copy} aria-label="Copy to clipboard">
        {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

function StepList({ steps }: { steps: React.ReactNode[] }) {
  return (
    <ol className="space-y-2 text-sm text-muted-foreground list-none pl-0">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-black grid place-items-center">
            {i + 1}
          </span>
          <span className="pt-0.5">{s}</span>
        </li>
      ))}
    </ol>
  );
}

const Connect = () => {
  const mcpUrl = useMcpUrl();
  const claudeUrl = `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent(APP_NAME)}&connectorUrl=${encodeURIComponent(mcpUrl)}`;
  const claudeCodeCmd = `claude mcp add --scope user --transport http ${APP_SLUG} '${mcpUrl.replace(/'/g, `'\\''`)}'`;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to app
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Connect an AI assistant</h1>
          <p className="text-muted-foreground font-medium">
            {APP_NAME} exposes an MCP server so AI assistants (ChatGPT, Claude, Claude Code, and others) can answer
            questions about your fleet — vessels, certificates, audit findings, and incidents — acting as you, scoped
            to your organization. Paste the server URL below into your assistant to connect.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-3">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Plug className="h-4 w-4 text-primary" /> MCP server URL
            </h2>
            <CopyBlock text={mcpUrl} />
            <p className="text-xs text-muted-foreground">
              This is the public endpoint. Connecting requires signing in with your {APP_NAME} account and approving
              access — tools run as you and see only your organization's data.
            </p>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Connect
          </h2>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> ChatGPT
              </h3>
              <StepList
                steps={[
                  <>Open <a className="text-primary underline" href="https://chatgpt.com/#settings/Connectors/Advanced" target="_blank" rel="noopener noreferrer">ChatGPT connector settings</a> (Apps) and enable <strong>Developer mode</strong> — heed the risk notice shown there. If Developer mode is unavailable, ask a ChatGPT admin to enable it.</>,
                  <>Open the <a className="text-primary underline" href="https://chatgpt.com/plugins#settings/Connectors?create-connector=true&redirectAfter=%2Fplugins" target="_blank" rel="noopener noreferrer">New connector dialog</a>.</>,
                  <>Paste <strong>{APP_NAME}</strong> as the name and the MCP server URL above as the URL.</>,
                  <>Review the details, check <strong>"I understand and want to continue"</strong> (ChatGPT shows this warning for every custom MCP server, not just this one), then click <strong>Create</strong>.</>,
                  <>Enable the app from the chat composer, sign in when prompted, then ask ChatGPT to use the app.</>,
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Claude
              </h3>
              <StepList
                steps={[
                  <>Open the <a className="text-primary underline" href={claudeUrl} target="_blank" rel="noopener noreferrer">custom connector dialog</a> — the name and URL are prefilled.</>,
                  <>Review the details and click <strong>Add</strong>.</>,
                  <>If the prefilled form does not open, go to Claude's Connectors page, choose <strong>"Add custom connector"</strong>, then name the connector and paste the MCP server URL above.</>,
                  <>Enable the connector from the chat composer, sign in when prompted, then ask Claude to use the app.</>,
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" /> Claude Code
              </h3>
              <StepList
                steps={[
                  <>Run this one-line install command in a terminal:</>,
                  <CopyBlock key="cmd" text={claudeCodeCmd} />,
                  <>Start Claude Code and run <code className="font-mono text-xs bg-muted/50 px-1 rounded">/mcp</code> to confirm the app is connected. Claude Code asks you to sign in from that menu because this app protects its MCP tools.</>,
                  <>Ask Claude Code to use the app.</>,
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-foreground">Other MCP clients</h3>
              <StepList
                steps={[
                  <>Open the client's MCP server or custom connector settings.</>,
                  <>Create a <strong>remote MCP server</strong> connection.</>,
                  <>Name the connection and paste the MCP server URL above.</>,
                  <>Finish any sign-in or authorization prompts.</>,
                  <>Enable the connection, then ask the assistant to use the app.</>,
                ]}
              />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" /> Refresh after the app changes
          </h2>
          <p className="text-sm text-muted-foreground">
            A connected assistant caches the tool list. After {APP_NAME} ships changes, refresh the connector to get the
            latest tools.
          </p>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-foreground">ChatGPT</h3>
              <StepList
                steps={[
                  <>Open ChatGPT's Plugins page and select this app.</>,
                  <>Scroll to <strong>"Information"</strong> and click <strong>"Refresh"</strong>.</>,
                  <>ChatGPT can't update an existing app's URL — if it changed, delete the app from Plugins and repeat the connect steps above with the latest URL.</>,
                  <>Start a new chat and ask ChatGPT to use the app.</>,
                ]}
              />
              <h3 className="font-bold text-foreground pt-2">Claude</h3>
              <StepList
                steps={[
                  <>Open the Connectors page and select this connector.</>,
                  <>Refresh or update the connector's tools.</>,
                  <>Claude can't update an existing connector's URL — if it changed, remove the connector and repeat the connect steps above with the latest URL.</>,
                  <>Ask Claude to use the app.</>,
                ]}
              />
              <h3 className="font-bold text-foreground pt-2">Claude Code</h3>
              <StepList
                steps={[
                  <>Start a new Claude Code session — it loads the app's latest tools when it connects.</>,
                  <>If the URL changed, run <code className="font-mono text-xs bg-muted/50 px-1 rounded">claude mcp remove {APP_SLUG}</code>, then run the install command again with the latest quoted URL.</>,
                  <>Ask Claude Code to use the app.</>,
                ]}
              />
              <h3 className="font-bold text-foreground pt-2">Other MCP clients</h3>
              <StepList
                steps={[
                  <>Open the client's MCP server or connector settings.</>,
                  <>Select the connection created for this app.</>,
                  <>Refresh the tool list, reload the server, or reconnect it.</>,
                  <>If the URL changed, paste the latest URL from above.</>,
                  <>Start a new chat or session and ask the assistant to use the app.</>,
                ]}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Connect;
