
CREATE TABLE public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id text NOT NULL,
  days integer NOT NULL,
  amount_pen integer NOT NULL,
  currency text NOT NULL DEFAULT 'PEN',
  status text NOT NULL DEFAULT 'pending',
  izipay_order_id text,
  izipay_uuid text,
  license_key text,
  raw_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payment_orders_user_idx ON public.payment_orders (user_id);
CREATE INDEX payment_orders_order_idx ON public.payment_orders (izipay_order_id);

GRANT SELECT ON public.payment_orders TO authenticated;
GRANT ALL ON public.payment_orders TO service_role;

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own orders" ON public.payment_orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_payment_orders_updated_at
  BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
