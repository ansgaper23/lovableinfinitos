
-- Ensure unique user_id on user_credits for upserts
CREATE UNIQUE INDEX IF NOT EXISTS user_credits_user_id_unique ON public.user_credits(user_id);

-- Helper: check superadmin role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'superadmin'
  )
$$;

-- Allow superadmin to view & update all credits
DROP POLICY IF EXISTS "Superadmin can view all credits" ON public.user_credits;
CREATE POLICY "Superadmin can view all credits"
ON public.user_credits FOR SELECT
USING (public.is_superadmin(auth.uid()));

-- Consume 1 credit for current user; returns true if successful
CREATE OR REPLACE FUNCTION public.consume_credit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits int;
BEGIN
  SELECT credits INTO current_credits
  FROM public.user_credits
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF current_credits IS NULL THEN
    INSERT INTO public.user_credits(user_id, credits)
    VALUES (auth.uid(), 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN false;
  END IF;

  IF current_credits < 1 THEN
    RETURN false;
  END IF;

  UPDATE public.user_credits
  SET credits = credits - 1, updated_at = now()
  WHERE user_id = auth.uid();

  RETURN true;
END;
$$;

-- Superadmin-only: add credits to a target user
CREATE OR REPLACE FUNCTION public.add_credits(_target uuid, _amount int)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total int;
BEGIN
  IF NOT public.is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Solo el superadmin puede recargar créditos';
  END IF;

  IF _amount IS NULL THEN
    RAISE EXCEPTION 'Cantidad inválida';
  END IF;

  INSERT INTO public.user_credits(user_id, credits)
  VALUES (_target, GREATEST(_amount, 0))
  ON CONFLICT (user_id) DO UPDATE
    SET credits = public.user_credits.credits + _amount,
        updated_at = now()
  RETURNING credits INTO new_total;

  RETURN new_total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_superadmin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_credit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits(uuid, int) TO authenticated;
