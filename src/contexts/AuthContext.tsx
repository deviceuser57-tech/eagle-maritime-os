import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan_id: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  organizations: Organization[];
  activeOrganization: Organization | null;
  setActiveOrganization: (orgId: string) => void;
  refreshOrganizations: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrg] = useState<Organization | null>(null);

  const fetchOrganizations = async (userId: string) => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*, organization_members!inner(user_id)')
      .eq('organization_members.user_id', userId);

    if (!error && data) {
      setOrganizations(data as Organization[]);

      // Select active org from local storage or default to first one
      const savedOrgId = localStorage.getItem('active_org_id');
      const foundOrg = data.find(org => org.id === savedOrgId) || data[0];

      if (foundOrg) {
        setActiveOrg(foundOrg as Organization);
        localStorage.setItem('active_org_id', foundOrg.id);
        logger.setContext({ orgId: foundOrg.id, userId });
      }
    }
  };

  const setActiveOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setActiveOrg(org);
      localStorage.setItem('active_org_id', org.id);
      logger.setContext({ orgId: org.id });
      logger.info(`Fleet switched to: ${org.name}`);
      // Reload page or trigger global refresh to ensure RLS context updates if needed via headers
      window.location.reload();
    }
  };

  const refreshOrganizations = async () => {
    if (user) await fetchOrganizations(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchOrganizations(session.user.id);
        } else {
          setOrganizations([]);
          setActiveOrg(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchOrganizations(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [user]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      organizations,
      activeOrganization,
      setActiveOrganization,
      refreshOrganizations,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
