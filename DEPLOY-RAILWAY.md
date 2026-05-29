# Deploy no Railway

## Repositório oficial

**https://github.com/wqiprime-gif/telegramIA** (`git push origin main`)

Não use mais `kauan123749578/bot_telegram` como principal (remote `legacy` só se precisar espelhar).

---

## Conta nova / primeiro deploy

Siga **[RAILWAY-SETUP.md](./RAILWAY-SETUP.md)**.

## Railway ainda em versão antiga?

1. Confira o código no GitHub: [telegramIA commits](https://github.com/wqiprime-gif/telegramIA/commits/main)
2. No Railway → **Settings** → **Source** deve ser **`wqiprime-gif/telegramIA`**
3. Se estiver outro repo → **Disconnect** → conecte **telegramIA** → **Deploy latest commit**
4. `/health` deve mostrar `"version": "0.5.1"` ou superior

Guia rápido: **[RAILWAY-AGORA.md](./RAILWAY-AGORA.md)**

## Variáveis (Railway → Variables)

| Variável | Obrigatório |
|----------|-------------|
| `PANEL_PASSWORD` | Sim |
| `DATABASE_URL` | Sim (Postgres no Railway) |
| `OPENAI_API_KEY` | Sim (ou no painel) |
| `DATA_DIR` | `/data` + volume |

## CI no GitHub

Só valida build (`.github/workflows/ci.yml`). Deploy = Railway conectado ao repo, **sem token**.
