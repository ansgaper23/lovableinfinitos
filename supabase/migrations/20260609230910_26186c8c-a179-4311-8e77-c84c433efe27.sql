-- Primero eliminamos las políticas existentes para recrearlas correctamente
DROP POLICY IF EXISTS "Users can manage their own licenses" ON public.reseller_licenses;
DROP POLICY IF EXISTS "Superadmins can see all licenses" ON public.reseller_licenses;

-- Política para que los usuarios (incluidos resellers) gestionen solo sus propias licencias
CREATE POLICY "Users can manage their own licenses" 
ON public.reseller_licenses 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Política explícita para que los superadmins vean y gestionen TODO
CREATE POLICY "Superadmins can manage all licenses" 
ON public.reseller_licenses 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'superadmin'
  )
);

-- Asegurarnos de que RLS esté habilitado (ya lo estaba, pero por seguridad)
ALTER TABLE public.reseller_licenses ENABLE ROW LEVEL SECURITY;

-- Re-garantizar permisos (por si acaso se perdieron)
GRANT ALL ON public.reseller_licenses TO authenticated;
GRANT ALL ON public.reseller_licenses TO service_role;
