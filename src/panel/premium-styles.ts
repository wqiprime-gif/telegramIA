/** Estilos premium v0.6 — login + dashboard (importado em styles.ts) */
export const premiumStyles = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

:root {
  --font-display: 'Bricolage Grotesque', system-ui, sans-serif;
  --font: 'Instrument Sans', system-ui, sans-serif;
}

#panel-scene-canvas {
  position: fixed; inset: 0; width: 100%; height: 100%;
  z-index: 0; pointer-events: none;
}

.mesh-blob {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 55% 45% at 12% 18%, rgba(255, 45, 85, 0.35), transparent 55%),
    radial-gradient(ellipse 45% 40% at 88% 12%, rgba(0, 212, 255, 0.22), transparent 50%),
    radial-gradient(ellipse 50% 50% at 50% 100%, rgba(168, 85, 247, 0.2), transparent 55%),
    #030308;
  animation: mesh-shift 18s ease-in-out infinite alternate;
}
@keyframes mesh-shift {
  0% { filter: hue-rotate(0deg) brightness(1); }
  100% { filter: hue-rotate(12deg) brightness(1.08); }
}

.auth-body { overflow: hidden; }
.auth-body .ambient { opacity: 0.15; }

.login-premium {
  position: relative; z-index: 2;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  gap: 48px;
  padding: 48px 56px;
}
@media (max-width: 960px) {
  .login-premium { grid-template-columns: 1fr; padding: 32px 20px; }
  .login-showcase { display: none; }
}

.login-showcase h1 {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.04em;
  margin: 28px 0 20px;
}
.login-showcase h1 em {
  font-style: normal;
  background: linear-gradient(120deg, #ff2d55 0%, #ff8fab 40%, #00d4ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 40px rgba(255, 45, 85, 0.45));
}
.login-tagline {
  font-size: 1.05rem; color: rgba(245, 245, 247, 0.75);
  line-height: 1.7; max-width: 480px;
}
.login-features {
  display: flex; flex-wrap: wrap; gap: 10px; margin-top: 32px;
}
.login-feature {
  padding: 10px 16px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 45, 85, 0.35);
  box-shadow: 0 0 30px rgba(255, 45, 85, 0.12);
  backdrop-filter: blur(12px);
}

.login-card-wrap {
  position: relative;
  display: flex; justify-content: center; align-items: center;
}
.login-card-glow {
  position: absolute;
  width: min(420px, 92vw); height: 420px;
  border-radius: 32px;
  background: conic-gradient(from 0deg, #ff2d55, #00d4ff, #a855f7, #ff2d55);
  filter: blur(40px);
  opacity: 0.45;
  animation: glow-spin 8s linear infinite;
}
@keyframes glow-spin { to { transform: rotate(360deg); } }

.login-card-premium {
  position: relative;
  width: min(400px, 92vw);
  padding: 44px 40px;
  border-radius: 28px;
  background: rgba(6, 6, 12, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 0 0 1px rgba(255, 45, 85, 0.2) inset,
    0 40px 100px rgba(0, 0, 0, 0.7),
    0 0 80px rgba(255, 45, 85, 0.15);
  backdrop-filter: blur(28px) saturate(1.4);
}
.login-card-premium h2 {
  font-family: var(--font-display);
  font-size: 1.85rem; font-weight: 800;
  letter-spacing: -0.03em; margin-bottom: 6px;
}
.login-card-premium .sub { color: var(--muted); margin-bottom: 28px; font-size: 0.9rem; }

.login-card-premium .field input {
  background: rgba(0, 0, 0, 0.55) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 14px !important;
  padding: 14px 16px !important;
  color: #fff !important;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.login-card-premium .field input:focus {
  border-color: rgba(255, 45, 85, 0.6) !important;
  box-shadow: 0 0 0 4px rgba(255, 45, 85, 0.15), 0 0 32px rgba(255, 45, 85, 0.2) !important;
  outline: none;
}

.btn-glow {
  margin-top: 12px;
  padding: 15px 24px !important;
  font-family: var(--font-display) !important;
  font-weight: 800 !important;
  font-size: 0.95rem !important;
  letter-spacing: 0.02em;
  border-radius: 14px !important;
  background: linear-gradient(135deg, #ff2d55, #ff5c7a 50%, #e6003d) !important;
  box-shadow: 0 12px 40px rgba(255, 45, 85, 0.45), inset 0 1px 0 rgba(255,255,255,0.25) !important;
  border: none !important;
  transition: transform 0.2s, box-shadow 0.2s !important;
}
.btn-glow:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 18px 50px rgba(255, 45, 85, 0.55) !important;
}

/* Dashboard premium */
.dash-hero {
  position: relative;
  padding: 28px 32px;
  margin-bottom: 24px;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 45, 85, 0.12) 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 212, 255, 0.08) 100%);
  border: 1px solid rgba(255, 45, 85, 0.25);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.06);
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px;
}
.dash-hero::before {
  content: "";
  position: absolute; top: -50%; right: -10%;
  width: 50%; height: 200%;
  background: linear-gradient(105deg, transparent, rgba(255,45,85,0.08), transparent);
  transform: rotate(12deg);
  pointer-events: none;
}
.dash-hero h2 {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 6px;
}
.dash-hero p { color: var(--text-2); font-size: 0.92rem; max-width: 520px; }
.dash-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; z-index: 1; }

.stats-row-premium {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
@media (max-width: 1100px) { .stats-row-premium { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .stats-row-premium { grid-template-columns: 1fr; } }

.stat-card-premium {
  position: relative;
  padding: 22px 20px;
  border-radius: 20px;
  background: rgba(10, 10, 16, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  overflow: hidden;
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}
.stat-card-premium::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,45,85,0.08), transparent 50%);
  pointer-events: none;
}
.stat-card-premium:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 45, 85, 0.35);
  box-shadow: 0 20px 50px rgba(255, 45, 85, 0.12);
}
.stat-card-premium .stat-value {
  font-family: var(--font-display);
  font-size: 2rem !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em;
  background: linear-gradient(180deg, #fff 30%, rgba(255,255,255,0.65));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stat-card-premium .stat-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  font-size: 1.2rem;
}

.card-premium {
  border-radius: 20px !important;
  background: rgba(8, 8, 14, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.04) !important;
  backdrop-filter: blur(20px) !important;
}
.card-premium .card-head {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
}
.card-premium .card-head h3 {
  font-family: var(--font-display) !important;
  font-weight: 700 !important;
}

.mesh-blob--app { opacity: 0.55; }
.sidebar {
  background: rgba(3, 3, 8, 0.88) !important;
  border-right: 1px solid rgba(255, 45, 85, 0.15) !important;
  box-shadow: 4px 0 40px rgba(0,0,0,0.5) !important;
}
.topbar {
  background: rgba(4, 4, 10, 0.75) !important;
  border-bottom: 1px solid rgba(255, 45, 85, 0.12) !important;
}
.topbar h1 {
  font-family: var(--font-display) !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
}
`;
