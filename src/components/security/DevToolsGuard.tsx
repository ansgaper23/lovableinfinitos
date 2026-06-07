import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

/**
 * Disuasión anti-DevTools (versión suave):
 * - Bloquea atajos comunes (F12, Ctrl+Shift+I/J/C, Ctrl+U) y click derecho.
 * - NO usa detección por tamaño de ventana ni `debugger` en bucle (causaba
 *   falsos positivos en producción y dejaba la web inaccesible).
 *
 * Nota: cualquier dato sensible vive en el servidor (RESELLER_API_KEY).
 */
export const DevToolsGuard = () => {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (import.meta.env.DEV) return;

    const blockKeys = (e: KeyboardEvent) => {
      const k = (e.key ?? "").toLowerCase();
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (k === "i" || k === "j" || k === "c")) ||
        (e.metaKey && e.altKey && (k === "i" || k === "j" || k === "c")) ||
        (e.ctrlKey && k === "u")
      ) {
        e.preventDefault();
        setBlocked(true);
      }
    };
    const blockMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener("keydown", blockKeys);
    window.addEventListener("contextmenu", blockMenu);

    return () => {
      window.removeEventListener("keydown", blockKeys);
      window.removeEventListener("contextmenu", blockMenu);
    };
  }, []);

  if (!blocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/98 backdrop-blur-xl p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center ring-1 ring-destructive/20">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">
          Acceso restringido
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Por motivos de seguridad, debes <span className="text-destructive font-bold">cerrar la consola</span> para
          continuar usando la plataforma.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-black italic uppercase tracking-widest text-xs h-12 px-8 transition-all"
        >
          He cerrado la consola
        </button>
      </div>
    </div>
  );
};
