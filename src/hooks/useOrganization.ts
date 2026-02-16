import { useAuth } from '@/contexts/AuthContext';

export const useOrganization = () => {
  const { user, loading: authLoading } = useAuth();

  return {
    loading: authLoading,
    orgId: user?.id,
    orgName: user?.email,
  };
};
