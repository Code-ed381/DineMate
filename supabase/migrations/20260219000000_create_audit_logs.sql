CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_restaurant_id ON public.audit_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert logs (for their own actions)
CREATE POLICY "Enable insert for authenticated users" ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Restaurant members (admin/manager/owner) can view logs for their restaurant
CREATE POLICY "Enable select for restaurant admins" ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurant_members rm
            WHERE rm.restaurant_id = audit_logs.restaurant_id
            AND rm.user_id = auth.uid()
            AND rm.role IN ('owner', 'admin', 'manager')
        )
    );
