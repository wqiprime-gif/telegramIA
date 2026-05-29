import type { BotConfig } from "../bots.js";
import { BYANCA_PROMPT_TELEGRAM } from "../lib/prompt-byanca.js";
import { LEAD_SOURCES, sourceLabel, trackingLink } from "../lib/lead-source.js";
import { icons } from "./icons.js";
import { botHandle, botInitials, escapeHtml } from "./layout.js";

function delayPartsFromMs(ms: number) {
  const totalSec = Math.max(1, Math.round(ms / 1000));
  return {
    minutes: Math.floor(totalSec / 60),
    seconds: totalSec % 60
  };
}

function countAudioUrls(urls: string[]) {
  return urls.filter((u) => /\.(mp3|m4a|wav|ogg|opus)(\?.*)?$/i.test(u)).length;
}

export function botAvatarHtml(bot: BotConfig) {
  const initials = botInitials(bot.name);
  if (bot.avatarUrl) {
    const url = escapeHtml(bot.avatarUrl);
    return `<div class="bot-av-wrap">
      <img class="bot-av-img" src="${url}" alt="" loading="lazy"
        onerror="this.remove();this.parentElement.querySelector('.bot-av-fallback')?.classList.add('show')" />
      <div class="bot-av bot-av-fallback">${initials}</div>
    </div>`;
  }
  return `<div class="bot-av-wrap"><div class="bot-av bot-av-fallback show">${initials}</div></div>`;
}

function audioLibraryHtml(library: BotConfig["audioLibrary"]) {
  if (!library?.length) {
    return `<p class="form-hint">Nenhum áudio ainda. Ex: lead pergunta <strong>de onde</strong> → áudio fala <strong>sou de santa catarina</strong>. Gerencie tudo em <a href="/audios">Áudios</a>.</p>`;
  }
  return `<ul class="audio-library-list">
    ${library
      .map(
        (item, i) => `
      <li>
        <span class="audio-library-label">${escapeHtml(item.label)}</span>
        <code class="audio-slug-tag">[[audio:${escapeHtml(item.slug || item.label.toLowerCase().replace(/\s+/g, "_"))}]]</code>
        <span class="muted-sm">→ ${escapeHtml(item.triggers || item.keywords || "IA escolhe pelo prompt")}</span>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" class="card-link">ouvir</a>
        <label class="audio-remove"><input type="checkbox" name="removeAudioIndexes" value="${i}" /> remover</label>
      </li>`
      )
      .join("")}
  </ul>`;
}

function mediaChips(urls: string[], label: string) {
  if (urls.length === 0) return "";
  return `<p style="font-size:0.78rem;color:var(--muted);margin:8px 0 4px">${label} (${urls.length}):</p>
    <div class="media-preview-list">
      ${urls
        .map((url) => {
          const name = url.split("/").pop() || url;
          return `<span class="media-preview-chip">${escapeHtml(name)}</span>`;
        })
        .join("")}
    </div>
    <p style="font-size:0.72rem;color:var(--muted);margin-top:6px">Novos arquivos serão adicionados aos existentes.</p>`;
}

export function botInstanceForm(mode: "new" | "edit", bot?: BotConfig) {
  const isEdit = mode === "edit" && bot;
  const action = isEdit ? `/instances/${bot.id}` : "/bots";
  const price = isEdit ? (bot.productPriceCents / 100).toFixed(2) : "97";
  const activeTrue = !isEdit || bot.active;
  const paymentPix = !isEdit || bot.paymentMethod !== "laranjinha";
  const delay = delayPartsFromMs(isEdit ? bot.messageDelayMs : 4000);
  const previewAudios = isEdit ? countAudioUrls(bot.previewMediaUrls) : 0;
  return `
    <form method="post" action="${action}" enctype="multipart/form-data">
      <div class="form-grid">
        <label class="field">Nome da instância
          <input name="name" value="${isEdit ? escapeHtml(bot.name) : ""}" placeholder="Ex: MorenaVIP" required />
        </label>
        <label class="field">Status
          <select name="active">
            <option value="true" ${activeTrue ? "selected" : ""}>Online</option>
            <option value="false" ${!activeTrue ? "selected" : ""}>Pausado</option>
          </select>
        </label>
        <label class="field span-2">Token Telegram
          <input name="token" ${isEdit ? "" : "required"} autocomplete="off"
            placeholder="${isEdit ? "Deixe vazio para manter o token atual" : "123456789:ABC..."}" />
        </label>
        <label class="field span-2">Foto de perfil do bot
          <div class="dropzone">
            ${isEdit && bot.avatarUrl ? `<div style="margin-bottom:10px">${botAvatarHtml(bot)}</div>` : ""}
            <p style="color:var(--muted);margin-bottom:8px">${icons.upload} ${isEdit ? "Trocar foto (opcional)" : "Imagem quadrada (JPG/PNG)"}</p>
            <input name="avatarFile" type="file" accept="image/*" />
          </div>
        </label>
        <label class="field">Chave Pix
          <input name="pixKey" value="${isEdit ? escapeHtml(bot.pixKey) : ""}" placeholder="CPF, email ou telefone" required />
        </label>
        <label class="field">Nome do recebedor Pix
          <input name="pixRecipientName" value="${isEdit ? escapeHtml(bot.pixRecipientName) : ""}" placeholder="Nome no comprovante" />
        </label>
        <div class="form-section span-2">
          <div class="form-section-head">
            <span class="form-section-icon">${icons.chat}</span>
            <div>
              <h4>Comportamento humano</h4>
              <p>Pausa entre <strong>cada mensagem</strong> no Telegram (texto, áudio, foto).</p>
            </div>
          </div>
          <div class="delay-grid">
            <label class="field">
              Minutos
              <input name="messageDelayMinutes" type="number" min="0" max="30" value="${delay.minutes}" />
            </label>
            <label class="field">
              Segundos
              <input name="messageDelaySeconds" type="number" min="0" max="59" value="${delay.seconds}" />
            </label>
          </div>
          <p class="form-hint">Ex: 1 min + 30 seg = ~90s entre cada bolha. Comprovante usa pausa extra automática.</p>
        </div>

        <div class="form-section span-2 form-section-audio">
          <div class="form-section-head">
            <span class="form-section-icon form-section-icon-violet">${icons.audio}</span>
            <div>
              <h4>Biblioteca de áudios</h4>
              <p>Lead pergunta algo (gatilho) → bot manda o áudio com a resposta gravada. <a href="/audios">Ver biblioteca completa</a>.</p>
            </div>
          </div>
          ${audioLibraryHtml(isEdit ? bot.audioLibrary : [])}
          <div class="audio-add-grid audio-add-grid-3">
            <label class="field">
              O que o áudio <strong>fala</strong>
              <input name="newAudioLabel" placeholder="eu nao sou fake" />
            </label>
            <label class="field">
              <strong>ID no prompt</strong> (input)
              <input name="newAudioSlug" placeholder="nao_sou_fake" />
            </label>
            <label class="field">
              Gatilhos do lead <small>(opcional)</small>
              <input name="newAudioTriggers" placeholder="fake, golpe, voce e real, desconfio" />
            </label>
          </div>
          <p class="form-hint">No prompt: <code>se lead desconfiar use [[audio:nao_sou_fake]]</code> — a IA manda o áudio só nessa hora (cooldown 3 min).</p>
          <label class="field">
            Arquivo de áudio
            <div class="dropzone dropzone-audio">
              <p style="color:var(--muted);margin-bottom:8px">${icons.upload} MP3, M4A ou OGG (nota de voz)</p>
              <input name="newAudioFile" type="file" accept="audio/*,.ogg,.opus,audio/ogg" />
            </div>
          </label>
          ${isEdit ? `<p class="form-hint">Prévia: ${previewAudios} áudio(s) cadastrado(s)</p>` : ""}
        </div>

        <label class="field span-2" id="prompt">Prompt / persona da IA
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-byanca-prompt">Usar prompt Byanca (oficial)</button>
          </div>
          <script type="application/json" id="byanca-prompt-data">${escapeHtml(JSON.stringify(BYANCA_PROMPT_TELEGRAM))}</script>
          <textarea name="prompt" required>${isEdit ? escapeHtml(bot.prompt) : escapeHtml(BYANCA_PROMPT_TELEGRAM)}</textarea>
        </label>
        <div class="field span-2 card" style="padding:16px;margin-top:4px">
          <h4 style="font-family:var(--font-display);margin-bottom:8px">Rastrear origem do lead (TikTok, Instagram…)</h4>
          <p class="form-hint">Coloque estes links na bio de cada rede. Troque <strong>SEU_BOT</strong> pelo @ do bot no Telegram.</p>
          <div class="tracking-links">
            ${LEAD_SOURCES.filter((s) => s !== "unknown" && s !== "organic")
              .map(
                (s) =>
                  `<div><span class="source-badge ${s}">${sourceLabel(s)}</span><br/>
              <code class="tracking-link">${escapeHtml(trackingLink("SEU_BOT", s))}</code></div>`
              )
              .join("")}
            <div><span class="source-badge organic">Bio / direto</span><br/>
              <code class="tracking-link">${escapeHtml(trackingLink("SEU_BOT", "organic"))}</code></div>
          </div>
        </div>
        <script>
          document.getElementById("btn-byanca-prompt")?.addEventListener("click", function(){
            var el = document.getElementById("byanca-prompt-data");
            var ta = document.querySelector('[name="prompt"]');
            if (el && ta) ta.value = JSON.parse(el.textContent || '""');
          });
        </script>
        <label class="field span-2" id="midias">
          <span>Prévias (upload)</span>
          ${isEdit ? mediaChips(bot.previewMediaUrls, "Prévias atuais") : ""}
          <div class="dropzone">
            <p style="color:var(--muted);margin-bottom:8px">${icons.upload} ${isEdit ? "Adicionar mais prévias" : "Imagens, vídeos, áudios ou notas de voz (.ogg)"}</p>
            <input name="previewFiles" type="file" accept="image/*,video/*,audio/*,.ogg,.opus" multiple />
          </div>
        </label>
        <label class="field">Forma de pagamento
          <select name="paymentMethod">
            <option value="pix" ${paymentPix ? "selected" : ""}>Pix manual (chave)</option>
            <option value="laranjinha" ${!paymentPix ? "selected" : ""}>Gateway Laranjinha</option>
          </select>
        </label>
        <label class="field">API Key Laranjinha <small style="color:var(--muted)">se gateway</small>
          <input name="laranjinhaApiKey" type="password" placeholder="${isEdit ? "Deixe vazio para manter a atual" : "sua chave API"}" autocomplete="off" />
        </label>
        <label class="field">Produto / plano
          <input name="productName" value="${isEdit ? escapeHtml(bot.productName) : "VIP Gold"}" required />
        </label>
        <label class="field">Preço (R$)
          <input name="productPrice" type="number" step="0.01" min="1" value="${price}" required />
        </label>
      </div>
      <button type="submit" class="btn btn-primary btn-block" style="margin-top:12px">
        ${isEdit ? "Salvar alterações" : "Salvar e ativar instância"}
      </button>
    </form>`;
}

export function instancesTableHtml(bots: BotConfig[]) {
  if (bots.length === 0) {
    return `<div class="empty">Nenhuma instância ainda. <a href="/instances/new" style="color:var(--primary)">Criar primeira instância</a></div>`;
  }

  return `<div class="table-scroll" role="region" aria-label="Lista de instâncias">
    <table class="table table-instances">
    <thead><tr>
      <th>Bot</th><th>Status</th><th>Leads</th><th>Prévias</th>
      <th class="th-actions">Ações</th>
    </tr></thead>
    <tbody>
    ${bots
      .map(
        (bot) => `
      <tr>
        <td>
          <div class="bot-cell">
            ${botAvatarHtml(bot)}
            <div>
              <div class="title">${escapeHtml(bot.name)}</div>
              <div class="sub">${escapeHtml(botHandle(bot.name))}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge ${bot.active ? "badge-online" : "badge-paused"}">
            <span class="badge-dot"></span>
            ${bot.active ? "Online" : "Pausado"}
          </span>
        </td>
        <td><span class="metric">—</span></td>
        <td><span class="metric">${bot.previewMediaUrls.length}</span></td>
        <td class="td-actions">
          <div class="row-actions">
            <a href="/instances/${bot.id}/edit" class="action-btn" title="Editar configuração">
              <span class="action-btn__icon">${icons.edit}</span>
              <span class="action-btn__label">Editar</span>
            </a>
            <form method="post" action="/bots/${bot.id}/toggle">
              <button type="submit" class="action-btn action-btn--ghost" title="${bot.active ? "Pausar bot" : "Ativar bot"}">
                <span class="action-btn__label">${bot.active ? "Pausar" : "Ativar"}</span>
              </button>
            </form>
            <form method="post" action="/bots/${bot.id}/delete" onsubmit="return confirm('Remover esta instância?')">
              <button type="submit" class="action-btn action-btn--danger" title="Remover">${icons.trash}</button>
            </form>
          </div>
        </td>
      </tr>`
      )
      .join("")}
    </tbody>
    </table>
  </div>`;
}
