import type { BotConfig } from "../bots.js";
import { sourceEmoji, sourceLabel } from "../lib/lead-source.js";
import { alertHtml, appLayout, escapeHtml, type NavId } from "./layout.js";
import { icons } from "./icons.js";

function wrap(title: string, nav: NavId, body: string, partial?: boolean) {
  if (partial) return `${body}`;
  return appLayout(title, nav, body);
}

function formatMoney(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function leadsPage(rows: Record<string, unknown>[], partial?: boolean) {
  const list =
    rows.length === 0
      ? `<div class="empty">Nenhum lead ainda. Quando alguem falar com o bot, aparece aqui.</div>`
      : `<table class="table"><thead><tr><th>Lead</th><th>Origem</th><th>Bot</th><th>Chat ID</th><th>Ultima msg</th></tr></thead><tbody>
      ${rows
        .map(
          (r) => {
            const src = String(r.source || "unknown");
            return `<tr>
          <td><strong>${escapeHtml(String(r.display_name || r.username || "Lead"))}</strong><br/><span style="color:var(--muted);font-size:0.8rem">@${escapeHtml(String(r.username || "—"))}</span></td>
          <td><span class="source-badge ${escapeHtml(src)}">${sourceEmoji(src)} ${escapeHtml(sourceLabel(src))}</span></td>
          <td>${escapeHtml(String(r.bot_name || "—"))}</td>
          <td><code>${r.chat_id}</code></td>
          <td>${formatDate(String(r.last_message_at || r.lastMessageAt))}</td>
        </tr>`;
          }
        )
        .join("")}
      </tbody></table>`;

  const body = `<div class="card"><div class="card-head"><h3>${icons.users} Leads (${rows.length})</h3></div><div class="card-body" style="padding:0">${list}</div></div>`;
  return wrap("Leads", "leads", body.replaceAll("<div", "<div").replaceAll("</div>", "</div>"), partial);
}

export function paymentsPage(rows: Record<string, unknown>[], partial?: boolean) {
  const list =
    rows.length === 0
      ? `<div class="empty">Nenhum comprovante enviado ainda.</div>`
      : `<table class="table"><thead><tr><th>Status</th><th>Bot</th><th>Confianca</th><th>Motivo</th><th>Data</th></tr></thead><tbody>
      ${rows
        .map((r) => {
          const paid = Boolean(r.paid);
          return `<tr>
            <td><span class="badge ${paid ? "badge-online" : "badge-paused"}">${paid ? "Aprovado" : "Revisao"}</span></td>
            <td>${escapeHtml(String(r.bot_name || "—"))}</td>
            <td>${Math.round(Number(r.confidence || 0) * 100)}%</td>
            <td style="max-width:280px;font-size:0.85rem">${escapeHtml(String(r.reason || "").slice(0, 120))}</td>
            <td>${formatDate(String(r.created_at || r.createdAt))}</td>
          </tr>`;
        })
        .join("")}
      </tbody></table>`;

  const body = `<div class="card"><div class="card-head"><h3>${icons.card} Comprovantes / Pagamentos</h3></div><div class="card-body" style="padding:0">${list}</div></div>`;
  return wrap("Pagamentos", "payments", body.replaceAll("<div", "<div").replaceAll("</div>", "</div>"), partial);
}

export function productsPage(
  bots: BotConfig[],
  products: import("../db/events.js").Product[],
  message?: string,
  partial?: boolean
) {
  const body = `
    ${message ? alertHtml(message) : ""}
    <div class="card card-accent-gold" style="margin-bottom:16px">
      <div class="card-body" style="font-size:0.88rem;color:var(--text-2);line-height:1.6">
        <strong>O que é Produtos?</strong> Catálogo por instância (ex: R$ 10, R$ 20, R$ 30).
        Ative <strong>Oferta 50%</strong> para o bot oferecer metade do valor quando o lead disser que não consegue pagar.
      </div>
    </div>
    <div class="grid-2">
      <div class="card card-premium">
        <div class="card-head"><h3>Novo produto</h3></div>
        <div class="card-body">
          <form method="post" action="/products">
            <label class="field">Instância<select name="botId" required>
              ${bots.map((b) => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join("")}
            </select></label>
            <label class="field">Nome<input name="name" placeholder="Pacote Básico" required /></label>
            <label class="field">Preço (R$)<input name="price" type="number" step="0.01" min="1" placeholder="10.00" required /></label>
            <label class="field" style="flex-direction:row;align-items:center;gap:10px;margin-top:8px">
              <input type="checkbox" name="allowHalfPrice" value="true" style="width:auto" />
              <span>Oferta 50% se lead não conseguir pagar</span>
            </label>
            <label class="field">Desconto máximo (%)
              <input name="halfPricePercent" type="number" min="10" max="90" value="50" />
            </label>
            <button type="submit" class="btn btn-primary btn-block">Salvar produto</button>
          </form>
        </div>
      </div>
      <div class="card card-premium">
        <div class="card-head"><h3>Produtos (${products.length})</h3></div>
        <div class="card-body" style="padding:0">
          ${
            products.length === 0
              ? `<div class="empty">Cadastre produtos por instância.</div>`
              : `<table class="table"><thead><tr><th>Produto</th><th>Bot</th><th>Preço</th><th>50%</th></tr></thead><tbody>
              ${products
                .map(
                  (p) => `<tr>
                  <td><strong>${escapeHtml(p.name)}</strong></td>
                  <td>${escapeHtml(p.botName || "—")}</td>
                  <td class="product-price">${formatMoney(p.priceCents)}</td>
                  <td>${p.allowHalfPrice ? `${p.halfPricePercent}%` : "—"}</td>
                </tr>`
                )
                .join("")}
              </tbody></table>`
          }
        </div>
      </div>
    </div>`;

  return wrap("Produtos", "products", body, partial);
}

export function remarketingPage(
  bots: BotConfig[],
  selectedBotIds: string[],
  leads: { botId: string; chatId: number; username?: string; displayName?: string }[],
  message = "",
  isError = false,
  partial?: boolean
) {
  const botNameById = new Map(bots.map((b) => [b.id, b.name]));
  const botChecks =
    bots.length === 0
      ? `<p class="form-hint">Cadastre uma instância primeiro.</p>`
      : `<div class="bot-check-grid">
          ${bots
            .map(
              (b) => `<label class="bot-check">
              <input type="checkbox" name="botIds" value="${b.id}" ${selectedBotIds.includes(b.id) ? "checked" : ""} />
              <span>${escapeHtml(b.name)}</span>
            </label>`
            )
            .join("")}
        </div>`;

  const leadRows =
    leads.length === 0
      ? `<tr><td colspan="4" class="empty-cell">Nenhum lead nas instâncias selecionadas.</td></tr>`
      : leads
          .map((lead) => {
            const name = lead.displayName || lead.username || `Chat ${lead.chatId}`;
            const handle = lead.username ? `@${lead.username}` : `ID ${lead.chatId}`;
            const botName = botNameById.get(lead.botId) || "Bot";
            return `<tr>
            <td><span class="badge badge-online">${escapeHtml(botName)}</span></td>
            <td><strong>${escapeHtml(name)}</strong><br/><span class="muted-sm">${escapeHtml(handle)}</span></td>
            <td><code>${lead.chatId}</code></td>
            <td>
              <textarea name="msg_${lead.botId}_${lead.chatId}" rows="2" class="remarketing-msg"
                placeholder="Extra opcional para ${escapeHtml(name)}..."></textarea>
            </td>
          </tr>`;
          })
          .join("");

  const body = `
    ${message ? alertHtml(message, isError ? "error" : "success") : ""}
    <div class="page-hero neon-hero">
      <div>
        <h2 class="hero-title"><span class="brand-accent">Remarketing</span> multi-instância</h2>
        <p class="hero-desc">Selecione várias instâncias, defina uma <strong>sequência de mensagens</strong> com delay e personalize por lead se quiser.</p>
      </div>
    </div>
    <form method="post" action="/remarketing" class="card card-neon">
      <div class="card-head"><h3>${icons.megaphone} Campanha</h3></div>
      <div class="card-body">
        <label class="field">Instâncias
          ${botChecks}
        </label>
        <div class="seq-block">
          <h4 style="margin:16px 0 10px;font-size:0.9rem">Sequência de mensagens (todas as instâncias)</h4>
          <label class="field">Mensagem 1<textarea name="seq_0" rows="2" class="remarketing-msg" placeholder="Oi amor, sumiu? 😘"></textarea></label>
          <label class="field">Mensagem 2<textarea name="seq_1" rows="2" class="remarketing-msg" placeholder="Opcional — segunda mensagem"></textarea></label>
          <label class="field">Mensagem 3<textarea name="seq_2" rows="2" class="remarketing-msg" placeholder="Opcional — terceira mensagem"></textarea></label>
          <label class="field">Delay entre mensagens (segundos)
            <input name="seqDelaySec" type="number" min="0" max="300" value="8" />
          </label>
        </div>
        <div class="table-scroll remarketing-table-wrap" role="region">
          <table class="table remarketing-table">
            <thead><tr><th>Instância</th><th>Lead</th><th>Chat</th><th>Extra (opcional)</th></tr></thead>
            <tbody>${leadRows}</tbody>
          </table>
        </div>
        <p class="form-hint">Sequência + mensagem extra por lead. Delay humano entre cada bolha da sequência.</p>
        <button type="submit" class="btn btn-primary btn-block" ${bots.length === 0 ? "disabled" : ""}>
          Enviar remarketing
        </button>
      </div>
    </form>`;

  return wrap("Remarketing", "remarketing", body, partial);
}

export function mediaPage(bots: BotConfig[], partial?: boolean) {
  const items: { bot: string; type: string; url: string }[] = [];
  for (const bot of bots) {
    for (const url of bot.previewMediaUrls) {
      items.push({ bot: bot.name, type: "Prévia", url });
    }
    for (const url of bot.deliveryMediaUrls) {
      items.push({ bot: bot.name, type: "Entrega", url });
    }
    for (const audio of bot.audioLibrary ?? []) {
      items.push({ bot: bot.name, type: `Áudio: ${audio.label}`, url: audio.url });
    }
  }

  const list =
    items.length === 0
      ? `<div class="empty">Nenhuma midia enviada. Use upload em Nova Instância.</div>`
      : `<table class="table"><thead><tr><th>Bot</th><th>Tipo</th><th>Arquivo</th></tr></thead><tbody>
      ${items
        .map(
          (i) => `<tr>
          <td>${escapeHtml(i.bot)}</td>
          <td><span class="badge badge-online">${i.type}</span></td>
          <td><a href="${escapeHtml(i.url)}" target="_blank" style="color:var(--primary)">${escapeHtml(i.url)}</a></td>
        </tr>`
        )
        .join("")}
      </tbody></table>`;

  const body = `<div class="card"><div class="card-head"><h3>${icons.image} Midias (upload)</h3></div><div class="card-body" style="padding:0">${list}</div></div>`;
  return wrap("Mídias", "media", body.replaceAll("<div", "<div").replaceAll("</div>", "</div>"), partial);
}

export { salesChartSvgFromData, messagesChartSvgFromData, leadSourcesBarSvg } from "./charts.js";
