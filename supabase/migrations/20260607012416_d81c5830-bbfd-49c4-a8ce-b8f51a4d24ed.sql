
-- Replace UPDATE policy on profiles with an explicit WITH CHECK that
-- forbids modifying sensitive columns. Trigger still enforces role changes.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  AND email IS NOT DISTINCT FROM (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid())
  AND reseller_api_token IS NOT DISTINCT FROM (SELECT p.reseller_api_token FROM public.profiles p WHERE p.id = auth.uid())
);
