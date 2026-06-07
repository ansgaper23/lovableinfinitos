
CREATE TABLE public.signup_ips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip text NOT NULL,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_signup_ips_ip ON public.signup_ips(ip);

GRANT ALL ON public.signup_ips TO service_role;

ALTER TABLE public.signup_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No client access to signup_ips"
ON public.signup_ips
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);
