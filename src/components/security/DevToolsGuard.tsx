import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

/**
 * Disuasión anti-DevTools:
 * - Bloquea F12, Ctrl+Shift+I/J/C, Ctrl+U, click derecho.
 * - Detecta DevTools abiertas (diferencia outer/inner + timing del debugger).
 * - Cuando se detectan, dispara `debugger` en bucle y muestra overlay bloqueante.
 *
 * Nota: esto es disuasión, no seguridad real. Cualquier dato sensible debe
 * vivir en el servidor (ya lo está: RESELLER_API_KEY).
 */
export const DevToolsGuard = () => {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isDev = import.meta.env.DEV;
    if (isDev) return; // no molestar durante desarrollo

    const blockKeys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
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

    const THRESHOLD = 160;
    let triggered = false;

    const trigger = () => {
      triggered = true;
      setBlocked(true);
    };

    // 1) Detección por tamaño de ventana
    const sizeCheck = () => {
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      if (widthGap > THRESHOLD || heightGap > THRESHOLD) trigger();
    };

    // 2) Detección por timing del debugger
    const debugCheck = () => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const elapsed = performance.now() - start;
      if (elapsed > 100) trigger();
    };

    // 3) Detección por toString trap (consola intenta serializar)
    const trap: any = {};
    Object.defineProperty(trap, "id", {
      get() {
        trigger();
        return "";
      },
    });
    const consoleCheck = () => {
      try {
        console.log(trap);
        console.clear();
      } catch {
        /* ignore */
      }
    };

    const interval = window.setInterval(() => {
      sizeCheck();
      debugCheck();
      consoleCheck();
      if (triggered) {
        // mantener el debugger activo
        // eslint-disable-next-line no-debugger
        debugger;
      }
    }, 1000);

    return () => {
      window.removeEventListener("keydown", blockKeys);
      window.removeEventListener("contextmenu", blockMenu);
      window.clearInterval(interval);
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
          Hemos detectado las herramientas de desarrollador abiertas. Por motivos
          de seguridad, debes <span className="text-destructive font-bold">cerrar la consola</span> para
          continuar usando la plataforma. Si insistes, tu cuenta será bloqueada
          automáticamente.
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
