CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role text;
BEGIN
  IF new.email = 'jorge968122@gmail.com' THEN
    assigned_role := 'superadmin';
  ELSE
    assigned_role := 'user';
  END IF;

  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, assigned_role);
  
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (new.id, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure the trigger exists (might be missing)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
