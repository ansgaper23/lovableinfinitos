import { useState } from "react";
import { Key, RefreshCw, Copy, Check, MessageSquare, Zap, Shield, Database } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ExtendedProfile } from "./SuperAdminUserComponents";

interface Props {
  user: ExtendedProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (data: { days: number; provider: "flowpro" | "nexxus" | "legacy"; planType: "trial" | "days" | "lifetime" }) => Promise<any>;
}

export const AssignLicenseDialog = ({ user, open, onOpenChange, onAssign }: Props) => {
  const [provider, setProvider] = useState<"flowpro" | "nexxus" | "legacy">("flowpro");
  const [planType, setPlanType] = useState<"trial" | "days" | "lifetime">("days");
  const [days, setDays] = useState<number>(30);
  const [customDays, setCustomDays] = useState<string>("30");
  const [isAssigning, setIsAssigning] = useState(false);
  const [result, setResult] = useState<{ license_key: string; expires_at: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsAssigning(true);
    try {
      const selectedDays = planType === "days" ? (parseInt(customDays) || days) : 30;
      const res = await onAssign({ days: selectedDays, provider, planType });
      setResult({ license_key: res.license_key, expires_at: res.expires_at });
      toast.success(`Licencia ${provider.toUpperCase()} asignada correctamente`);
    } catch (err: any) {
      toast.error(err.message || "Error al asignar licencia");
    } finally {
      setIsAssigning(false);
    }
  };

  const getWhatsAppLink = () => {
    if (!result || !user) return "#";
    const text = encodeURIComponent(
      `Hola! Tu licencia oficial de Flow-Pro ha sido asignada:\n\n🔑 Clave: ${result.license_key}\n\nActívala en tu panel o extensión.`
    );
    const phoneClean = (user.phone || "").replace(/[^0-9]/g, "");
    return phoneClean ? `https://wa.me/${phoneClean}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : onOpenChange(true))}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-destructive" /> Asignar Licencia a Usuario
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            {user?.email} {user?.phone ? `(${user.phone})` : ""}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-2">Proveedor / Sistema de Licencia</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setProvider("flowpro")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    provider === "flowpro"
                      ? "border-destructive bg-destructive/10 ring-1 ring-destructive text-white"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Zap className="w-4 h-4 text-destructive" />
                    <Badge variant="outline" className="text-[9px] border-destructive/40 text-destructive bg-destructive/10 px-1 py-0">Oficial</Badge>
                  </div>
                  <span className="text-xs font-bold text-white">Flow-Pro</span>
                  <span className="text-[10px] text-zinc-400">API Oficial</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider("nexxus")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    provider === "nexxus"
                      ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500 text-white"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-400 px-1 py-0">Reseller</Badge>
                  </div>
                  <span className="text-xs font-bold text-white">Nexxus</span>
                  <span className="text-[10px] text-zinc-400">Bridge API</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider("legacy")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    provider === "legacy"
                      ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 text-white"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Database className="w-4 h-4 text-blue-400" />
                    <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-400 px-1 py-0">Local</Badge>
                  </div>
                  <span className="text-xs font-bold text-white">Legacy Key</span>
                  <span className="text-[10px] text-zinc-400">Interna</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Tipo de Modalidad</label>
              <div className="grid grid-cols-3 gap-2">
                {(["days", "trial", "lifetime"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPlanType(t)}
                    className={`py-2 px-2 text-xs rounded border text-center font-medium capitalize transition-colors ${
                      planType === t
                        ? "bg-zinc-800 text-white border-zinc-600"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                    }`}
                  >
                    {t === "days" ? "Por Días" : t === "trial" ? "Prueba (Demo)" : "Vitalicia"}
                  </button>
                ))}
              </div>
            </div>

            {planType === "days" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Duración</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[7, 30, 90, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDays(d);
                        setCustomDays(d.toString());
                      }}
                      className={`py-1.5 text-xs rounded border transition-colors ${
                        customDays === d.toString()
                          ? "bg-destructive text-white border-destructive font-semibold"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {d} días
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-zinc-400">O días personalizados:</span>
                  <Input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="h-8 w-24 bg-zinc-950 border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-zinc-950 border border-green-500/30 rounded-lg space-y-3 my-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-400 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Licencia Generada Exitosamente
              </span>
              <Badge variant="outline" className="border-green-500/30 text-green-400 text-[10px] uppercase">
                {provider}
              </Badge>
            </div>
            <code className="block w-full font-mono text-sm bg-zinc-900 p-2.5 border border-zinc-800 rounded text-amber-300 font-semibold break-all select-all">
              {result.license_key}
            </code>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-zinc-700 text-xs gap-1.5"
                onClick={async () => {
                  await navigator.clipboard.writeText(result.license_key);
                  setCopied(true);
                  toast.success("Copiada al portapapeles");
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copiada" : "Copiar Clave"}
              </Button>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 h-8 rounded-md border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Enviar WhatsApp
              </a>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {!result ? (
            <>
              <Button variant="ghost" onClick={handleClose} disabled={isAssigning} className="text-xs">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isAssigning} className="bg-destructive hover:bg-destructive/90 text-white text-xs">
                {isAssigning ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Zap className="w-3.5 h-3.5 mr-1.5" />}
                Asignar con {provider === "flowpro" ? "Flow-Pro" : provider === "nexxus" ? "Nexxus" : "Legacy"}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full text-xs">Finalizar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
