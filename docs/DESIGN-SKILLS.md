# Skills de design — referência para o painel BotManager

> Usar este arquivo antes de mudanças grandes de UI (login, dashboard, instâncias).  
> Skills externas que o agente deve seguir.

---

## 1. Frontend Design (Anthropic)

**URL:** [anthropics/skills — frontend-design/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)

**Quando usar:** login, dashboard, formulários, qualquer HTML/CSS do painel, componentes visuais.

**Direção deste projeto:** **Neon Pulse premium** — fundo preto profundo, acento rosa `#ff2d55`, ciano `#00d4ff`, glassmorphism, tipografia distinta (não Inter/Roboto genéricos).

**Regras que importam:**

| Tópico | Aplicar no BotManager |
|--------|------------------------|
| Tipografia | Display: **Syne**. Corpo: **DM Sans**. Mono: JetBrains Mono. |
| Cor | Variáveis CSS em `design-system.ts`; dominante escuro + acentos neon. |
| Motion | Entrada escalonada (stagger), hover com glow, transições `cubic-bezier(0.22, 1, 0.36, 1)`. |
| Layout | Assimetria no login (hero + card flutuante 3D), grid quebrado no dashboard. |
| Backgrounds | Grid neon, noise, gradientes radiais — nunca fundo cinza chapado. |
| Evitar | Purple-gradient-on-white, Inter-only, layout “template SaaS” genérico. |

---

## 2. WebGPU + Three.js TSL (dgreenheck)

**URL:** [dgreenheck/webgpu-claude-skill](https://github.com/dgreenheck/webgpu-claude-skill)

**Quando usar:** cena 3D no login (`src/panel/panel-scene.ts`), futuros hero animados, partículas GPU.

**Stack no painel:**

- Three.js via CDN (`three@0.170` + `three/webgpu` quando disponível).
- Fallback: `WebGLRenderer` se `WebGPURenderer` falhar.
- Cena leve: icosaedro/torus com luz rosa + ciano, parallax no mouse — **não bloquear** o formulário de login.

**Arquivos locais:**

| Arquivo | Função |
|---------|--------|
| `src/panel/panel-scene.ts` | Gera `<script>` da cena 3D para login/register |
| `src/panel/design-system.ts` | Tokens de cor, fonte, glass |
| `src/panel/styles.ts` | CSS global + login 3D |

**Tópicos da skill para consultar depois:**

- `SKILL.md` — visão geral WebGPU + TSL
- `docs/core-concepts.md` — uniforms, `Fn()`, tempo
- `docs/materials.md` — materiais node
- `docs/device-loss.md` — recovery se GPU cair

---

## 3. Checklist antes de merge de UI

- [ ] Login/register com canvas 3D atrás (pointer-events: none)
- [ ] Fontes carregadas (Syne + DM Sans)
- [ ] Contraste legível nos inputs
- [ ] Mobile: hero some, form centralizado (já em `@media`)
- [ ] Performance: animação pausa com `prefers-reduced-motion`
- [ ] Não quebrar rotas POST do painel

---

## 4. Outras skills do workspace (Cursor)

| Skill | Path | Uso |
|-------|------|-----|
| Canvas | `.cursor/skills-cursor/canvas/SKILL.md` | Relatórios visuais pesados (não painel SSR) |
| Create rule | `create-rule/SKILL.md` | Regras `.cursor/rules` para UI |

---

*Última atualização: alinhado ao pedido de painel premium + efeitos 3D + tracking de leads.*
