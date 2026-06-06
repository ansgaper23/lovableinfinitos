ALTER TABLE public.profiles ADD COLUMN reseller_api_token TEXT;

CREATE TABLE public.reseller_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    license_key TEXT NOT NULL,
    display_name TEXT,
    type TEXT NOT NULL, -- 'trial' or 'active'
    expires_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    lifetime BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reseller_licenses TO authenticated;
GRANT ALL ON public.reseller_licenses TO service_role;

ALTER TABLE public.reseller_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own licenses" ON public.reseller_licenses
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Superadmins can see all licenses" ON public.reseller_licenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
        )
    );
