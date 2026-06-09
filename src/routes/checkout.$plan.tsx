import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createIzipayPayment, getOrderStatus } from "@/lib/payments.functions";
import { PLANS, isPlanId } from "@/lib/plans";
import { Loader2, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

const KR_SCRIPT_SRC =
  "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js";
const KR_THEME_CSS =
  "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/neon-reset.css";
const KR_THEME_JS =
  "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/neon.js";

declare global {
  interface Window {
    KR?: any;
  }
}

export const Route = createFileRoute("/checkout/$plan")({
  head: () => ({
    meta: [
      { title: "Checkout — Lovable Infinito" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { plan: planParam } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(true);
  const createPayment = useServerFn(createIzipayPayment);
  const fetchOrderStatus = useServerFn(getOrderStatus);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const plan = isPlanId(planParam) ? PLANS[planParam] : null;

  useEffect(() => {
    if (!plan) {
      setError("Plan inválido");
      setLoading(false);
      return;
    }
    if (authLoading || !user || initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        const res = await createPayment({ data: { planId: plan.id } });
        setOrderId(res.orderId);

        // Inyectar CSS de tema
        if (!document.querySelector(`link[href="${KR_THEME_CSS}"]`)) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = KR_THEME_CSS;
          document.head.appendChild(link);
        }

        // Inyectar script principal con public key
        let script = document.querySelector<HTMLScriptElement>(
          `script[src="${KR_SCRIPT_SRC}"]`
        );
        if (!script) {
          script = document.createElement("script");
          script.src = KR_SCRIPT_SRC;
          script.setAttribute("kr-public-key", res.publicKey);
          script.setAttribute("kr-post-url-success", "/api/public/izipay-webhook");
          document.head.appendChild(script);
          await new Promise<void>((resolve, reject) => {
            script!.onload = () => resolve();
            script!.onerror = () => reject(new Error("No se pudo cargar Izipay"));
          });
        }

        // Cargar tema neon (opcional, pero mejora la UI)
        if (!document.querySelector(`script[src="${KR_THEME_JS}"]`)) {
          const themeScript = document.createElement("script");
          themeScript.src = KR_THEME_JS;
          document.head.appendChild(themeScript);
        }

        const KR = window.KR;
        if (!KR) throw new Error("Izipay no se inicializó");

        await KR.setFormConfig({
          formToken: res.formToken,
          "kr-language": "es-PE",
        });

        await KR.onSubmit(async (payment: any) => {
          // El form ya POSTea a /api/public/izipay-webhook
          // Aquí solo manejamos la UI
          if (payment?.clientAnswer?.orderStatus === "PAID") {
            setSuccess(true);
            toast.success("¡Pago confirmado! Activando tu licencia...");
            // Poll order status hasta que el webhook procese
            pollOrderStatus(res.orderId);
          }
          return false; // evita redirect automático de KR
        });

        await KR.addForm("#kr-form-container");
        await KR.showForm("#kr-form-container");

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Error al iniciar pago");
        setLoading(false);
      }
    })();
  }, [plan, authLoading, user, createPayment]);

  async function pollOrderStatus(id: string) {
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const status = await fetchOrderStatus({ data: { orderId: id } });
        if (status?.status === "paid") {
          toast.success("Licencia activada. Redirigiendo...");
          setTimeout(() => navigate({ to: "/dashboard" }), 1500);
          return;
        }
      } catch {
        // continúa
      }
    }
    toast.message(
      "Estamos confirmando tu pago. Si no se activa en unos minutos, contacta soporte."
    );
    setTimeout(() => navigate({ to: "/dashboard" }), 2000);
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-black mb-4">Plan no encontrado</h1>
          <Link to="/" className="text-primary underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-black italic tracking-tighter mb-2">
              {plan.name}
            </h1>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-6">
              {plan.duration}
            </p>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio</span>
                <span className="font-semibold">S/ {plan.pricePen.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Equivalente</span>
                <span className="text-muted-foreground">
                  ≈ ${plan.priceUsd.toFixed(2)} USD
                </span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-black tracking-tighter">
                  S/ {plan.pricePen.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Pago seguro procesado por Izipay</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 min-h-[400px]">
              {error && (
                <div className="text-destructive text-sm py-12 text-center">
                  {error}
                </div>
              )}
              {loading && !error && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm">Cargando formulario de pago...</p>
                </div>
              )}
              {success && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Confirmando pago y generando licencia...
                  </p>
                </div>
              )}
              <div
                id="kr-form-container"
                ref={formRef}
                className={loading || error ? "hidden" : ""}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Aceptamos Visa, Mastercard, American Express y Diners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
