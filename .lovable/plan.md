

## Plano: Reduzir o tamanho do código HTML do Widget WhatsApp

### Análise atual
O código gerado tem ~130 linhas com CSS extenso, SVG path longo do ícone WhatsApp repetido, e JavaScript verboso. Há várias oportunidades de compactação.

### Estratégias de redução

1. **Inline SVG → Emoji Unicode + CSS**
   - Substituir o `<svg><symbol>` do ícone WhatsApp (path com ~800 caracteres) por um emoji ou um SVG inline mínimo usando só o botão
   - Remover o bloco `<svg style="display:none"><symbol...>` e as 3 referências `<use href="#wa-icon"/>`

2. **CSS mais compacto**
   - Usar shorthand properties (ex: `margin`, `padding`, `border`)
   - Remover propriedades redundantes (ex: `display:flex;align-items:center;justify-content:center` repetido 5x → classe utilitária `.fc`)
   - Eliminar animação `wab-ping` (substituir por `animation` CSS simples com `box-shadow` pulsante, menos código)
   - Simplificar estados (`:hover`, `:active`, `:disabled`) com menos propriedades

3. **HTML mais enxuto**
   - Remover atributos opcionais (`autocomplete`, `maxlength`, `aria-label`)
   - Usar IDs curtos (ex: `wn` em vez de `wab-name`)
   - Remover o campo Mensagem (textarea) — é opcional e adiciona ~3 linhas

4. **JavaScript mais compacto**
   - Usar `$` como alias para `document.getElementById`
   - Combinar event listeners
   - Usar template literals e operadores ternários mais curtos
   - Remover comentários

5. **Resultado estimado**
   - De ~130 linhas → ~60-70 linhas
   - Redução de ~40-50% no tamanho total

### Arquivos alterados
- `src/components/capture/EmbedGenerator.tsx` — reescrever a função `generateWhatsAppWidgetHTML` com versão compacta

### Funcionalidade preservada
Todas as features continuam: botão flutuante, modal, validação, máscara telefone, envio ao CRM, redirecionamento WhatsApp, fechar com ESC/clique fora, prevenção de duplo envio.

