-- Enable read access to users table for all authenticated users
-- This is required for views like order_items_full to resolve waiter/preparer names.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'users'
        AND policyname = 'Enable read access for authenticated users'
    ) THEN
        CREATE POLICY "Enable read access for authenticated users"
        ON public.users
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END
$$;
