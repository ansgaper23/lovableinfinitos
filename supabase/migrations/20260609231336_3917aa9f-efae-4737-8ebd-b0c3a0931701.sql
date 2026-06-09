ALTER TABLE public.reseller_licenses 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

COMMENT ON COLUMN public.reseller_licenses.customer_name IS 'Nombre del cliente final que usa la licencia';
COMMENT ON COLUMN public.reseller_licenses.customer_phone IS 'Teléfono de contacto opcional del cliente';
