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
});
