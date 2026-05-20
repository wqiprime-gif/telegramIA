# Deploy no Railway — quando o GitHub não dispara sozinho

## Situação

O código no GitHub pode estar **mais novo** que o que está no ar.

Confira: abra `https://telegramia-production.up.railway.app/health`

- Se `"version": "0.2.0"` → produção **atrasada**
- Se `"version": "0.3.0"` (ou maior) → deploy **ok**

## Opção A — Redeploy manual (mais rápido)

1. Acesse [Railway](https://railway.app) → projeto → serviço **telegramIA**
2. Aba **Deployments**
3. Clique nos **⋮** do deploy mais recente do GitHub (ou **Deploy** → **Deploy latest commit**)
4. Aguarde **Deployment successful**
5. Teste de novo `/health`

Se não aparecer commit novo:

1. **Settings** → **Source**
2. Repositório: `wqiprime-gif/telegramIA` · Branch: **main** · Root: **/**
3. **Disconnect** → **Connect GitHub** de novo e autorize
4. Volte em **Deployments** e faça redeploy

## Opção B — GitHub Actions (recomendado se o webhook falhar)

1. Railway → **Account Settings** → **Tokens** → crie um token
2. Railway → serviço **telegramIA** → **Settings** → **General** → copie **Service ID**
3. GitHub → repo `telegramIA` → **Settings** → **Secrets and variables** → **Actions**
4. Crie:
   - `RAILWAY_TOKEN` = token do passo 1
   - `RAILWAY_SERVICE_ID` = ID do passo 2
5. Faça um push na `main` (ou **Actions** → **Deploy Railway** → **Run workflow**)

O workflow está em `.github/workflows/deploy-railway.yml`.

## Opção C — CLI local

```bash
npm install -g @railway/cli
railway login
cd projetoIA
railway link
railway up
```

## Interrupção do Railway

Se aparecer banner **Service Disruption**, aguarde normalizar ou use a Opção B/C.
