/** BotManager — TEXTURA-inspired: preto, branco, azul forte */
export const designSystem = {
  colors: {
    bgBase: "#030508",
    bgElevated: "#060a12",
    bgSidebar: "rgba(2, 4, 10, 0.92)",
    bgCard: "rgba(8, 12, 22, 0.88)",
    bgCardSolid: "rgba(6, 10, 18, 0.98)",
    bgCardHover: "rgba(12, 18, 32, 0.95)",
    border: "rgba(255, 255, 255, 0.08)",
    borderHighlight: "rgba(10, 92, 255, 0.45)",
    primary: "#0a5cff",
    primaryHover: "#2b74ff",
    primaryDim: "rgba(10, 92, 255, 0.14)",
    primaryGlow: "rgba(10, 92, 255, 0.55)",
    accentCyan: "#00b4ff",
    accentCyanDim: "rgba(0, 180, 255, 0.12)",
    accentViolet: "#3d7eff",
    accentVioletDim: "rgba(61, 126, 255, 0.12)",
    accentRose: "#0a5cff",
    accentRoseDim: "rgba(10, 92, 255, 0.12)",
    accentMint: "#00d4aa",
    accentMintDim: "rgba(0, 212, 170, 0.12)",
    text: "#ffffff",
    textSecondary: "#a8b4c8",
    muted: "#6b7a94",
    success: "#00d4aa",
    successBg: "rgba(0, 212, 170, 0.12)",
    danger: "#ff4d6d",
    warning: "#fbbf24",
    warningBg: "rgba(251, 191, 36, 0.12)"
  },
  glass: {
    blur: "24px",
    saturate: "1.2",
    shadow:
      "0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 0 0 1px rgba(10, 92, 255, 0.12), 0 28px 80px rgba(0, 0, 0, 0.55)"
  },
  fonts: {
    display: "'Bricolage Grotesque', system-ui, sans-serif",
    sans: "'Instrument Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace"
  },
  motion: "320ms cubic-bezier(0.22, 1, 0.36, 1)"
} as const;
