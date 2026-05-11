# Melhoria: Consistência de Design

## Objetivo
Uniformizar cores, tipografia, espaçamento e layout em todo o portfólio para criar uma experiência visual coesa e profissional.

## Diagnóstico Atual
- Múltiplos arquivos CSS (`styles.css`, `site.css`, `heading.css`, `body.css`)
- Potencial duplicação ou conflito de regras
- Falta de padronização em espaçamentos e tamanhos
- Classes Bootstrap misturadas com CSS customizado

## Ações a Realizar

### 1. Revisar e Consolidar CSS
- [ ] Auditar `css/styles.css` - verificar conflitos
- [ ] Auditar `css/site.css` - identificar duplicatas
- [ ] Auditar `css/heading.css` - padronizar titulos
- [ ] Auditar `css/body.css` - padronizar texto

### 2. Padronizar Cores
- [ ] Definir paleta de cores consistente (primária, secundária, acentos)
- [ ] Aplicar em todas as seções (navbar, headers, botões, footers)
- [ ] Usar variáveis CSS para facilitar manutenção

### 3. Tipografia Uniforme
- [ ] Definir tamanhos de fonte padrão (h1, h2, h3, p, small)
- [ ] Usar font weights consistentes (regular, bold, semi-bold)
- [ ] Aplicar line-height uniforme para legibilidade

### 4. Espaçamento e Layout
- [ ] Padronizar margens entre seções
- [ ] Usar sistema de spacing consistente (8px, 16px, 24px, etc.)
- [ ] Alinhar padding de elementos
- [ ] Revisar grid/flexbox do Bootstrap

### 5. Elementos Visuais
- [ ] Padronizar estilo de botões
- [ ] Uniformizar ícones (tamanho, cor, espaçamento)
- [ ] Revisar bordas, sombras e efeitos hover
- [ ] Manter consistência em cards e containers

## Implementação
- Consolidar CSS em 1-2 arquivos principais
- Usar CSS variables para valores reutilizáveis
- Manter Flexbox/Grid para responsividade
- Testar em múltiplos devices

## Benefícios
- Melhora a percepção de profissionalismo
- Reduz confusão visual
- Facilita manutenção futura
- Aumenta coerência em mobile e desktop

## Critérios de Sucesso
- Visual uniforme em todas as seções
- Sem conflitos CSS
- Funciona bem em mobile, tablet e desktop
- Carregamento de CSS otimizado

## Prioridade
Alta - Impacta diretamente na primeira impressão
