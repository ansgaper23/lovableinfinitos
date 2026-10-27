import { useState, useEffect } from "react";
import { Key, RefreshCw, Copy, Check, Zap, MessageSquare, ShieldCheck, Activity, AlertCircle, Server, Clock, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { adminGenerateLicense, adminGenerateTrial, adminCheckFlowProConnection } from "@/lib/reseller-admin.functions";

interface Props {
  onSuccess?: () => void;
}

export const FlowProGeneratorCard = ({ onSuccess }: Props) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const [planType, setPlanType] = useState<"trial" | "days" | "lifetime">("days");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [days, setDays] = useState("30");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateTrialFn = useServerFn(adminGenerateTrial);
  const generateLicenseFn = useServerFn(adminGenerateLicense);
  const checkConnectionFn = useServerFn(adminCheckFlowProConnection);

  const handleAuditConnection = async (silent = false) => {
    setIsAuditing(true);
    try {
      const res = await checkConnectionFn();
      setAuditResult(res);
      if (!silent) {
        if (res?.ok) {
          toast.success(`Conexión Flow-Pro auditada: Activa (${res.latencyMs} ms)`);
        } else {
          toast.warning(`Flow-Pro respondió: ${res?.message}`);
        }
      }
    } catch (err: any) {
      if (!silent) {
        toast.error(err.message || "Error al auditar la conexión con Flow-Pro");
      }
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    // Auditoría inicial silenciosa al cargar el componente
    handleAuditConnection(true);
  }, []);

  const handleGenerate = async () => {
    if (!customerName.trim()) {
      toast.error("Ingresa el nombre o alias del cliente");
      return;
    }
    setIsGenerating(true);
    try {
      let result: any;
      if (planType === "trial") {
        result = await generateTrialFn({
          data: {
            displayName: customerName.trim(),
            customerPhone: customerPhone.trim() || undefined,
            minutes: 15,
          },
        });
      } else if (planType === "lifetime") {
        result = await generateLicenseFn({
          data: {
            displayName: customerName.trim(),
            customerPhone: customerPhone.trim() || undefined,
            lifetime: true,
          },
        });
      } else {
        result = await generateLicenseFn({
          data: {
            displayName: customerName.trim(),
            customerPhone: customerPhone.trim() || undefined,
            days: parseInt(days) || 30,
            lifetime: false,
          },
        });
      }

      if (result?.license_key) {
        setGeneratedKey(result.license_key);
        setCopied(false);
        toast.success("Licencia de Flow-Pro generada exitosamente");
        // Refrescar auditoría de estadísticas
        handleAuditConnection(true);
        onSuccess?.();
      }
    } catch (err: any) {
      toast.error(err.message || "Error al conectar con la API de Flow-Pro");
    } finally {
      setIsGenerating(false);
    }
  };

  const getWhatsAppLink = () => {
    if (!generatedKey) return "#";
    const text = encodeURIComponent(
      `Hola ${customerName}! Aquí tienes tu licencia oficial de Flow-Pro:\n\n🔑 Clave: ${generatedKey}\n\nActívala en tu panel o extensión.`
    );
    const phoneClean = customerPhone.replace(/[^0-9]/g, "");
    return phoneClean ? `https://wa.me/${phoneClean}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive via-red-500 to-amber-500" />
      <CardHeader className="pb-3 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-destructive animate-pulse" /> Auditoría & Generador de Conexión Flow-Pro
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-1">
              Monitoreo en tiempo real del enlace con el clúster oficial de flow-pro.online y emisión de licencias.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAuditConnection(false)}
              disabled={isAuditing}
              className="h-8 text-xs border-zinc-700 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 gap-1.5 px-2.5 shadow-sm"
              title="Ejecutar prueba de conectividad y latencia con Flow-Pro"
            >
              <Activity className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin text-amber-400" : "text-green-400"}`} />
              {isAuditing ? "Auditando..." : "Auditar Conexión"}
            </Button>
            <span className="text-[11px] font-mono bg-zinc-950 text-zinc-400 px-2 py-1 rounded border border-zinc-800 flex items-center gap-1.5">
              <Server className="w-3 h-3 text-destructive" /> flow-pro.online
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Resultado detallado de la Auditoría */}
        {auditResult && (
          <div
            className={`p-3.5 rounded-lg border text-xs space-y-2.5 transition-all ${
              auditResult.ok
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                : "bg-red-950/25 border-red-500/30 text-red-300"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-semibold">
              <span className="flex items-center gap-2 text-sm">
                {auditResult.ok ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{auditResult.message}</span>
              </span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`font-mono text-[11px] px-2 py-0.5 border ${
                    auditResult.ok
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-red-500/40 bg-red-500/10 text-red-300"
                  }`}
                >
                  <Activity className="w-3 h-3 mr-1 inline" />
                  {auditResult.latencyMs} ms
                </Badge>
                <Badge variant="outline" className="font-mono text-[11px] px-2 py-0.5 border-zinc-700 bg-zinc-900/60 text-zinc-300">
                  HTTP {auditResult.status || "ERR"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-400">
              <div>
                <span className="block text-zinc-500 text-[10px]">HOST & PROTOCOLO</span>
                <span className="text-zinc-200 truncate block">{auditResult.apiHost} ({auditResult.protocol || "TLS 1.3"})</span>
              </div>
              <div>
                <span className="block text-zinc-500 text-[10px]">API KEY ADMINISTRATIVA</span>
                <span className="text-amber-400 truncate block">{auditResult.configuredKey}</span>
              </div>
              <div>
                <span className="block text-zinc-500 text-[10px]">TOTAL GENERADAS</span>
                <span className="text-zinc-200 block font-semibold">{auditResult.stats?.totalEmitted ?? 0} licencias</span>
              </div>
              <div>
                <span className="block text-zinc-500 text-[10px]">DESGLOSE BD</span>
                <span className="text-zinc-300 block">
                  {auditResult.stats?.paidEmitted ?? 0} pagas / {auditResult.stats?.trialsEmitted ?? 0} demos
                </span>
              </div>
            </div>

            {auditResult.stats?.lastEmittedAt && (
              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/40">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Última emisión: {new Date(auditResult.stats.lastEmittedAt).toLocaleString()}
                </span>
                {auditResult.stats.lastEmittedName && (
                  <span className="text-zinc-500">Cliente: <strong className="text-zinc-300">{auditResult.stats.lastEmittedName}</strong></span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Nombre del Cliente *</label>
            <Input
              placeholder="Ej: Carlos Silva / VIP 01"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-9 bg-zinc-950 border-zinc-800 text-sm focus:border-destructive text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">WhatsApp / Teléfono (opcional)</label>
            <Input
              placeholder="Ej: +51999888777"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="h-9 bg-zinc-950 border-zinc-800 text-sm focus:border-destructive text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Tipo de Licencia</label>
            <Select value={planType} onValueChange={(v: any) => setPlanType(v)}>
              <SelectTrigger className="h-9 bg-zinc-950 border-zinc-800 text-sm text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="trial">Prueba (Demo / Trial)</SelectItem>
                <SelectItem value="days">Por Días</SelectItem>
                <SelectItem value="lifetime">Vitalicia (10 años)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {planType === "days" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Duración (Días)</label>
              <div className="flex gap-1.5">
                {[7, 30, 90, 365].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d.toString())}
                    className={`flex-1 text-xs py-1.5 rounded border transition-colors ${
                      days === d.toString()
                        ? "bg-destructive text-white border-destructive font-semibold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
                <Input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-16 h-9 bg-zinc-950 border-zinc-800 text-xs text-center text-white p-1"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center text-xs text-zinc-400 pt-6">
              {planType === "trial" ? "Licencia temporal para verificación." : "Licencia permanente sin límite."}
            </div>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !customerName.trim()}
          className="w-full h-10 bg-destructive hover:bg-destructive/90 text-white font-semibold text-sm transition-all shadow-md shadow-destructive/20"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Generando en Flow-Pro...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" /> Generar Licencia Flow-Pro
            </>
          )}
        </Button>

        {generatedKey && (
          <div className="p-3 bg-zinc-950 border border-green-500/30 rounded-lg space-y-2 mt-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-green-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Licencia Flow-Pro Generada
              </span>
              <span className="text-[11px] text-zinc-400">{customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs sm:text-sm bg-zinc-900 px-3 py-2 border border-zinc-800 rounded text-amber-300 font-semibold select-all break-all">
                {generatedKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(generatedKey);
                    setCopied(true);
                    toast.success("Licencia copiada al portapapeles");
                    setTimeout(() => setCopied(false), 2000);
                  } catch {
                    toast.error("Error al copiar");
                  }
                }}
                title="Copiar clave"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 shrink-0"
                title="Enviar por WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
