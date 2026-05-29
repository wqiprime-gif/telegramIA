import type { BotConfig } from "../bots.js";
import { giftSlugFromName } from "../lib/gifts.js";
import { icons } from "./icons.js";
import { alertHtml, appLayout, escapeHtml } from "./layout.js";

function mergeGiftItems(
  existing: BotConfig["giftItems"],
  raw: Record<string, string | string[]>
) {
  const names = raw.giftName;
  const messages = raw.giftAsk;
  const nameList = Array.isArray(names) ? names : names ? [names] : [];
  const msgList = Array.isArray(messages) ? messages : messages ? [messages] : [];
  const remove = new Set(
    (Array.isArray(raw.removeGiftIndexes)
      ? raw.removeGiftIndexes
      : raw.removeGiftIndexes
        ? [raw.removeGiftIndexes]
        : []
    ).map((v) => Number(v))
  );

  const kept = (existing ?? []).filter((_, i) => !remove.has(i));
  const added = nameList
    .map((name, i) => ({
      name: String(name || "").trim(),
      askMessage: String(msgList[i] || "").trim()
    }))
    .filter((g) => g.name)
    .map((g) => ({
      ...g,
      slug: giftSlugFromName(g.name),
      askMessage: g.askMessage || `amor, me manda um presentinho? ${g.name} 😘`
    }));

  return [...kept, ...added];
}

export function giftsPage(
  bots: BotConfig[],
  selectedBotId: string,
  message = "",
  isError = false,
  partial?: boolean
) {
  const bot = bots.find((b) => b.id === selectedBotId) ?? bots[0];
  const items = bot?.giftItems ?? [];

  const botOptions =
    bots.length === 0
      ? `<option value="">Cadastre uma instância</option>`
      : bots
          .map(
            (b) =>
              `<option value="${b.id}" ${b.id === bot?.id ? "selected" : ""}>${escapeHtml(b.name)}</option>`
          )
          .join("");

  const list =
    items.length === 0
      ? `<div class="empty glow-empty">Nenhum presente cadastrado. Adicione abaixo o que a IA pode pedir ao lead.</div>`
      : `<div class="gift-grid">
      ${items
        .map((item, i) => {
          const slug = item.slug || giftSlugFromName(item.name);
          return `<article class="gift-card">
          <div class="gift-card-head">
            <span class="gift-badge">${icons.sparkles}</span>
            <div>
              <h4>${escapeHtml(item.name)}</h4>
              <p class="muted-sm"><code>[[pedir_presente:${escapeHtml(slug)}]]</code></p>
            </div>
          </div>
          <p class="gift-ask-preview">${escapeHtml(item.askMessage)}</p>
          <label class="audio-remove"><input type="checkbox" form="gift-save-form" name="removeGiftIndexes" value="${i}" /> Remover</label>
        </article>`;
        })
        .join("")}
    </div>`;

  const body = `
    ${message ? alertHtml(message, isError ? "error" : "success") : ""}
    <div class="page-hero neon-hero">
      <div>
        <h2 class="hero-title"><span class="brand-accent">Pedir presentes</span></h2>
        <p class="hero-desc">Configure quando e como a IA pede mimos. Cadastre os presentes e use <code>[[pedir_presente]]</code> no prompt da instância.</p>
      </div>
    </div>
    <div class="card card-neon">
      <div class="card-head"><h3>${icons.layers} Instância</h3></div>
      <div class="card-body">
        <form method="get" action="/gifts" class="inline-form">
          <label class="field">Escolha o bot
            <select name="botId" onchange="this.form.submit()">${botOptions}</select>
          </label>
        </form>
      </div>
    </div>
    ${
      bot
        ? `
    ${list}
    <div class="card card-neon" style="margin-top:16px">
      <div class="card-head"><h3>${icons.sparkles} Prompt de presentes</h3></div>
      <div class="card-body">
        <form id="gift-save-form" method="post" action="/gifts">
          <input type="hidden" name="botId" value="${bot.id}" />
          <label class="field">Quando pedir presente (instrução para a IA)
            <textarea name="giftPrompt" rows="4" placeholder="Ex: depois que o lead elogiar ou demonstrar carinho, peça um mimo com leveza. Não peça na primeira mensagem.">${escapeHtml(bot.giftPrompt ?? "")}</textarea>
          </label>
          <div id="gift-new-blocks" class="seq-block"></div>
          <button type="button" class="btn btn-secondary btn-sm" id="gift-add-btn" style="margin:12px 0">${icons.plus} Adicionar presente</button>
          <button type="submit" class="btn btn-primary">Salvar configuração</button>
        </form>
      </div>
    </div>
    <script>${giftBlocksScript()}</script>`
        : ""
    }`;

  return appLayout("Pedir presentes", "gifts", body, partial);
}

function giftBlocksScript() {
  return `
(function(){
  var wrap = document.getElementById("gift-new-blocks");
  var btn = document.getElementById("gift-add-btn");
  if (!wrap || !btn) return;
  function add(){
    var row = document.createElement("div");
    row.className = "gift-add-row";
    row.innerHTML = '<label class="field">Nome do presente<input name="giftName" placeholder="Ex: Pix de R$ 10" /></label>'
      + '<label class="field">Mensagem ao pedir<textarea name="giftAsk" rows="2" placeholder="amor, me manda um pixinho de 10? 🥺"></textarea></label>'
      + '<button type="button" class="btn btn-secondary btn-sm gift-row-remove">Remover</button>';
    row.querySelector(".gift-row-remove").onclick = function(){ row.remove(); };
    wrap.appendChild(row);
  }
  btn.onclick = add;
  add();
})();
`.trim();
}

export { mergeGiftItems };
