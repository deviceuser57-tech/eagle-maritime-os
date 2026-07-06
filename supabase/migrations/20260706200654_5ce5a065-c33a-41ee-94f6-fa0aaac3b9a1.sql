
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('SECURITY LABEL FOR pg_graphql ON TABLE public.%I IS %L', r.tablename, 'exclude');
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;
