import { globalStyles } from "./styles.js";
import { icons } from "./icons.js";

export type NavId =
  | "dashboard"
  | "instances"
  | "new"
  | "settings"
  | "leads"
  | "conversations"
  | "payments"
  | "products"
  | "media";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const formScript = `
<script>
document.querySelectorAll("form").forEach((f) => {
  f.addEventListener("submit", () => {
    const b = f.querySelector('button[type="submit"]');
    if (b) { b.disabled = true; b.textContent = "Salvando..."; }
  });
});
</script>`;

const spaScript = `
<script>
(function () {
  const main = document.querySelector(".content");
  if (!main) return;
  document.querySelectorAll(".sidebar .nav a[href^='/']").forEach((link) => {
    link.addEventListener("click", async (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      e.preventDefault();
      main.style.opacity = "0.55";
      main.style.pointerEvents = "none";
      try {
        const res = await fetch(href, { headers: { "X-Panel-Partial": "1" }, credentials: "same-origin" });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const next = doc.querySelector(".content");
        const title = doc.querySelector(".topbar h1");
        if (next) main.innerHTML = next.innerHTML;
        if (title) {
          const h = document.querySelector(".topbar h1");
          if (h) h.textContent = title.textContent;
        }
        document.querySelectorAll(".sidebar .nav a").forEach((a) => a.classList.remove("active"));
        link.classList.add("active");
        history.pushState({}, "", href);
        document.querySelectorAll("form").forEach((f) => {
          f.addEventListener("submit", () => {
            const b = f.querySelector('button[type="submit"]');
            if (b) { b.disabled = true; b.textContent = "Salvando..."; }
          });
        });
      } finally {
        main.style.opacity = "1";
        main.style.pointerEvents = "";
      }
    });
  });
})();
</script>`;

function navItem(href: string, label: string, icon: string, active: boolean) {
  const cls = active ? "active" : "";
  return `<a href="${href}" class="${cls}" data-nav>${icon} ${label}</a>`;
}

export function appLayout(title: string, active: NavId, body: string, partial = false) {
  if (partial) return `${body}${formScript}`;

  const is = (id: NavId) => active === id;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} · BotManager</title>
  <style>${globalStyles}</style>
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-brand"><div class="logo">BM</div> BotManager</div>
      <a href="/instances/new" class="btn-new">${icons.plus} Nova Instância</a>
      <nav class="nav">
        <div class="nav-section">
          ${navItem("/", "Dashboard", icons.dashboard, is("dashboard"))}
          ${navItem("/instances", "Instâncias", icons.layers, is("instances"))}
          ${navItem("/leads", "Leads", icons.users, is("leads"))}
          ${navItem("/conversations", "Conversas", icons.chat, is("conversations"))}
          ${navItem("/payments", "Pagamentos", icons.card, is("payments"))}
          ${navItem("/products", "Produtos", icons.box, is("products"))}
          ${navItem("/media", "Mídias", icons.image, is("media"))}
          ${navItem("/settings", "Configurações", icons.settings, is("settings"))}
        </div>
      </nav>
      <div class="sidebar-plan">
        <strong>Seu Plano: Pro</strong>
        <span>Gerencie bots com IA + vendas</span>
        <a href="/settings">Ver configurações</a>
      </div>
      <form method="post" action="/logout" style="margin-top:12px">
        <button type="submit" class="nav-btn" style="width:100%">${icons.logout} Sair</button>
      </form>
    </aside>
    <div class="main-wrap">
      <header class="topbar">
        <div class="topbar-left"><h1>${escapeHtml(title)}</h1></div>
        <div class="topbar-right">
          <button type="button" class="icon-btn">${icons.bell}</button>
          <div class="user-pill">
            <div class="user-avatar">KS</div>
            <div><div class="name">Kauan Store</div><div class="role">Administrador</div></div>
          </div>
        </div>
      </header>
      <main class="content">${body}</main>
      <footer class="footer">© 2026 BotManager. Todos os direitos reservados.</footer>
    </div>
  </div>
${formScript}${spaScript}
</body>
</html>`;
}

export function alertHtml(message: string, type: "success" | "error" = "success") {
  const cls = type === "error" ? "alert-error" : "alert-success";
  return `<div class="alert ${cls}">${escapeHtml(message)}</div>`;
}

export function botInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function botHandle(name: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
  return `@${slug || "bot"}_bot`;
}
