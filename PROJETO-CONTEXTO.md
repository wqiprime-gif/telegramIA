# PROJETO-CONTEXTO.md — BotManager Telegram

> **Documento vivo.** Atualizar a cada mudança importante. Objetivo: o agente (e o time) não repetir bugs, não quebrar o painel e alinhar o Telegram com o fluxo do WhatsApp (hotbot).

**Última atualização:** 2026-05-22 · Versão em produção alvo: **0.4.4**

---

## 1. Visão geral

| Item | Telegram (este repo) | WhatsApp (referência) |
|------|----------------------|------------------------|
| Pasta | `projetoIA/` (raiz) | `hotbot (2)/hotbot/hotbot/` |
| Plataforma | Telegram (Telegraf) | WhatsApp (whatsapp-web.js) |
| Painel | Fastify + HTML embutido (`src/panel/`) | `hotbot-admin/` + CLI |
| Banco | PostgreSQL (Railway) ou `data/` (local) | Arquivos JSON (sem DB ativo) |
| Repo GitHub | `wqiprime-gif/telegramIA` + `kauan123749578/bot_telegram` | Local / Contabo |
| Produção Railway | `https://bottelegram-production-8449.up.railway.app` | N/A |

**Meta do projeto:** painel profissional multi-cliente para bots de venda (IA + Pix + comprovante + áudios nomeados + remarketing), com a **mesma lógica de fluxo** do hotbot WhatsApp, adaptada para Telegram.

---

## 2. O que já foi feito (Telegram)

### Painel / UX
- [x] Login multi-usuário (`panel_users`, sessão cookie)
- [x] Tema neon + logo Telegram (`Telegram-Logo.png`, `/brand/telegram-logo.png`)
- [x] SPA parcial (`panel-client.ts`), polling, toasts
- [x] Páginas: Dashboard, Instâncias, Leads, Remarketing, Conversas, Pagamentos, Produtos, **Áudios** (`/audios`), Mídias, Configurações
- [x] Editar instância sem recriar (`/instances/:id/edit`)
- [x] Tabela de instâncias com scroll + botões não cortados
- [x] Delay em **minutos + segundos** no formulário
- [x] Remarketing **mensagem diferente por lead** (não broadcast único)

### Bot / IA
- [x] Sem resposta automática a `/start`
- [x] Delay humano entre mensagens (`humanize.ts`, `telegram-send.ts`)
- [x] Respostas curtas (máx. 2 frases)
- [x] Tags de ação no prompt: `[[send_informacoes]]`, `[[send_amostra_gratis]]`, `[[naosou_fake]]`, `[[ignorar_lead]]`
- [x] Áudios por **input** `[[audio:slug]]` (ex: `nao_sou_fake`) + gatilhos do lead
- [x] Áudio só em contexto certo (localização / desconfiança — **não** em "oi amor" ou tabela)
- [x] Cooldown 3 min por áudio por chat (não spammar voz)
- [x] Comprovante imagem/PDF + entrega automática
- [x] Prévia com cooldown 90s + **uma vez** por lead (`previewUsed`)

### Infra / Deploy
- [x] Railway: `railway.json`, `nixpacks.toml`, health `/health`
- [x] Fallback Postgres → arquivos `data/` se DB offline
- [x] Fix migração `user_id` (ordem `initUsersSchema` + `dbAvailable` antes das migrações)
- [x] Fix SSL: **não** usar SSL em `postgres.railway.internal` (v0.4.4)
- [x] Startup não mata processo se `loadBots` falhar (healthcheck passa)
- [x] Docs: `RAILWAY-SETUP.md`, `DEPLOY-RAILWAY.md`, `LOCAL.md`

### Versões recentes (Git)
| Versão | Commit tema |
|--------|-------------|
| 0.4.4 | SSL Postgres rede interna Railway |
| 0.4.3 | Healthcheck não cai no startup |
| 0.4.2–0.4.1 | Migração `user_id`, redeploy |
| 0.4.0 | Neon UI, áudios slug, remarketing por lead |

---

## 3. Bugs conhecidos — NÃO REPETIR

### Painel
| Bug | Causa | Correção aplicada / regra |
|-----|--------|---------------------------|
| Botões "Editar/Pausar" cortados | `overflow: hidden` no card | Usar `card--table`, `table-scroll`, `td-actions` sticky |
| Avatar vazio no círculo | Só `background-image` | `<img>` + fallback iniciais (`.bot-av-wrap`) |
| Inputs claros/brancos feios | CSS antigo | Inputs escuros, focus rosa neon |
| `SESSION_SECRET` vazio no Railway | Usuário não preencheu | Opcional: app usa `PANEL_PASSWORD + "-session-secret-v1"` |
| Página em branco local | Postgres crash + porta ocupada | `DATABASE_URL=` vazio no `.env` OU docker + fix migração |

### Bot
| Bug | Causa | Correção / regra |
|-----|--------|------------------|
| Áudio em "Oii amor" | Label/trigger com palavra "amor" | Gatilhos **só** no campo triggers; não incluir label no match; `isLocationQuestion` / `isDistrustMessage` |
| Áudio na "tabela" | IA citava label ou match fraco | Não disparar áudio em `wantsPriceTable`; só `[[audio:slug]]` ou gatilho explícito |
| IA ignora prompt longo | System prompt incompleto | `config.prompt` inteiro no system + `PROMPT_ACTION_HINT` + `audioLibraryPrompt` |
| Prompt diz SP/RJ mas áudio diz SC | Dados inconsistentes | **Usuário** deve alinhar prompt e biblioteca de áudios |
| `database: false` com URL certa | SSL em `railway.internal` | `postgresSsl()` em `src/db/index.ts` |

### Deploy Railway
| Sintoma | Explicação |
|---------|------------|
| Deploy FAILED healthcheck | App crashava antes (user_id / SSL); deploy antigo ficou Active |
| `/health` v0.4.0 + `database: false` | Deploy velho ou sem redeploy após variáveis |
| Aviso amarelo "1" | Tentativa de deploy falhou; serviço antigo ainda online |

**Regra para o agente:** antes de mudar CSS global, ler `src/panel/styles.ts` e `design-system.ts`. Antes de mudar fluxo de áudio, ler `src/lib/named-audio.ts` e `src/index.ts` handler de texto.

---

## 4. Variáveis Railway (produção atual)

Serviço: **bot_telegram** · Projeto: **reliable-reflection** (ou nome atual do usuário)

| Variável | Obrigatório | Notas |
|----------|-------------|-------|
| `DATABASE_URL` | Sim | Referência `${{Postgres.DATABASE_URL}}` — URL `postgres.railway.internal` |
| `PANEL_PASSWORD` | Sim | Senha do painel |
| `SESSION_SECRET` | Recomendado | Qualquer string 32+ chars; se vazio, fallback automático |
| `OPENAI_API_KEY` | Sim | `sk-...` |
| `ADMIN_EMAIL` | Recomendado | `admin@botmanager.local` |
| `DATA_DIR` | Com volume | `/data` + volume montado em `/data` |

**Login painel:** `ADMIN_EMAIL` + `PANEL_PASSWORD` (não commitar senhas neste arquivo).

**Validar deploy:** `GET /health` → `"version":"0.4.4"`, `"database":true`, `"mode":"postgres"`.

---

## 5. Arquitetura Telegram (mapa de arquivos)

```
src/
├── index.ts              # Entry: Fastify + Telegraf, handlers mensagem
├── config.ts             # Env (Railway vs .env local)
├── bots.ts               # BotConfig, loadBots, upsertBot
├── version.ts            # APP_VERSION
├── db/
│   ├── index.ts          # Postgres pool, initDatabase, useDatabase()
│   ├── users.ts          # panel_users, auth
│   └── events.ts         # leads, messages, sales, receipts, products
├── lib/
│   ├── named-audio.ts    # [[audio:slug]], gatilhos, location/distrust
│   ├── prompt-actions.ts # [[send_informacoes]], etc.
│   ├── bot-intents.ts    # greeting, price table, preview, pix
│   ├── remarketing.ts    # mensagem por lead
│   ├── humanize.ts       # delays, split chunks
│   ├── telegram-send.ts  # send text/audio/media
│   ├── receipt-validator.ts
│   └── settings.ts       # OpenAI por usuário
└── panel/
    ├── routes.ts         # Todas rotas HTTP
    ├── pages.ts          # HTML páginas
    ├── audios-page.ts    # Biblioteca áudios
    ├── bot-form.ts       # Form instância
    ├── ui.ts             # Login, dashboard
    ├── layout.ts         # Shell + nav
    ├── styles.ts         # CSS global
    └── brand.ts          # Logo Telegram
```

**Não usar / não confundir:** pastas `apps/`, `services/`, `packages/` no `.gitignore` — protótipo antigo, não é o app atual.

---

## 6. Referência WhatsApp — hotbot (`hotbot (2)`)

### Estrutura
```
hotbot (2)/hotbot/
├── hotbot/
│   ├── bot-instance.js      # ⭐ MOTOR DE CONVERSA (prioridade para portar)
│   ├── index.js             # Multi-instância + CLI
│   ├── session-manager.js
│   ├── bot-factory.js
│   ├── SYSTEM_PROMPT.md       # Prompt vendas completo
│   ├── amanda_pacotes.json    # Exemplo pacotes/PIX
│   └── *.mp3                  # Áudios fixos por nome
└── hotbot-admin/
    ├── admin-server.js      # API painel PM2
    └── admin.html
```

### Fluxo hotbot que DEVEMOS replicar no Telegram

| # | Comportamento hotbot | Status Telegram | Onde implementar |
|---|----------------------|-----------------|------------------|
| 1 | Fila global entre leads (45s–2min) | ❌ Parcial (só delay por mensagem) | Novo `lead-queue.ts` ou em `humanize` |
| 2 | Buffer por lead antes de responder (debounce) | ❌ | `index.ts` handler texto |
| 3 | Tools: `send_informacoes` (tabela 1x) | ✅ Tag `[[send_informacoes]]` | `prompt-actions.ts` |
| 4 | Tools: `send_amostra_gratis` (1x) | ✅ + `previewUsed` | `index.ts` `sendPreview` |
| 5 | Tools: `naosou_fake` (áudio confiança) | ✅ `[[audio:nao_sou_fake]]` | `named-audio.ts` |
| 6 | Tools: `ignorar_lead` (silenciar) | ✅ `ignoredChats` | `index.ts` |
| 7 | Tools: `chamada_video` | ❌ | Adicionar tag + texto padrão |
| 8 | Comprovante → validar nome + valor pacote | ⚠️ Valida Pix/valor genérico | Portar `detectarPacote()` de hotbot |
| 9 | Pós-pagamento: entregar links + parar bot | ✅ Entrega + pode ignorar | Reforçar `ignoredChats` após paid |
| 10 | Áudios fixos por evento (mp3) | ✅ Biblioteca slug + upload | `/audios` |
| 11 | Transcrever áudio do lead (Whisper) | ❌ | `index.ts` handler voice |
| 12 | `pacotes.json` (preços, nome destinatário) | ⚠️ Só productName/price na instância | Estender `BotConfig` ou JSON |
| 13 | Remarketing em massa | ✅ Por lead personalizado | Já melhor que hotbot |
| 14 | Notificação Telegram ops pós-venda | ❌ | Opcional env `TELEGRAM_CHAT_ID` |
| 15 | Prompt em MD por instância | ✅ `prompt` no formulário | OK |

### Arquivos hotbot para ler antes de portar fluxo
1. `hotbot (2)/hotbot/hotbot/bot-instance.js` — funções `runCompletion`, `processarComprovante`, `confirmarComprovante`, fila
2. `hotbot (2)/hotbot/hotbot/SYSTEM_PROMPT.md` — regras de venda (modelo para prompt usuário)
3. `hotbot (2)/hotbot/hotbot/amanda_pacotes.json` — estrutura pacotes
4. `hotbot (2)/hotbot/hotbot/IMPLEMENTATION_SUMMARY.md` — changelog técnico

---

## 7. Roadmap — próximas tarefas (ordem sugerida)

### Fase A — Estabilidade (não quebrar painel)
- [ ] Testar todas rotas após deploy: login, criar instância, upload áudio, remarketing, settings
- [ ] Garantir `SESSION_SECRET` documentado no painel Railway
- [ ] Testes manuais checklist em `PROJETO-CONTEXTO.md` §8

### Fase B — Paridade fluxo hotbot (Telegram)
- [ ] **Pacotes múltiplos** no `BotConfig` (Básico / Chamada / Completo + mínimos negociação)
- [ ] **detectarPacote()** no comprovante (regex + últimas mensagens)
- [ ] **Handler de voz** do lead → Whisper → texto → fluxo normal
- [ ] Tag `[[chamada_video]]` + resposta padrão WhatsApp
- [ ] **Fila entre leads** (opcional, cuidado com latência)
- [ ] Silenciar lead permanentemente após comprovante aprovado (como `paidUsers`)

### Fase C — Painel estilo hotbot-admin
- [ ] Aba pacotes/PIX por instância (como `pacotes.json`)
- [ ] Upload/lista mídia centralizada (já tem `/audios` e `/media`)
- [ ] Editor prompt em textarea grande com preview

---

## 8. Checklist de teste manual (cada release)

### Painel
- [ ] `/login` carrega tema neon + logo
- [ ] Login com credenciais Railway
- [ ] Criar instância + upload avatar + áudio nomeado
- [ ] `/audios` — slug `nao_sou_fake` + gatilhos
- [ ] Remarketing — 2 leads, mensagens diferentes
- [ ] `/health` → version correta, `database: true` em produção

### Bot Telegram
- [ ] "Oii amor" → texto, **sem** áudio
- [ ] "de onde você é" → áudio correto (se cadastrado)
- [ ] "é golpe?" / desconfiança → `[[audio:nao_sou_fake]]` ou áudio
- [ ] "quero a tabela" → preços em texto
- [ ] Pedido de prévia → mídia 1x; segunda vez recusa
- [ ] Comprovante válido → entrega + bot para de insistir

---

## 9. Regras para o agente (Cursor)

1. **Ler este arquivo** no início de sessões longas ou antes de refactor grande.
2. **Não** reintroduzir match de áudio por palavras soltas ("amor", "oi").
3. **Não** mudar `useDatabase()` / ordem em `initDatabase()` sem testar Railway Postgres.
4. **Não** usar SSL em URLs `*.railway.internal`.
5. **Não** commitar `.env`, tokens, senhas.
6. **Minimizar diff** no CSS — uma mudança por problema.
7. Ao portar do hotbot: **adaptar** para Telegraf (não copiar whatsapp-web.js).
8. Atualizar **versão** em `src/version.ts` + `package.json` a cada release Railway.
9. Após fix crítico: push `telegramia` + `origin` main e pedir **Redeploy** Railway.

---

## 10. Comandos úteis

```bash
# Local (sem Postgres)
npm install && npm run dev
# http://localhost:3000/login

# Typecheck antes de commit
npm run typecheck

# Build produção
npm run build && npm start

# Push deploy
git push telegramia main
git push origin main
```

---

## 11. Histórico de decisões

| Data | Decisão |
|------|---------|
| 2026-05 | Um repo monolito `src/` (não monorepo apps/services) |
| 2026-05 | Postgres Railway + volume `/data` para uploads |
| 2026-05 | Áudios por `slug` + `[[audio:slug]]` em vez de só match no texto do áudio |
| 2026-05 | Remarketing 1:1 por lead (diferente do hotbot que não tinha) |
| 2026-05 | Referência fluxo: hotbot `bot-instance.js` é source of truth para vendas |

---

## 12. Links

- Painel produção: https://bottelegram-production-8449.up.railway.app
- Repo: https://github.com/wqiprime-gif/telegramIA
- Setup Railway: [RAILWAY-SETUP.md](./RAILWAY-SETUP.md)
- Local: [LOCAL.md](./LOCAL.md)

---

*Mantenha este arquivo sincronizado com o código. Se corrigir um bug recorrente, adicione na seção §3.*
