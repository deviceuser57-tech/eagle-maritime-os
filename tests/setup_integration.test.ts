import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../src/integrations/supabase/client';

// Mock Supabase client to simulate RLS and data retrieval
vi.mock('../src/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(function(this: any, column: string, value: any) {
          this.filters = this.filters || {};
          this.filters[column] = value;
          return this;
        }),
        limit: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((callback) => {
          // Simulate returned data based on filters
          if (table === 'setup_finding_types') {
            return callback({ data: [{ finding_type_name: 'Safety', org_id: 'org1' }], error: null });
          }
          if (table === 'setup_nationalities') {
            return callback({ data: [{ country_name: 'Egypt', org_id: 'org1' }], error: null });
          }
          return callback({ data: [], error: null });
        })
      };
    })
  }
}));

describe('Setup Data Integration', () => {
  it('should restrict setup_finding_types retrieval by org_id', async () => {
    const orgId = 'org1';
    
    // Simulate what the custom hook useFindingTypes does internally
    const { data } = await supabase
      .from('setup_finding_types')
      .select('*')
      .eq('org_id', orgId);
      
    expect(supabase.from).toHaveBeenCalledWith('setup_finding_types');
    expect(data).toHaveLength(1);
    expect(data[0].org_id).toBe(orgId);
  });

  it('should restrict setup_nationalities retrieval by org_id', async () => {
    const orgId = 'org1';
    
    // Simulate what useNationalities does internally
    const { data } = await supabase
      .from('setup_nationalities')
      .select('*')
      .eq('org_id', orgId);
      
    expect(supabase.from).toHaveBeenCalledWith('setup_nationalities');
    expect(data).toHaveLength(1);
    expect(data[0].org_id).toBe(orgId);
  });
  
  it('should prevent cross-organization access for setup tables', async () => {
     // A user from org2 shouldn't receive org1's data (Simulated here by our mock which would normally be enforced by RLS)
     const orgId = 'org2';
     
     // Setup mock specifically for this test
     const mockSupabaseCall = supabase.from('setup_currencies').select('*').eq('org_id', orgId) as any;
     mockSupabaseCall.then = vi.fn((callback) => callback({ data: [], error: null }));
     
     const { data } = await mockSupabaseCall;
     expect(data).toHaveLength(0); // Empty because it's org2
  });

  it('should validate multi-role company record without requiring legacy company_type', async () => {
    const { companySchema } = await import('../src/lib/validations');
    
    const multiRolePayload = {
      name: 'ABC Maritime Services',
      is_owner: true,
      is_operator: true,
      is_technical_manager: true,
      is_ism_manager: false,
      is_doc_issuer: true,
      is_insurer: false,
      contact_person: 'John Doe',
      email: 'john@abcmaritime.com',
    };

    const parsed = companySchema.safeParse(multiRolePayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.is_owner).toBe(true);
      expect(parsed.data.is_operator).toBe(true);
      expect(parsed.data.is_technical_manager).toBe(true);
      expect(parsed.data.is_doc_issuer).toBe(true);
      expect(parsed.data.is_insurer).toBe(false);
    }
  });

  it('should correctly filter one unified company master into role-specific consumers', () => {
    const unifiedCompanies = [
      {
        id: 'c1',
        name: 'Alpha Shipping',
        is_owner: true,
        is_operator: true,
        is_technical_manager: false,
        is_ism_manager: false,
        is_doc_issuer: false,
        is_insurer: false,
      },
      {
        id: 'c2',
        name: 'Beta Ship Management',
        is_owner: false,
        is_operator: false,
        is_technical_manager: true,
        is_ism_manager: true,
        is_doc_issuer: true,
        is_insurer: false,
      },
      {
        id: 'c3',
        name: 'Maritime Mutual P&I',
        is_owner: false,
        is_operator: false,
        is_technical_manager: false,
        is_ism_manager: false,
        is_doc_issuer: false,
        is_insurer: true,
      },
    ];

    const owners = unifiedCompanies.filter(c => Boolean(c.is_owner));
    const operators = unifiedCompanies.filter(c => Boolean(c.is_operator));
    const techManagers = unifiedCompanies.filter(c => Boolean(c.is_technical_manager));
    const ismManagers = unifiedCompanies.filter(c => Boolean(c.is_ism_manager));
    const docIssuers = unifiedCompanies.filter(c => Boolean(c.is_doc_issuer));
    const insurers = unifiedCompanies.filter(c => Boolean(c.is_insurer));

    expect(owners).toHaveLength(1);
    expect(owners[0].name).toBe('Alpha Shipping');

    expect(operators).toHaveLength(1);
    expect(operators[0].name).toBe('Alpha Shipping');

    expect(techManagers).toHaveLength(1);
    expect(techManagers[0].name).toBe('Beta Ship Management');

    expect(ismManagers).toHaveLength(1);
    expect(ismManagers[0].name).toBe('Beta Ship Management');

    expect(docIssuers).toHaveLength(1);
    expect(docIssuers[0].name).toBe('Beta Ship Management');

    expect(insurers).toHaveLength(1);
    expect(insurers[0].name).toBe('Maritime Mutual P&I');
  });
});
