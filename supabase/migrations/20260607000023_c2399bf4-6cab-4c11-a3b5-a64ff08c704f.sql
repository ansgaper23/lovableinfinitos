CREATE OR REPLACE FUNCTION public.refund_credit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  INSERT INTO public.user_credits(user_id, credits)
  VALUES (auth.uid(), 1)
  ON CONFLICT (user_id) DO UPDATE
    SET credits = public.user_credits.credits + 1,
        updated_at = now()
  RETURNING credits INTO new_total;

  RETURN new_total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refund_credit() TO authenticated;