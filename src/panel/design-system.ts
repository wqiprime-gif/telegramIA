/** BotManager — Lagoon Glass: profundidade oceânica + vidro líquido + sinal ciano */
export const designSystem = {
  colors: {
    bgBase: "#050a12",
    bgElevated: "#0c1522",
    bgSidebar: "rgba(8, 18, 32, 0.72)",
    bgCard: "rgba(14, 28, 46, 0.52)",
    bgCardSolid: "rgba(10, 20, 34, 0.96)",
    bgCardHover: "rgba(20, 38, 58, 0.65)",
    border: "rgba(136, 196, 255, 0.12)",
    borderHighlight: "rgba(180, 220, 255, 0.22)",
    primary: "#3dc8ff",
    primaryHover: "#5dd4ff",
    primaryDim: "rgba(61, 200, 255, 0.14)",
    primaryGlow: "rgba(61, 200, 255, 0.45)",
    accentIce: "#a8e4ff",
    accentMint: "#5ee4a8",
    accentAmber: "#ffc857",
    text: "#eef6fc",
    textSecondary: "#9eb4ca",
    muted: "#5f7a94",
    success: "#5ee4a8",
    successBg: "rgba(94, 228, 168, 0.12)",
    danger: "#ff6b6b",
    warning: "#ffc857",
    warningBg: "rgba(255, 200, 87, 0.12)"
  },
  glass: {
    blur: "28px",
    saturate: "1.35",
    shadow:
      "0 1px 0 rgba(255, 255, 255, 0.08) inset, 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.04)"
  },
  fonts: {
    display: "'Bricolage Grotesque', system-ui, sans-serif",
    sans: "'DM Sans', system-ui, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, monospace"
  },
  motion: "260ms cubic-bezier(0.22, 1, 0.36, 1)"
} as const;
