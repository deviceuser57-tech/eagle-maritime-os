import { useAuth } from '@/contexts/AuthContext';

export const useOrganization = () => {
    const {
        organizations,
        activeOrganization,
        setActiveOrganization,
        refreshOrganizations,
        loading: authLoading
    } = useAuth();

    const isOwner = activeOrganization?.plan_id === 'enterprise'; // Simple example logic

    return {
        organizations,
        activeOrganization,
        setActiveOrganization,
        refreshOrganizations,
        loading: authLoading,
        isMultiOrg: organizations.length > 1,
        orgId: activeOrganization?.id,
        orgName: activeOrganization?.name,
        isOwner
    };
};
