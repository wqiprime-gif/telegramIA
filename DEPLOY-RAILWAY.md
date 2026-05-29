# Deploy no Railway

## Conta nova / primeiro deploy

Siga o guia completo: **[RAILWAY-SETUP.md](./RAILWAY-SETUP.md)** (Postgres, volume, variáveis, domínio).

## Situação — redeploy

O código no GitHub pode estar **mais novo** que o que está no ar.

Confira: abra `https://SEU-DOMINIO.up.railway.app/health`

- Se `"version": "0.4.0"` → deploy **ok**
- Versão menor → faça redeploy (opções abaixo)

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

## Opção B — GitHub Actions (deploy automático no push)

Se o workflow falhou com **`Falta secret RAILWAY_TOKEN`**, os secrets ainda não foram criados no GitHub.

### Passo a passo (5 min)

1. **Token Railway**  
   - Abra https://railway.com/account/tokens  
   - **Create Token** → copie (só aparece uma vez)

2. **Service ID**  
   - Railway → projeto → serviço **bottelegram** (ou telegramIA)  
   - **Settings** → **General** → copie **Service ID** (UUID)

3. **Secrets no GitHub**  
   - https://github.com/wqiprime-gif/telegramIA/settings/secrets/actions  
   - **New repository secret**:
     - Nome: `RAILWAY_TOKEN` → valor = token do passo 1
     - Nome: `RAILWAY_SERVICE_ID` → valor = UUID do passo 2  
   - Os nomes devem ser **exatamente** esses (maiúsculas).

4. **Rodar de novo**  
   - **Actions** → **Deploy Railway** → **Run workflow**  
   - Ou qualquer push na `main`

### Sem secrets?

O job **build** passa; o deploy é pulado com aviso. Use **Opção A** (redeploy manual no Railway) — se o repo já está conectado no Railway, o push na `main` pode deployar direto pelo Railway sem Actions.

Workflow: `.github/workflows/deploy-railway.yml`

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
