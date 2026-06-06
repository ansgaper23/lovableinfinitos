
CREATE OR REPLACE FUNCTION public.set_user_role(_target uuid, _role text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Solo el superadmin puede cambiar roles';
  END IF;
  IF _role NOT IN ('user','reseller','superadmin') THEN
    RAISE EXCEPTION 'Rol inválido';
  END IF;
  UPDATE public.profiles SET role = _role, updated_at = now() WHERE id = _target;
  RETURN _role;
END;
$$;
