/**
 * Fuente única de verdad para el sistema de diseño y paletas de color.
 * Centraliza todos los tokens visuales para UI, renderizado 3D y componentes dinámicos.
 */

export const colors = {
  // Paletas base de la aplicación (UI)
  ui: {
    dark: {
      background: "#07080c",
      foreground: "#e8eaf0",
      accent: "#7cf5c4",
      accent2: "#6c8cff",
      onAccent: "#000000",
      line: "rgba(255, 255, 255, 0.09)",
      grid: "rgba(255, 255, 255, 0.035)",
      glassA: "rgba(255, 255, 255, 0.06)",
      glassB: "rgba(255, 255, 255, 0.015)",
    },
    light: {
      background: "#eef1f7",
      foreground: "#11141d",
      accent: "#0a8f68",
      accent2: "#3b5bdb",
      onAccent: "#ffffff",
      line: "rgba(17, 20, 29, 0.1)",
      grid: "rgba(17, 20, 29, 0.06)",
      glassA: "rgba(255, 255, 255, 0.85)",
      glassB: "rgba(255, 255, 255, 0.45)",
    },
  },

  // Paleta de materiales, iluminación y texturas 3D (Three.js / R3F)
  three: {
    rocket: {
      hullBase: "#dce1ec",
      seam: "rgba(30, 38, 55, 0.7)",
      rivet: "rgba(30, 38, 55, 0.75)",
      stripe: "#e5484d",
      label: "#11141d",
      sootGradientStart: "rgba(14, 14, 18, 0.92)",
      sootGradientEnd: "rgba(14, 14, 18, 0)",
      darkStructure: "#14171f",
      interstage: "#12141b",
      metalEngine: "#2a2f3b",
      chrome: "#c9ced8",
      gridFin: "#4a505c",
      legPrimary: "#d7dbe4",
      legDark: "#1b1e27",
      glowLight: "#ff8a3d",
      exhaustHot: "#ffb15e",
      exhaustCoolDark: "#000000",
      exhaustCoolLight: "#eef1f7",
      ringLight: "#2563eb",
      ringDark: "#6c8cff",
    },
    lighting: {
      pointCyan: "#7cf5c4",
      pointBlue: "#6c8cff",
      sunDark: "#fff2e5",
      sunLight: "#ffffff",
      fillDark: "#6c8cff",
      fillLight: "#4a77ff",
      starHeadLight: "#3b5bdb",
      starHeadDark: "#ffffff",
      starTailLight: "#cbd5e1",
      starTailDark: "#000000",
      starPointLight: "#3b5bdb",
      starPointDark: "#cfe0ff",
      particleLight: "#3b5bdb",
      particleDark: "#9fb4ff",
    },
  },

  // Paleta del avión caza F-22 (SVG Vectorial)
  jet: {
    fuselageStart: "#4b5563",
    fuselageMid: "#2c3440",
    fuselageEnd: "#111827",
    wingsStart: "#525d6d",
    wingsEnd: "#1e2530",
    panel: "#374151",
    fin: "#1f2937",
    border: "#111827",
    stabilizer: "#28303d",
    intake: "#090d16",
    canopyGold: "#ffd700",
    canopyCyan: "#38bdf8",
    canopyDark: "#0f172a",
    flameWhite: "#ffffff",
    flameCyan: "#38bdf8",
    flameOrange: "#f97316",
    flameRed: "#ef4444",
    trail: "rgba(255, 255, 255, 0.6)",
  },
} as const;

export type ThemeColors = typeof colors;
