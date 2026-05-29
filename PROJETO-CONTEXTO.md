# PROJETO-CONTEXTO.md — BotManager

> **Documento mestre.** Ler antes de qualquer mudança grande.  
> Objetivo: Telegram rodando **liso igual WhatsApp (hotbot)** → depois subir **WhatsApp no Railway**.

**Última atualização:** 2026-05-22 · Versão alvo: **0.5.x**  
**Prompt referência:** [prompts/PROMPT-BYANCA-REFERENCIA.md](./prompts/PROMPT-BYANCA-REFERENCIA.md)

---

## 0. Plano em 3 fases (ordem obrigatória)

| Fase | O quê | Status |
|------|--------|--------|
| **1 — Telegram liso** | Paridade fluxo Byanca/hotbot + corrigir bugs + segurança + design premium | 🔴 EM ANDAMENTO |
| **2 — WhatsApp Railway** | Portar/adaptar `hotbot (2)` para mesmo backend ou deploy unificado | ⚪ DEPOIS |
| **3 — Polimento** | Remarketing avançado, métricas, notificações ops | ⚪ DEPOIS |

**Regra:** não começar Fase 2 antes da Fase 1 passar no checklist §12 com prompt Byanca.

---

## 1. Visão geral

| | Telegram (agora) | WhatsApp (depois) |
|---|------------------|-------------------|
| Código | `projetoIA/src/` | `hotbot (2)/hotbot/hotbot/` |
| Motor conversa | `src/index.ts` | `bot-instance.js` |
| Painel | Fastify `src/panel/` | `hotbot-admin/` |
| Produção | Railway `bottelegram-production-8449.up.railway.app` | Subir na Railway (Fase 2) |
| Repo | `telegramIA` + `bot_telegram` | Integrar ou monorepo futuro |

---

## 2. Prompt oficial (Byanca Costa)

O fluxo de vendas deve seguir o prompt em **`prompts/PROMPT-BYANCA-REFERENCIA.md`**.

Resumo das regras que o **código deve garantir** (não só confiar na IA):

| Regra do prompt | Implementação necessária |
|-----------------|---------------------------|
| Máx. 2 frases | `limitSentences()` ✅ — manter |
| 1ª msg = saudação, sem tabela | Estado `isFirstMessage` + bloquear `send_informacoes` no 1º turno |
| `send_informacoes` só após confirmar interesse | Flag `hasSentInformacoes` por chat ✅ parcial |
| `send_amostra_gratis` 1x | `previewUsed` ✅ |
| Recusa 2ª prévia | Mensagens fixas ✅ |
| `naosou_fake` | `[[naosou_fake]]` + `[[audio:nao_sou_fake]]` ✅ |
| `ignorar_lead` após enrolação 6+ msgs | Contador + escalada frieza ✅ (v0.5.0) |
| 3 pacotes + negociação mínima | `negotiationReply` R$5/10/15 ✅ — config painel ⚠️ |
| Chamada vídeo (Telegram) | `[[chamada_video]]` ✅ (v0.5.0) |
| Pix + comprovante | ✅ validar + entregar |
| Após pagamento = silêncio | `silenceChat` após paid ✅ (v0.5.0) |
| Áudio confuso do lead | Whisper + pedir texto ❌ **FALTA** |

---

## 3. BACKLOG — Funções NOVAS (Telegram)

### 3.1 Fluxo / IA (prioridade ALTA)

- [x] **`leadState` por chat** — `src/lib/lead-state.ts` (v0.5.0)
- [x] **Escalada "lead enrolando"** — 3 mensagens frias + ignore em 6+ msgs (v0.5.0)
- [x] **`[[chamada_video]]`** — `src/lib/sales-packages.ts` (v0.5.0)
- [ ] **Whisper** — transcrever voz/nota do lead → passar como texto no fluxo
- [ ] **`detectarPacote()`** — regex + contexto (portar de `bot-instance.js` hotbot)
- [x] **Negociação com mínimos** — `negotiationReply` (v0.5.0)
- [x] **`paidChats` permanente** — `silenceChat` após comprovante (v0.5.0)
- [ ] **Fila global entre leads** (45s–2min) — opcional, como hotbot
- [ ] **Debounce por lead** (buffer 30–60s antes de chamar OpenAI)
- [ ] **OpenAI tools** (function calling) em vez de só tags no texto — alinhar hotbot

### 3.2 Painel (prioridade MÉDIA)

- [ ] **Aba Pacotes** por instância (nome, preço, mínimo, link entrega) — JSON em `BotConfig.packages`
- [ ] **Template prompt Byanca** — botão "Usar modelo Byanca" no form instância
- [ ] **Preview do prompt** com contagem de caracteres
- [ ] **Links de entrega** por pacote (Básico / Chamada / Completo)
- [ ] **Dashboard**: leads hoje, vendas, conversão
- [ ] **Logs de ação** por instância (últimos erros Telegram/OpenAI)

### 3.3 Pós-venda / ops (prioridade BAIXA)

- [ ] Notificar admin Telegram (`TELEGRAM_CHAT_ID`) quando venda confirmada
- [ ] Export leads CSV

---

## 4. BACKLOG — Funções ARRUMAR (bugs / débito técnico)

### 4.1 Bot

- [x] **`send_informacoes` não dispara** no 1º turno (v0.5.0)
- [x] **`hasSentInformacoes`** — não enviar tabela 2x (v0.5.0)
- [ ] Comprovante validar **nome destinatário** (`pixRecipientName`) + **valor do pacote detectado**
- [ ] Entrega: link correto por pacote (não só `telegramGroupLink` genérico)
- [ ] Sincronizar texto prompt (SP/RJ) com áudios de localização (não SC se prompt diz SP)
- [ ] Reinício de bot após editar instância no painel (`restartBots`) — testar em produção
- [ ] Histórico IA: incluir estado (já enviou tabela, etc.) no system message

### 4.2 Painel

- [ ] Testar **todas** rotas autenticadas após cada release
- [ ] Upload áudio > limite / tipo inválido — mensagem clara
- [ ] CSRF em forms POST (token ou SameSite strict) 
- [ ] Rate limit login (`/login`, `/register`)
- [ ] Não expor stack trace em produção (Fastify `logger` só)
- [ ] Mobile: sidebar + tabelas responsivas

### 4.3 Infra

- [ ] `SESSION_SECRET` obrigatório em produção (falhar startup se vazio no Railway)
- [ ] Health incluir `postgres: true` e versão
- [ ] Migrations idempotentes testadas em DB vazio Railway

---

## 5. BACKLOG — Design PREMIUM

Meta: painel nível SaaS (não genérico). Referência visual: neon escuro atual + polimento hotbot-admin.

- [ ] **Tipografia** consistente (Outfit/Inter) — revisar hierarquia h1/h2/body
- [ ] **Micro-animações** (hover cards, transições nav) — sem exagero
- [ ] **Empty states** ilustrados/texto útil em todas páginas vazias
- [ ] **Skeleton loading** no SPA partial nav
- [ ] **Dark mode único** polido (contraste WCAG AA)
- [ ] **Formulário instância** em abas: Geral | Prompt | Pacotes | Mídias | Áudios
- [ ] **Ícones** consistentes (`icons.ts`) em todas ações
- [ ] **Toasts** sucesso/erro padronizados
- [ ] Login: split hero + card (já tem) — refinAR blur/glow
- [ ] **Favicon** + meta title por página

---

## 6. BACKLOG — SEGURANÇA

| Item | Prioridade | Notas |
|------|------------|-------|
| Senhas bcrypt | ✅ | `password.ts` |
| Cookies sessão httpOnly | Verificar | `session.ts` |
| `SESSION_SECRET` forte obrigatório prod | ALTA | |
| Rate limit login | ALTA | 5 tentativas / 15 min |
| Helmet headers (CSP, HSTS) | MÉDIA | Fastify `@fastify/helmet` |
| Sanitizar uploads (mime + ext) | ALTA | já parcial |
| Tokens bot só no servidor | ✅ | nunca no HTML |
| SQL parametrizado | ✅ | pg queries |
| Isolamento multi-tenant | ALTA | `user_id` em todos bots |
| Não logar `OPENAI_API_KEY` / tokens | ALTA | revisar logs |
| HTTPS only Railway | ✅ | |
| Rotas admin sem auth | Auditar | `/uploads` público — OK; resto protegido |
| Validação Zod em todos POST | MÉDIA | revisar rotas |

---

## 7. Paridade hotbot ↔ Telegram (tabela viva)

| Comportamento | hotbot | Telegram | Prioridade |
|---------------|--------|----------|------------|
| Prompt Byanca completo | messages.json | PROMPT-BYANCA-REFERENCIA | ✅ doc |
| send_informacoes 1x | tool | tag | fix 1x |
| send_amostra 1x | tool | tag | ✅ |
| naosou_fake | mp3 | audio slug | ✅ |
| ignorar_lead | tool | tag | + contador msgs |
| chamada_video | mp3/text | — | NOVA |
| Escalada frieza 3 níveis | prompt | — | NOVA |
| Negociação mínimos | código | — | NOVA |
| detectarPacote comprovante | bot-instance | — | NOVA |
| paidUsers silêncio | ✅ | parcial | FIX |
| Fila entre leads | ✅ | — | opcional |
| Whisper voz lead | ✅ | — | NOVA |
| pacotes.json UI | admin | — | NOVA |
| Remarketing | ❌ | ✅ por lead | OK |

**Arquivo fonte hotbot:** `hotbot (2)/hotbot/hotbot/bot-instance.js`

---

## 8. O que já foi feito (não quebrar)

Ver commits `0.4.0` – `0.4.4`: painel neon, áudios `[[audio:slug]]`, remarketing 1:1, Postgres Railway, migração `user_id`, SSL internal, healthcheck resiliente.

Detalhes históricos: seções antigas em git — bugs §9 abaixo.

---

## 9. Bugs — NÃO REPETIR

| Bug | Regra |
|-----|--------|
| Áudio em "oi amor" | Só gatilhos explícitos; não label no match |
| SSL em `postgres.railway.internal` | `postgresSsl()` sem SSL interno |
| `dbAvailable` antes de migrations | Setar true antes `initUsersSchema` |
| Botões tabela cortados | `card--table` + scroll |
| `database: false` com URL certa | Redeploy + fix SSL |

---

## 10. Railway (produção)

- URL: https://bottelegram-production-8449.up.railway.app
- `DATABASE_URL` = ref Postgres internal
- `PANEL_PASSWORD`, `OPENAI_API_KEY`, `ADMIN_EMAIL`, `DATA_DIR=/data` + volume
- Health OK: `version` 0.4.4+, `database: true`

---

## 11. Arquitetura rápida

```
src/index.ts          → handlers Telegram + startup
src/lib/
  prompt-actions.ts   → tags [[send_*]]
  named-audio.ts      → [[audio:slug]]
  bot-intents.ts      → intents (greeting, pix…)
  receipt-validator.ts
src/panel/            → UI
src/db/               → Postgres
```

---

## 12. Checklist “rodando liso” (prompt Byanca)

Testar **no Telegram real** após cada release:

1. [ ] Lead: `oi` → só saudação, sem tabela  
2. [ ] Lead: `o que você tem?` → engaja, pergunta se quer tabela  
3. [ ] Lead: `sim` / `manda` → tabela 3 pacotes **1x**  
4. [ ] Lead: pede foto → prévia **1x** + "Gostou amor?"  
5. [ ] Lead: pede mais foto → recusa comprando  
6. [ ] Lead: `é golpe?` → naosou_fake (áudio ou texto)  
7. [ ] Lead: enrola 6+ msgs → ignorar (para de responder)  
8. [ ] Lead: quer comprar → Pix da instância  
9. [ ] Lead: comprovante OK → entrega + **silêncio**  
10. [ ] Lead: negocia R$5 sem pacote → oferece básico mínimo  
11. [ ] Voz lead → transcreve e responde  
12. [ ] Chamada vídeo pergunta → resposta Telegram  

---

## 13. Fase 2 — WhatsApp no Railway (depois)

- [ ] Decidir: migrar hotbot para este repo OU serviço separado no Railway
- [ ] Postgres compartilhado ou não
- [ ] whatsapp-web.js + Chromium no Railway (memória/Chrome — avaliar)
- [ ] Unificar painel: uma UI para instâncias TG + WA
- [ ] Portar `bot-instance.js` lógica para módulo compartilhado `src/lib/sales-flow.ts`

---

## 14. Regras para o agente

1. Ler **este arquivo** + **PROMPT-BYANCA-REFERENCIA.md** antes de codar fluxo.  
2. Uma feature por PR mental: não misturar redesign total + fluxo + segurança.  
3. Atualizar checklist §12 quando fechar item.  
4. Bump versão `0.5.x` em fluxo grande.  
5. Não commitar secrets.  
6. Testar `npm run typecheck` antes de push.

---

## 15. Links

- [RAILWAY-SETUP.md](./RAILWAY-SETUP.md)
- [LOCAL.md](./LOCAL.md)
- [prompts/PROMPT-BYANCA-REFERENCIA.md](./prompts/PROMPT-BYANCA-REFERENCIA.md)
- Repo: https://github.com/wqiprime-gif/telegramIA

---

*Atualizar este arquivo quando fechar item do backlog ou corrigir bug recorrente.*
