
CREATE POLICY "Superadmin can upload extensions"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'extensions' AND public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can update extensions"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'extensions' AND public.is_superadmin(auth.uid()))
WITH CHECK (bucket_id = 'extensions' AND public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can delete extensions"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'extensions' AND public.is_superadmin(auth.uid()));

CREATE POLICY "Authenticated can read extensions"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'extensions');
