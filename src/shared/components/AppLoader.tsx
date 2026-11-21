"use client";

import { useEffect, useState } from "react";

interface AppLoaderProps {
  onComplete?: () => void;
  isInitialLoad?: boolean;
}

const TELEMETRY_STEPS = [
  "INICIALIZANDO SUBSISTEMAS...",
  "CALIBRANDO NÚCLEO 3D AEROSPACIAL...",
  "SINCRONIZANDO TELEMETRÍA ORBITAL...",
  "SISTEMAS OPERATIVOS // DEV-1 LISTO",
];

export function AppLoader({ onComplete, isInitialLoad = false }: AppLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isInitialLoad) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Incremento fluido y no lineal
        const increment = Math.max(2, Math.floor(Math.random() * 8) + 3);
        const next = Math.min(100, prev + increment);

        // Actualizar mensaje según progreso
        if (next > 75) setStepIndex(3);
        else if (next > 45) setStepIndex(2);
        else if (next > 20) setStepIndex(1);

        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isInitialLoad]);

  useEffect(() => {
    if (progress === 100 && isInitialLoad) {
      const timeout = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [progress, isInitialLoad, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-4 sm:p-6 md:p-12 bg-[#07080c] text-[#e8eaf0] transition-opacity duration-500 font-mono select-none overflow-hidden ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
    >
      {/* Fondo de rejilla cibernética */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Gradiente radial de atmósfera */}
      <div className="absolute w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] rounded-full bg-gradient-to-tr from-accent/10 via-accent2/10 to-transparent blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />

      {/* Cabecera superior HUD */}
      <div className="w-full flex items-center justify-between text-[11px] sm:text-xs text-fg/50 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          <span className="text-accent font-bold">&lt;dev.telemetry /&gt;</span>
        </div>
        <div className="text-[10px] sm:text-[11px] tracking-widest text-fg/40 uppercase">
          SYS.BOOT // DEV-1
        </div>
      </div>

      {/* Núcleo central con radar orbital */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          {/* Anillo exterior rotatorio */}
          <div className="absolute inset-0 rounded-full border border-dashed border-accent/30 animate-[spin_10s_linear_infinite]" />

          {/* Anillo intermedio con gradiente */}
          <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-accent border-r-accent2 animate-[spin_2.5s_linear_infinite]" />

          {/* Anillo interior contrarrotatorio */}
          <div className="absolute inset-6 sm:inset-7 rounded-full border border-fg/10 border-b-accent/60 animate-[spin_4s_linear_infinite_reverse]" />

          {/* Retículo de mira central */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-full h-px bg-fg" />
            <div className="h-full w-px bg-fg absolute" />
          </div>

          {/* Contenido en el centro del radar */}
          <div className="flex flex-col items-center justify-center z-10">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-space">
              {isInitialLoad ? `${progress}%` : "···"}
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-accent/80 font-mono mt-0.5">
              CARGANDO
            </span>
          </div>
        </div>

        {/* Mensaje de estado dinámico */}
        <div className="mt-6 sm:mt-8 text-center space-y-1 max-w-xs px-2">
          <p className="text-[11px] sm:text-xs text-accent font-bold tracking-wider animate-pulse flex items-center justify-center gap-1.5">
            <span className="text-fg/40">&gt;</span>
            {isInitialLoad ? TELEMETRY_STEPS[stepIndex] : "CONECTANDO CON EL SERVIDOR..."}
          </p>
          <p className="text-[9px] sm:text-[10px] text-fg/40 tracking-wider">
            PREPARANDO ENTORNO INTERACTIVO 3D
          </p>
        </div>

        {/* Barra de progreso de precisión */}
        <div className="w-56 sm:w-80 h-1.5 rounded-full bg-white/10 overflow-hidden mt-5 sm:mt-6 p-0.5 relative">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-accent via-accent2 to-emerald-400 transition-all duration-150 ease-out shadow-[0_0_12px_var(--color-accent)] ${
              !isInitialLoad ? "w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" : ""
            }`}
            style={{ width: isInitialLoad ? `${progress}%` : undefined }}
          />
        </div>
      </div>

      {/* Pie de telemetría HUD */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between text-[9px] sm:text-[10px] text-fg/40 gap-1.5 sm:gap-2 relative z-10 text-center sm:text-left">
        <div>ORBITAL COORDINATES: 37°14&apos;06&quot;N 115°48&apos;40&quot;W</div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span>MEM: OK</span>
          <span>GPU SHADERS: ACTIVE</span>
          <span className="text-accent">ONLINE</span>
        </div>
      </div>
    </div>
  );
}

export default AppLoader;
