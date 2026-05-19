import type { BotConfig } from "../bots.js";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700&display=swap');
:root {
  color-scheme: dark;
  --bg: #030712;
  --surface: rgba(15, 23, 42, 0.78);
  --border: rgba(148, 163, 184, 0.14);
  --text: #f8fafc;
  --muted: #94a3b8;
  --accent: #8b5cf6;
  --accent-2: #22d3ee;
  --radius: 16px;
  --shadow: 0 24px 80px rgba(0,0,0,0.45);
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  font-family: "DM Sans", system-ui, sans-serif;
  color: var(--text);
  background:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(139,92,246,0.35), transparent),
    radial-gradient(ellipse 60% 40% at 100% 0%, rgba(34,211,238,0.18), transparent),
    var(--bg);
}
a { color: #a5b4fc; text-decoration: none; }
.shell { display: grid; min-height: 100vh; grid-template-columns: 260px 1fr; }
@media (max-width: 900px) { .shell { grid-template-columns: 1fr; } .sidebar { display: none; } }
.sidebar {
  border-right: 1px solid var(--border);
  background: rgba(2, 6, 23, 0.65);
  backdrop-filter: blur(20px);
  padding: 28px 20px;
}
.brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.brand-icon {
  width: 42px; height: 42px; border-radius: 14px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  display: grid; place-items: center; font-weight: 800;
}
.brand h1 { font-size: 1.05rem; margin: 0; }
.brand p { margin: 2px 0 0; font-size: 0.75rem; color: var(--muted); }
.nav { display: grid; gap: 6px; }
.nav a {
  padding: 12px 14px; border-radius: 12px;
  color: var(--muted); font-weight: 600; font-size: 0.92rem;
}
.nav a:hover, .nav a.active { background: rgba(255,255,255,0.06); color: var(--text); }
.content { padding: 28px 32px 48px; }
.topbar { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.topbar h2 { margin: 0; font-size: clamp(1.5rem, 3vw, 2rem); letter-spacing: -0.04em; }
.topbar p { margin: 6px 0 0; color: var(--muted); }
.stats { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); margin-bottom: 22px; }
.stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; box-shadow: var(--shadow); }
.stat strong { font-size: 1.6rem; display: block; }
.stat span { color: var(--muted); font-size: 0.85rem; }
.grid-2 { display: grid; gap: 20px; grid-template-columns: 1fr 1.1fr; align-items: start; }
@media (max-width: 1100px) { .grid-2 { grid-template-columns: 1fr; } }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 22px; box-shadow: var(--shadow); }
.card h3 { margin: 0 0 16px; }
.alert { border-radius: 12px; padding: 12px 14px; margin-bottom: 16px; font-size: 0.9rem; border: 1px solid rgba(52,211,153,0.35); background: rgba(52,211,153,0.1); color: #a7f3d0; }
.alert.warn { border-color: rgba(251,113,133,0.35); background: rgba(251,113,133,0.1); color: #fecdd3; }
.form-grid { display: grid; gap: 14px; grid-template-columns: repeat(2, 1fr); }
.form-grid .full { grid-column: 1 / -1; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
label { display: grid; gap: 7px; font-size: 0.82rem; font-weight: 600; color: #cbd5e1; }
input, textarea, select {
  width: 100%; background: rgba(2,6,23,0.85); border: 1px solid var(--border);
  border-radius: 12px; color: var(--text); padding: 12px 14px; font: inherit; outline: none;
}
input:focus, textarea:focus, select:focus { border-color: rgba(139,92,246,0.7); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
textarea { min-height: 100px; resize: vertical; }
input[type="file"] { border-style: dashed; padding: 14px; }
.btn {
  border: 0; border-radius: 12px; cursor: pointer; font: inherit; font-weight: 700;
  padding: 12px 18px; display: inline-flex; align-items: center; justify-content: center;
}
.btn-primary { background: linear-gradient(135deg, #7c3aed, #22d3ee); color: #fff; }
.btn-secondary { background: rgba(255,255,255,0.06); color: var(--text); border: 1px solid var(--border); }
.btn-danger { background: rgba(251,113,133,0.12); color: #fecdd3; border: 1px solid rgba(251,113,133,0.35); }
.bot-list { display: grid; gap: 12px; }
.bot-item { border: 1px solid var(--border); border-radius: 14px; padding: 16px; background: rgba(2,6,23,0.5); }
.bot-head { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
.badge { font-size: 0.72rem; font-weight: 800; padding: 6px 10px; border-radius: 999px; text-transform: uppercase; }
.badge.on { background: rgba(52,211,153,0.15); color: #6ee7b7; }
.badge.off { background: rgba(148,163,184,0.15); color: #cbd5e1; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
.chip { font-size: 0.78rem; padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border); color: #cbd5e1; }
.prompt { color: #cbd5e1; font-size: 0.88rem; line-height: 1.5; white-space: pre-wrap; margin: 8px 0; }
.login-wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
.login-card { width: min(420px, 100%); background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 32px; box-shadow: var(--shadow); }
.login-card h1 { margin: 0 0 8px; font-size: 1.75rem; }
.login-card > p { margin: 0 0 22px; color: var(--muted); }
.hint { font-size: 0.78rem; color: var(--muted); }
.settings-key { font-family: ui-monospace, monospace; padding: 12px; background: rgba(2,6,23,0.9); border-radius: 10px; border: 1px solid var(--border); color: #a5b4fc; margin: 12px 0; }
code { background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 6px; }
`;

function layout(title: string, body: string, nav: "dashboard" | "settings" | null) {
  const sidebar = nav
    ? `<aside class="sidebar">
        <div class="brand">
          <div class="brand-icon">IA</div>
          <div><h1>Telegram IA</h1><p>Painel privado</p></div>
        </div>
        <nav class="nav">
          <a href="/" class="${nav === "dashboard" ? "active" : ""}">Dashboard</a>
          <a href="/settings" class="${nav === "settings" ? "active" : ""}">Configurações</a>
          <form method="post" action="/logout" style="margin-top:24px">
            <button class="btn btn-secondary" style="width:100%">Sair</button>
          </form>
        </nav>
      </aside>`
    : "";

  const inner = nav ? `<div class="shell">${sidebar}<main class="content">${body}</main></div>` : body;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${styles}</style>
</head>
<body>${inner}</body>
</html>`;
}

export function loginPage(message = "") {
  const body = `
  <div class="login-wrap">
    <div class="login-card">
      <div class="brand">
        <div class="brand-icon">IA</div>
        <div><h1 style="margin:0;font-size:1.2rem">Telegram IA</h1><p style="margin:4px 0 0">Acesso restrito</p></div>
      </div>
      <h1>Entrar</h1>
      <p>Somente quem tem a senha do painel pode acessar bots e configurações.</p>
      ${message ? `<div class="alert warn">${escapeHtml(message)}</div>` : ""}
      <form method="post" action="/login">
        <label>Senha do painel
          <input name="password" type="password" required autofocus />
        </label>
        <button class="btn btn-primary" style="width:100%;margin-top:16px">Entrar</button>
      </form>
    </div>
  </div>`;
  return layout("Login", body, null);
}

export function dashboardPage(bots: BotConfig[], message = "") {
  const active = bots.filter((b) => b.active).length;
  const previews = bots.reduce((s, b) => s + b.previewMediaUrls.length, 0);
  const deliveries = bots.reduce((s, b) => s + b.deliveryMediaUrls.length, 0);

  const list = bots
    .map(
      (bot) => `
    <article class="bot-item">
      <div class="bot-head">
        <div><h4 style="margin:0">${escapeHtml(bot.name)}</h4><p style="margin:4px 0 0;color:var(--muted);font-size:0.8rem">Bot Telegram</p></div>
        <span class="badge ${bot.active ? "on" : "off"}">${bot.active ? "Ativo" : "Pausado"}</span>
      </div>
      <div class="chips">
        <span class="chip">Pix ${escapeHtml(bot.pixKey)}</span>
        <span class="chip">${bot.messageDelayMs}ms</span>
        <span class="chip">${bot.previewMediaUrls.length} prévias</span>
        <span class="chip">${bot.deliveryMediaUrls.length} entregas</span>
      </div>
      <p class="prompt">${escapeHtml(bot.prompt)}</p>
      <form method="post" action="/bots/${bot.id}/delete"><button class="btn btn-danger">Remover</button></form>
    </article>`
    )
    .join("");

  const body = `
    <header class="topbar">
      <div><h2>Dashboard</h2><p>Cadastre bots com token, prompt, Pix, prévias e entregas.</p></div>
      <form method="post" action="/restart"><button class="btn btn-secondary">Reiniciar bots</button></form>
    </header>
    ${message ? `<div class="alert">${escapeHtml(message)}</div>` : ""}
    <section class="stats">
      <div class="stat"><strong>${bots.length}</strong><span>bots</span></div>
      <div class="stat"><strong>${active}</strong><span>ativos</span></div>
      <div class="stat"><strong>${previews}</strong><span>prévias</span></div>
      <div class="stat"><strong>${deliveries}</strong><span>entregas</span></div>
    </section>
    <section class="grid-2">
      <div class="card">
        <h3>Novo bot</h3>
        <form method="post" action="/bots" enctype="multipart/form-data">
          <div class="form-grid">
            <label>Nome <input name="name" required /></label>
            <label>Status <select name="active"><option value="true">Ativo</option><option value="false">Pausado</option></select></label>
            <label class="full">Token Telegram <input name="token" required /></label>
            <label>Chave Pix <input name="pixKey" required /></label>
            <label>Delay (ms) <input name="messageDelayMs" type="number" value="1500" /></label>
            <label class="full">Prompt <textarea name="prompt" required>Voce atende leads no Telegram de forma simpatica, curta e persuasiva.</textarea></label>
            <label class="full">Upload prévias <input name="previewFiles" type="file" accept="image/*,video/*,audio/*" multiple /></label>
            <label class="full">Upload entregas <input name="deliveryFiles" type="file" accept="image/*,video/*,audio/*,application/pdf" multiple /></label>
            <label class="full">Links prévia <textarea name="previewMediaUrls"></textarea></label>
            <label class="full">Links entrega <textarea name="deliveryMediaUrls"></textarea></label>
          </div>
          <button class="btn btn-primary" style="width:100%;margin-top:14px">Salvar bot</button>
        </form>
      </div>
      <div class="card">
        <h3>Bots cadastrados</h3>
        <div class="bot-list">${list || `<p style="color:var(--muted)">Nenhum bot cadastrado.</p>`}</div>
      </div>
    </section>`;

  return layout("Dashboard", body, "dashboard");
}

export function settingsPage(input: {
  message?: string;
  maskedKey: string;
  configured: boolean;
  source: string;
  model: string;
}) {
  const body = `
    <header class="topbar">
      <div><h2>Configurações</h2><p>API Key do ChatGPT e modelo da IA.</p></div>
    </header>
    ${input.message ? `<div class="alert">${escapeHtml(input.message)}</div>` : ""}
    <section class="grid-2">
      <div class="card">
        <h3>OpenAI / ChatGPT</h3>
        <p style="color:var(--muted);font-size:0.9rem">
          ${input.configured ? `Chave ativa (${escapeHtml(input.source)}).` : "Sem chave — configure para os bots responderem."}
        </p>
        ${input.configured ? `<div class="settings-key">${escapeHtml(input.maskedKey)}</div>` : ""}
        <form method="post" action="/settings">
          <div class="form-grid">
            <label class="full">API Key
              <input name="openaiApiKey" type="password" placeholder="sk-proj-..." autocomplete="new-password" />
              <span class="hint">Deixe vazio para manter a atual.</span>
            </label>
            <label>Modelo <input name="openaiModel" value="${escapeHtml(input.model)}" /></label>
          </div>
          <button class="btn btn-primary" style="margin-top:14px">Salvar</button>
        </form>
      </div>
      <div class="card">
        <h3>Login do painel</h3>
        <p style="color:var(--muted);line-height:1.6;font-size:0.9rem">
          A senha de acesso vem da variável <code>PANEL_PASSWORD</code> no Railway.
          Sem login, ninguém acessa este painel.
        </p>
      </div>
    </section>`;

  return layout("Configurações", body, "settings");
}
