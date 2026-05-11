# Feature: Consumo de API Pública para Exemplos e Interações

## Objetivo
Integrar uma ou mais APIs públicas para demonstrar habilidades em integrações backend/frontend e manter o portfólio dinâmico com dados em tempo real.

## Descrição
Consumir dados de APIs públicas relevantes para um backend engineer e exibir de forma interativa:

### Opções de APIs
1. **GitHub API**: Estatísticas de repositórios (estrelas, forks, linguagens)
2. **OpenWeather API**: Exibir localização do usuário com clima
3. **Unsplash API**: Imagens dinâmicas relacionadas a tecnologia
4. **REST Countries API**: Dados sobre países (relacionado aos assets/img/countries/)
5. **Random User API**: Gerar avatares fictícios para exemplos
6. **CoinGecko API**: Dados de criptomoedas (sem chave necessária)
7. **JSONPlaceholder**: API fake para demonstrar integração e tratamento de erros

## Implementação
- **Localização**: Seção "About" ou nova seção "API Examples"
- **Tratamento**: Incluir validação de erros, retry logic e fallback
- **Cache**: Implementar cache local para reduzir requisições
- **Segurança**: Não expor chaves de API no frontend
- **Feedback**: Loaders visuais durante carregamento

## Benefícios
- Demonstra conhecimento em integração de APIs REST
- Site fica dinâmico e atualizado
- Mostra boas práticas: tratamento de erros, async/await
- Pode servir como portfólio de exemplo prático

## Critérios de Sucesso
- Requisição funciona sem expor credenciais
- Graceful degradation se API falhar
- Dados são exibidos de forma limpa e profissional
- Performance não é impactada

## Prioridade
Alta - Demonstra competência técnica diretamente
