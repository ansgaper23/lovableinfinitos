import { useEffect, useState } from "react";
import { Download, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExtensionFile {
  name: string;
  size: number;
  updated_at: string;
}

export const ExtensionDownloadCard = () => {
  const [file, setFile] = useState<ExtensionFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.storage
        .from("extensions")
        .list("", { limit: 1, sortBy: { column: "updated_at", order: "desc" } });
      if (!error && data && data.length > 0) {
        const f = data[0];
        setFile({
          name: f.name,
          size: (f.metadata as { size?: number } | null)?.size ?? 0,
          updated_at: f.updated_at ?? f.created_at ?? "",
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleDownload = async () => {
    if (!file) return;
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from("extensions")
        .createSignedUrl(file.name, 60, { download: file.name });
      if (error || !data?.signedUrl) throw error ?? new Error("No URL");
      window.location.href = data.signedUrl;
    } catch (e) {
      toast.error("Error al descargar la extensión");
    } finally {
      setDownloading(false);
    }
  };

  const fmtSize = (b: number) => {
    if (!b) return "—";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-purple-900/10 to-zinc-950/80 p-6 lg:p-7 shadow-xl shadow-purple-950/30 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
          <Package className="w-6 h-6 text-purple-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white tracking-tight">Extensión de Navegador</h3>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200">
              Chrome
            </span>
          </div>
          <p className="text-xs text-purple-200/70 mb-4 leading-relaxed">
            Descarga la extensión oficial para activar tu licencia y empezar a usar Lovable con créditos infinitos.
          </p>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> Cargando datos del paquete...
            </div>
          ) : file ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-purple-300/80">
                <span className="font-mono text-purple-100 font-semibold truncate max-w-[200px]">{file.name}</span>
                <span>{fmtSize(file.size)}</span>
                {file.updated_at && (
                  <span>Actualizado: {new Date(file.updated_at).toLocaleDateString()}</span>
                )}
              </div>
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="rounded-2xl gap-2 h-11 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 transition-all"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {downloading ? "Descargando..." : "Descargar Extensión"}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-purple-300/60 font-medium">
              La extensión aún no está disponible. El administrador la subirá pronto.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
