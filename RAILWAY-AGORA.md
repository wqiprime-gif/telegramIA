# Atualizar o Railway (quando reconectar ao repo certo)

**Repositório oficial do código:** https://github.com/wqiprime-gif/telegramIA

O Railway **ainda** pode estar ligado à conta/repo antigo (`kauan123749578/bot_telegram`). Por isso o site fica em **0.4.2** mesmo com código novo no GitHub.

---

## Quando for arrumar o Railway (uma vez)

1. Railway → serviço **bot_telegram** → **Settings** → **Disconnect** (Source)
2. **Connect Repo** → GitHub da conta **wqiprime-gif**
3. Escolha: **`wqiprime-gif/telegramIA`** · branch **main**
4. **Deployments** → **Deploy latest commit**
5. Teste: https://bottelegram-production-8449.up.railway.app/health → `"version": "0.5.1"`

Sem token. Só reconectar o repo certo.

---

## Enquanto isso — desenvolvimento

Todo push vai só para o repo oficial:

```bash
git push origin main
```

Repo: https://github.com/wqiprime-gif/telegramIA
