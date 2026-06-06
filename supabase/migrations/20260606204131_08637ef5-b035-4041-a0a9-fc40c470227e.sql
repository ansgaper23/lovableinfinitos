GRANT SELECT, INSERT, UPDATE, DELETE ON public.licenses TO authenticated;
GRANT ALL ON public.licenses TO service_role;

DROP POLICY IF EXISTS "Users can insert their own licenses" ON public.licenses;
CREATE POLICY "Users can insert their own licenses"
ON public.licenses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own licenses" ON public.licenses;
CREATE POLICY "Users can update their own licenses"
ON public.licenses
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own licenses" ON public.licenses;
CREATE POLICY "Users can delete their own licenses"
ON public.licenses
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);