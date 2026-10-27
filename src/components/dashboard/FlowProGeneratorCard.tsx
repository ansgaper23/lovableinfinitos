import { useState } from "react";
import { Key, RefreshCw, Copy, Check, Zap, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { adminGenerateLicense, adminGenerateTrial } from "@/lib/reseller-admin.functions";

interface Props {
  onSuccess?: () => void;
}

export const FlowProGeneratorCard = ({ onSuccess }: Props) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [planType, setPlanType] = useState<"trial" | "days" | "lifetime">("days");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [days, setDays] = useState("30");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateTrialFn = useServerFn(adminGenerateTrial);
  const generateLicenseFn = useServerFn(adminGenerateLicense);

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
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-destructive animate-pulse" /> Generador de Licencias Flow-Pro
          </CardTitle>
          <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
            flow-pro.online
          </span>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Emite licencias oficiales directamente desde la API administrativa de Flow-Pro.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
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
