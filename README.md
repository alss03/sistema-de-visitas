Dashboard de Visitas — Documentação do Projeto

Este projeto é um painel para gerenciamento de visitas, desenvolvido com React, Vite e TypeScript. Ele permite visualizar usuários, seus status de visita, métricas gerais e gráficos, além de registrar novas visitas com atualização em tempo real.
O objetivo é fornecer uma interface clara, rápida e funcional para organizações que acompanham rotinas de verificação, inspeção ou atendimento periódico.

1. Tecnologias Utilizadas

React + TypeScript

Vite como bundler

SCSS Modules para estilização

Recharts para visualização de dados

Vitest + Testing Library para testes unitários

Arquitetura baseada em hooks, buscando separar lógica e apresentação

2. Estrutura Geral do Projeto
src/
  api/
    visitas.service.ts         -> comunicação com backend (GET e registrar visita)
  components/
    UserCard/                  -> cartão individual com status e ações
    StatsBar/                  -> barra com métricas e filtros principais
    StatusPieChart/            -> gráfico de pizza dos status
    FrequencyBarChart/         -> gráfico de barras por frequência
    Spinner/
    ErrorMessage/
  hooks/
    useVisitasDashboard.ts     -> lógica central do dashboard
  utils/
    date.ts                    -> funções de data e cálculos de status
    visitasMetrics.ts          -> resumo e agrupamento dos dados
    sort.ts                    -> ordenação de visitas
  pages/
    Dashboard.tsx              -> página principal do sistema
tests/
  date.test.ts
  visitasMetrics.test.ts
  sort.test.ts
  UserCard.test.tsx


A estrutura prioriza organização, escalabilidade e facilidade de manutenção. Cada responsabilidade está isolada no lugar correto.

3. Funcionalidades Implementadas
3.1. Listagem de Usuários

Cada usuário contém:

nome

CPF

última visita registrada

próxima visita calculada

status como ativo ou inativo

badge informativo indicando o nível de urgência (em dia, vence hoje, atraso leve ou atraso grave)

A lógica do badge depende diretamente das funções em date.ts e dos cálculos de dias de atraso e dias para vencer.

3.2. Registro de Visita

O botão “Registrar Visita”:

chama a função registrarVisita na API,

recebe uma nova data de verificação,

dispara um evento global visita-registrada,

o hook useVisitasDashboard escuta esse evento e atualiza o estado global,

exibe um alerta temporário informando o sucesso.

Esse fluxo mantém a aplicação coerente sem necessidade de refetch completo.

3.3. Busca por Nome ou CPF

A busca é aplicada em tempo real, filtrando por:

nome (case insensitive)

CPF (com ou sem máscara)

O filtro é acumulativo com o filtro principal e com a ordenação.

3.4. Filtros Principais

O usuário pode alternar entre:

todas

pendentes

em dia

ativas

inativas

Cada filtro é processado no hook useVisitasDashboard, garantindo consistência entre visualização e métricas.

3.5. Modos de Ordenação

Três modos de ordenação foram implementados:

urgência — lógica operacional: pendentes vêm primeiro, depois em dia, depois inativos

alfabética — comparação por locale pt-BR

recentes — usuários com última visita mais recente aparecem primeiro

O dropdown de seleção aparece ao lado da busca.

3.6. Métricas Operacionais

O resumo exibido no topo inclui:

total de usuários

ativos

inativos

pendentes

em dia

percentual de usuários em dia

Além disso, para o gráfico de status, calcula-se:

em dia seguro

vence hoje

atraso leve

atraso grave

Essas métricas são consolidadas em visitasMetrics.ts.

3.7. Gráficos
StatusPieChart

Representa visualmente:

atraso grave

atraso leve

vence hoje

em dia

inativos

A legenda é fixa e aparece sempre na mesma ordem, mesmo quando valores são zero. As cores são definidas manualmente e vinculadas às chaves.

FrequencyBarChart

Agrupa as visitas com base no intervalo de dias configurado:

1–3 dias

4–7 dias

8–14 dias

15–30 dias

31+ dias

Cada grupo corresponde ao atributo verify_frequency_in_days.

4. Arquitetura e Decisões de Projeto
4.1. Separação Lógica e Visual

A lógica central do dashboard fica concentrada em useVisitasDashboard, enquanto os componentes cuidam exclusivamente de exibir dados.
Isso simplifica testes, manutenção e evolução futura.

4.2. Funções Puras

As regras de cálculo (próxima visita, dias em atraso, vencendo hoje etc.) são funções puras e testadas isoladamente.
Boa parte da confiabilidade do sistema depende dessas funções.

4.3. Eventos Customizados

O fluxo "registrar visita" utiliza eventos customizados para manter o app responsivo sem necessidade de recarregar toda a lista de usuários.

4.4. SCSS Modules

A aplicação usa SCSS Modules para manter estilos isolados, legíveis e fáceis de alterar sem risco de vazamento entre componentes.

5. Testes Implementados

Os testes focam nas partes mais críticas do projeto: regras de negócio, métricas e componentes essenciais.

5.1. Tests em date.ts

parse de datas

cálculo de próxima visita

detecção de pendência

vencendo hoje

dias em atraso

dias para vencer

formatação de datas

5.2. Tests em visitasMetrics.ts

contagem de ativos, inativos e pendentes

dias em atraso (leve e grave)

usuários em dia

vencendo hoje

em dia seguro

percentual em dia

agrupamento por frequência de dias

5.3. Tests em sort.ts

ordenação por urgência

ativos antes de inativos

pendentes antes de não pendentes

comparação por próxima data de visita

5.4. Tests em UserCard

renderização das informações básicas

exibição correta dos badges

estado do botão “Registrar Visita”

bloqueio contra múltiplos cliques

disparo do evento global após chamada da função

Esses testes garantem a corretude das regras centrais do sistema e validam a UI onde realmente importa.
