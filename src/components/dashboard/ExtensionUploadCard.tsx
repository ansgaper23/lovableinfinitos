import { useEffect, useRef, useState } from "react";
import { Upload, Package, Loader2, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExtensionFile {
  name: string;
  size: number;
  updated_at: string;
}

export const ExtensionUploadCard = () => {
  const [file, setFile] = useState<ExtensionFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
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
    } else {
      setFile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (selected: File) => {
    setUploading(true);
    try {
      // Remove previous files (only keep latest)
      const { data: existing } = await supabase.storage.from("extensions").list("");
      if (existing && existing.length > 0) {
        await supabase.storage
          .from("extensions")
          .remove(existing.map((e) => e.name));
      }
      const { error } = await supabase.storage
        .from("extensions")
        .upload(selected.name, selected, { upsert: true, contentType: selected.type || "application/zip" });
      if (error) throw error;
      toast.success("Extensión subida correctamente");
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al subir";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!file) return;
    if (!confirm("¿Eliminar la extensión actual?")) return;
    const { error } = await supabase.storage.from("extensions").remove([file.name]);
    if (error) toast.error("Error al eliminar");
    else {
      toast.success("Extensión eliminada");
      setFile(null);
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    const { data, error } = await supabase.storage
      .from("extensions")
      .createSignedUrl(file.name, 60, { download: file.name });
    if (error || !data?.signedUrl) {
      toast.error("Error al descargar");
      return;
    }
    window.location.href = data.signedUrl;
  };

  const fmtSize = (b: number) => {
    if (!b) return "—";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="rounded-none border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black italic tracking-tighter text-white uppercase mb-1">
            Extensión del Navegador
          </h3>
          <p className="text-xs text-muted-foreground">
            Sube el archivo .zip de la extensión. Reemplaza al actual y queda disponible para todos los usuarios y revendedores.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando...
        </div>
      ) : (
        <>
          {file && (
            <div className="mb-4 p-3 rounded-none border border-white/10 bg-white/[0.02] flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-white/80 truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {fmtSize(file.size)} · {file.updated_at ? new Date(file.updated_at).toLocaleString() : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                className="rounded-none h-8 gap-1.5 text-xs font-black italic uppercase tracking-tighter"
              >
                <Download className="w-3.5 h-3.5" /> Ver
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="rounded-none h-8 gap-1.5 text-xs font-black italic uppercase tracking-tighter text-destructive hover:text-white hover:bg-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </Button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-none w-full h-11 gap-2 font-black italic uppercase tracking-tighter"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Subiendo..." : file ? "Reemplazar Extensión" : "Subir Extensión"}
          </Button>
        </>
      )}
    </div>
  );
};
