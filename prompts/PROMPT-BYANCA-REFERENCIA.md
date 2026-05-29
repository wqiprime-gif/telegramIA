# Prompt oficial — Byanca Costa

> Fonte no código: `src/lib/prompt-byanca.ts` (`BYANCA_PROMPT_TELEGRAM`)  
> Botão no painel: **Usar prompt Byanca (oficial)** na edição da instância.

**Plataforma:** o texto original fala WhatsApp; no Telegram usamos as mesmas regras com tags `[[...]]` em vez de function calling.

---

## Mapeamento função → tag (Telegram)

| Prompt (WhatsApp) | Telegram |
|-------------------|----------|
| `send_informacoes` | `[[send_informacoes]]` |
| `send_amostra_gratis` | `[[send_amostra_gratis]]` |
| `naosou_fake` | `[[naosou_fake]]` / `[[audio:nao_sou_fake]]` |
| `ignorar_lead` | `[[ignorar_lead]]` |
| Chamada de vídeo | `[[chamada_video]]` (texto adaptado: “aqui no Telegram”) |
| Comprovante | Automático (imagem/PDF) |
| Após pagamento | Silêncio permanente no código |

---

## Rastreio de origem (TikTok, Instagram…)

Links na bio de cada rede (troque `SEU_BOT`):

| Rede | Link |
|------|------|
| TikTok | `https://t.me/SEU_BOT?start=tiktok` |
| Instagram | `https://t.me/SEU_BOT?start=instagram` |
| Twitter/X | `https://t.me/SEU_BOT?start=twitter` |
| YouTube | `https://t.me/SEU_BOT?start=youtube` |
| Facebook | `https://t.me/SEU_BOT?start=facebook` |

Também detecta na 1ª mensagem: “vim do tiktok”, “cheguei pelo insta”, etc.

Painel: **Dashboard → Origem dos leads** e coluna **Origem** em **Leads**.

---

## Skills de UI do projeto

Ver `docs/DESIGN-SKILLS.md` — [frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) e [webgpu-threejs](https://github.com/dgreenheck/webgpu-claude-skill).
