import { describe, it, expect, beforeAll } from 'vitest';

/**
 * Integration checks ensuring that after the `SECURITY LABEL FOR pg_graphql ...
 * IS 'exclude'` migration, org-restricted public tables are NOT discoverable or
 * queryable through the GraphQL endpoint by either the `anon` or `authenticated`
 * role.
 *
 * pg_graphql evaluates `SECURITY LABEL ... 'exclude'` at the schema level, so the
 * generated GraphQL schema is identical for every JWT role. We still exercise
 * both an anon apikey and an authenticated JWT (when TEST_USER_JWT is provided)
 * to prove the exclusion holds end-to-end via PostgREST/pg_graphql.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const ANON_KEY =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY;
const AUTH_JWT = process.env.TEST_USER_JWT; // optional signed-in user JWT

// Sample of org-restricted tables that must never appear in the public GraphQL
// schema. Keep this list in sync with any new tenant-scoped tables.
const RESTRICTED_TABLES = [
    'vessels',
    'audits',
    'audit_findings',
    'organizations',
    'organization_members',
    'crew_members',
    'incidents',
    'insurance_claims',
    'maintenance_tasks',
    'projects',
    'vessel_certifications',
    'vessel_compliance_scores',
    'external_credentials',
    'webhook_secrets',
    'erp_configurations',
];

// pg_graphql pluralises + camelCases table names for the auto-generated
// Collection fields, e.g. `vessels` -> `vesselsCollection`.
const collectionField = (t: string) => {
    const camel = t.replace(/_([a-z])/g, (_m, c) => c.toUpperCase());
    return `${camel}Collection`;
};

const gql = async (query: string, jwt?: string) => {
    const res = await fetch(`${SUPABASE_URL}/graphql/v1`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: ANON_KEY!,
            Authorization: `Bearer ${jwt ?? ANON_KEY}`,
        },
        body: JSON.stringify({ query }),
    });
    return { status: res.status, body: (await res.json()) as any };
};

const introspect = (jwt?: string) =>
    gql(
        `{ __schema { queryType { fields { name } } types { name kind } } }`,
        jwt,
    );

beforeAll(() => {
    if (!SUPABASE_URL || !ANON_KEY) {
        throw new Error(
            'VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set to run GraphQL exclusion tests.',
        );
    }
});

describe.each(
    [
        { role: 'anon', jwt: undefined as string | undefined },
        ...(AUTH_JWT ? [{ role: 'authenticated', jwt: AUTH_JWT }] : []),
    ],
)('GraphQL schema exclusion for role=$role', ({ jwt }) => {
    it('introspection does not expose restricted collection fields', async () => {
        const { status, body } = await introspect(jwt);
        expect(status).toBe(200);

        const queryFields: string[] =
            body?.data?.__schema?.queryType?.fields?.map((f: any) => f.name) ?? [];
        const typeNames: string[] =
            body?.data?.__schema?.types?.map((t: any) => t.name) ?? [];

        for (const table of RESTRICTED_TABLES) {
            const field = collectionField(table);
            expect(
                queryFields,
                `Restricted table "${table}" is exposed as query field "${field}"`,
            ).not.toContain(field);

            // pg_graphql also generates matching object types (e.g. "Vessels").
            // They must be absent too when the table is excluded.
            const typeGuess = field.replace(/Collection$/, '');
            const capitalised =
                typeGuess.charAt(0).toUpperCase() + typeGuess.slice(1);
            expect(
                typeNames,
                `Type "${capitalised}" for restricted table "${table}" leaked in schema`,
            ).not.toContain(capitalised);
        }
    });

    it.each(RESTRICTED_TABLES)(
        'direct GraphQL read of %s fails with a schema error',
        async (table) => {
            const field = collectionField(table);
            const { body } = await gql(
                `{ ${field}(first: 1) { edges { node { nodeId } } } }`,
                jwt,
            );

            // Either the field does not exist (validation error) or the whole
            // request is rejected. In no case may we get rows back.
            expect(body?.data?.[field], `Restricted table "${table}" returned data`).toBeFalsy();
            expect(Array.isArray(body?.errors) && body.errors.length > 0).toBe(true);
        },
    );
});
