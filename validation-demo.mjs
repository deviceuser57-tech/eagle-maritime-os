#!/usr/bin/env node
/**
 * COMPLIANCE ENGINE - TECHNICAL VALIDATION DEMO
 * 
 * This script executes the validation suite and demonstrates
 * the Compliance Engine functionality via API calls.
 * 
 * Prerequisites:
 * - Node.js installed
 * - Supabase project running
 * - Environment variables configured
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mdcjfjfzxoxrgyaraubm.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY2pmamZ6eG94cmd5YXJhdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjUwNzIsImV4cCI6MjA4MDgwMTA3Mn0.4kPW9veIyTbsVG09b6XIBfN0s2k0q9KfC3DIetRfNQw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('========================================');
console.log('COMPLIANCE ENGINE - VALIDATION DEMO');
console.log('========================================\n');

// =====================================================
// DEMO STEP 1: Test Vessel Compliance Calculation
// =====================================================
async function testVesselCompliance() {
    console.log('📊 STEP 1: Testing Vessel Compliance Calculation\n');

    try {
        // Get a sample vessel
        const { data: vessels, error: vesselError } = await supabase
            .from('vessels')
            .select('id, name, imo_number, gross_tonnage')
            .limit(1);

        if (vesselError) {
            console.error('❌ Error fetching vessels:', vesselError.message);
            return null;
        }

        if (!vessels || vessels.length === 0) {
            console.log('⚠️  No vessels found in database. Please add test data first.');
            return null;
        }

        const vessel = vessels[0];
        console.log(`Testing vessel: ${vessel.name} (${vessel.imo_number})`);
        console.log(`Gross Tonnage: ${vessel.gross_tonnage} GT\n`);

        // Call compliance calculation RPC
        const { data: complianceResult, error: rpcError } = await supabase
            .rpc('rpc_calculate_vessel_compliance', { p_vessel_id: vessel.id });

        if (rpcError) {
            console.error('❌ RPC Error:', rpcError.message);
            return null;
        }

        console.log('✅ Compliance Calculation Result:');
        console.log(JSON.stringify(complianceResult, null, 2));
        console.log('');

        // Fetch persisted score
        const { data: score, error: scoreError } = await supabase
            .from('vessel_compliance_scores')
            .select('*')
            .eq('vessel_id', vessel.id)
            .single();

        if (scoreError) {
            console.error('❌ Error fetching score:', scoreError.message);
        } else {
            console.log('✅ Persisted Score Record:');
            console.log(`  Admin Score: ${score.admin_score}%`);
            console.log(`  Coverage Score: ${score.coverage_score}%`);
            console.log(`  Findings Score: ${score.findings_score}%`);
            console.log(`  Risk Score: ${score.risk_score}%`);
            console.log(`  Total Score: ${score.total_score}%`);
            console.log(`  Statutory Breach: ${score.has_statutory_breach}`);
            console.log(`  Last Calculated: ${score.last_calculated_at}`);
            console.log('');
        }

        return vessel.id;
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return null;
    }
}

// =====================================================
// DEMO STEP 2: Test Fleet Compliance Index
// =====================================================
async function testFleetCompliance() {
    console.log('📊 STEP 2: Testing Fleet Compliance Index\n');

    try {
        // Get organization ID (assuming first org for demo)
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .limit(1);

        if (orgError || !orgs || orgs.length === 0) {
            console.log('⚠️  No organizations found. Using default org context.');
            return;
        }

        const org = orgs[0];
        console.log(`Testing organization: ${org.name}\n`);

        // Call fleet compliance RPC
        const { data: fleetResult, error: rpcError } = await supabase
            .rpc('rpc_get_fleet_compliance_index', { p_org_id: org.id });

        if (rpcError) {
            console.error('❌ RPC Error:', rpcError.message);
            return;
        }

        console.log('✅ Fleet Compliance Index Result:');
        console.log(JSON.stringify(fleetResult, null, 2));
        console.log('');

        if (fleetResult.success) {
            console.log('📈 Fleet Metrics:');
            console.log(`  Fleet Compliance Index: ${fleetResult.fleet_compliance_index}%`);
            console.log(`  Total Vessels: ${fleetResult.vessel_count}`);
            console.log(`  Assets at Risk: ${fleetResult.at_risk_count}`);
            console.log(`  Tonnage Weighted: ${fleetResult.is_weighted ? 'Yes' : 'No'}`);
            console.log('');
        }
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

// =====================================================
// DEMO STEP 3: Verify Dashboard Data Alignment
// =====================================================
async function verifyDashboardData() {
    console.log('📊 STEP 3: Verifying Dashboard Data Alignment\n');

    try {
        // Fetch all compliance scores
        const { data: scores, error: scoresError } = await supabase
            .from('vessel_compliance_scores')
            .select(`
        vessel_id,
        total_score,
        has_statutory_breach,
        vessels (
          name,
          imo_number,
          gross_tonnage
        )
      `)
            .order('total_score', { ascending: true });

        if (scoresError) {
            console.error('❌ Error fetching scores:', scoresError.message);
            return;
        }

        console.log('✅ Compliance Scores Summary:');
        console.log('─'.repeat(80));
        console.log('Vessel Name'.padEnd(30) + 'IMO'.padEnd(15) + 'Score'.padEnd(10) + 'Breach'.padEnd(10) + 'GT');
        console.log('─'.repeat(80));

        let atRiskCount = 0;
        scores?.forEach(score => {
            const vessel = score.vessels;
            const isAtRisk = score.total_score < 60 || score.has_statutory_breach;
            if (isAtRisk) atRiskCount++;

            const name = (vessel?.name || 'Unknown').substring(0, 28).padEnd(30);
            const imo = (vessel?.imo_number || 'N/A').padEnd(15);
            const scoreStr = `${score.total_score?.toFixed(1)}%`.padEnd(10);
            const breach = (score.has_statutory_breach ? '⚠️  YES' : '✓ NO').padEnd(10);
            const gt = vessel?.gross_tonnage || 'N/A';

            console.log(`${name}${imo}${scoreStr}${breach}${gt}`);
        });

        console.log('─'.repeat(80));
        console.log(`\nTotal Vessels: ${scores?.length || 0}`);
        console.log(`Assets at Risk: ${atRiskCount}`);
        console.log('');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

// =====================================================
// DEMO STEP 4: Test API Exposure
// =====================================================
async function testAPIExposure() {
    console.log('📊 STEP 4: Testing API Exposure for External Consumers\n');

    console.log('API Endpoint Configuration:');
    console.log(`  Base URL: ${SUPABASE_URL}`);
    console.log(`  Auth: Bearer ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
    console.log('');

    console.log('Available RPC Endpoints:');
    console.log('  1. POST /rest/v1/rpc/rpc_calculate_vessel_compliance');
    console.log('     Body: { "p_vessel_id": "<uuid>" }');
    console.log('');
    console.log('  2. POST /rest/v1/rpc/rpc_get_fleet_compliance_index');
    console.log('     Body: { "p_org_id": "<uuid>" }');
    console.log('');
    console.log('  3. POST /rest/v1/rpc/rpc_snapshot_compliance_history');
    console.log('     Body: {}');
    console.log('');

    console.log('Example cURL command:');
    console.log(`curl -X POST '${SUPABASE_URL}/rest/v1/rpc/rpc_get_fleet_compliance_index' \\`);
    console.log(`  -H "apikey: ${SUPABASE_ANON_KEY}" \\`);
    console.log(`  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"p_org_id": "<your-org-id>"}'`);
    console.log('');
}

// =====================================================
// MAIN EXECUTION
// =====================================================
async function runDemo() {
    try {
        await testVesselCompliance();
        await testFleetCompliance();
        await verifyDashboardData();
        await testAPIExposure();

        console.log('========================================');
        console.log('✅ VALIDATION DEMO COMPLETE');
        console.log('========================================\n');

        console.log('Next Steps:');
        console.log('1. Review the output above for compliance calculations');
        console.log('2. Navigate to Dashboard to verify UI alignment');
        console.log('3. Generate PDF report from Reports section');
        console.log('4. Test external API access using cURL commands');
        console.log('');

    } catch (error) {
        console.error('❌ Demo failed:', error);
        process.exit(1);
    }
}

// Run the demo
runDemo();
