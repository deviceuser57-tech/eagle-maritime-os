import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, Building2, AlertTriangle, ArrowRight } from 'lucide-react';
import AuthPage from '@/components/AuthPage';

type Preview = {
  valid?: boolean;
  error?: string;
  organization_name?: string;
  role?: string;
  email?: string;
  expires_at?: string;
};

const JoinInner = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<{ vessels: number; audits: number; incidents: number } | null>(null);

  const loadPreview = useCallback(async () => {
    if (!token) {
      setError('Missing invitation link token.');
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: rpcError } = await (supabase.rpc as any)('rpc_preview_invitation', { p_token: token });
    if (rpcError) setError(rpcError.message);
    else {
      const p = data as Preview;
      setPreview(p);
      if (p && p.valid === false) setError(p.error ?? 'This invitation is no longer valid.');
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { loadPreview(); }, [loadPreview]);

  const verifyRecords = useCallback(async () => {
    const [v, a, i] = await Promise.all([
      supabase.from('vessels').select('id', { count: 'exact', head: true }),
      supabase.from('audits').select('id', { count: 'exact', head: true }),
      supabase.from('incidents').select('id', { count: 'exact', head: true }),
    ]);
    setCounts({ vessels: v.count ?? 0, audits: a.count ?? 0, incidents: i.count ?? 0 });
  }, []);

  const accept = async () => {
    setAccepting(true);
    setError(null);
    const { data, error: rpcError } = await (supabase.rpc as any)('rpc_accept_invitation', { p_token: token });
    setAccepting(false);
    const res = data as { success?: boolean; error?: string } | null;
    if (rpcError || res?.success === false) {
      setError(rpcError?.message ?? res?.error ?? 'Could not accept the invitation.');
      return;
    }
    setAccepted(true);
    await verifyRecords();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto pt-10 px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in or create an account with the invited email to join
            {preview?.organization_name ? ` ${preview.organization_name}` : ' the organization'}.
          </p>
        </div>
        <AuthPage />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 p-8 rounded-2xl border border-border bg-card shadow-lg">
        <header className="space-y-2">
          <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Join organization</h1>
          <p className="text-sm text-muted-foreground">
            Link your Eagle Maritime OS account to the organization that invited you.
          </p>
        </header>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/40 bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {preview?.valid && !accepted && (
          <div className="space-y-3 text-sm">
            <Row label="Organization" value={preview.organization_name ?? '—'} />
            <Row label="Role" value={preview.role ?? 'Member'} />
            <Row label="Invited email" value={preview.email ?? '—'} />
            {preview.email && user.email && preview.email.toLowerCase() !== user.email.toLowerCase() && (
              <p className="text-xs text-destructive font-medium">
                You are signed in as {user.email}. Sign in with {preview.email} to accept this invitation.
              </p>
            )}
            <Button className="w-full" onClick={accept} disabled={accepting}>
              {accepting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              Accept invitation
            </Button>
          </div>
        )}

        {accepted && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
              <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
              <p className="text-sm text-foreground">
                Your account is now linked to {preview?.organization_name ?? 'the organization'}.
              </p>
            </div>
            {counts && (
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Vessels" value={counts.vessels} />
                <Stat label="Audits" value={counts.audits} />
                <Stat label="Incidents" value={counts.incidents} />
              </div>
            )}
            <Button className="w-full" onClick={() => navigate('/')}>
              Open the app <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        <Link to="/" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
          ← Back to app
        </Link>
      </div>
    </main>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 py-2 border-b border-border/60">
    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
);

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
    <p className="text-xl font-black text-foreground">{value}</p>
    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
  </div>
);

const Join = () => (
  <AuthProvider>
    <JoinInner />
  </AuthProvider>
);

export default Join;
