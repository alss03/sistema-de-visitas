
# Dashboard de Visitas

Este projeto é um painel para gerenciamento e acompanhamento de visitas periódicas. Ele permite visualizar pessoas que precisam ser visitadas, identificar atrasos, organizar prioridades e registrar visitas em tempo real.  
Foi desenvolvido utilizando React, Vite e TypeScript, com foco em clareza, desempenho e arquitetura bem estruturada.

----------

## 1. Tecnologias Utilizadas

-   **React + TypeScript**
    
-   **Vite** para desenvolvimento e build
    
-   **SCSS Modules** para estilização
    
-   **Recharts** para visualização de dados
    
-   **Vitest + Testing Library** para testes unitários
    
-   **Arquitetura baseada em hooks** para divisão clara entre lógica e apresentação
    

----------

## 2. Estrutura Geral do Projeto

```src/
  api/
    visitas.service.ts
  components/
    UserCard/
    StatsBar/
    StatusPieChart/
    FrequencyBarChart/
    ErrorMessage/
    Spinner/
  hooks/
    useVisitasDashboard.ts
  utils/ date.ts
    visitasMetrics.ts sort.ts
  pages/
    Dashboard.tsx
tests/ date.test.ts
  visitasMetrics.test.ts sort.test.ts
  UserCard.test.tsx
```

Cada parte é separada por responsabilidade, como solicitado no desafio.

----------

## 3. Funcionalidades Implementadas

### 3.1 Listagem de Usuários

Cada usuário exibe:

-   Nome
    
-   CPF
    
-   Última visita
    
-   Próxima visita
    
-   Status (ativo / inativo)
    
-   Badge indicando urgência:
    
    -   Em dia
        
    -   Vence hoje
        
    -   Atraso leve (≤ 3 dias)
        
    -   Atraso grave (> 3 dias)
        

As regras dessas badges são baseadas nas funções de `date.ts`.

----------

### 3.2 Registro de Visita

-   Botão "Registrar Visita" dispara uma chamada API.
    
-   Recebe nova data de verificação.
    
-   Dispara um evento global `visita-registrada`.
    
-   O hook `useVisitasDashboard` escuta esse evento e atualiza o estado automaticamente.
    
-   Um alerta temporário informa o sucesso da ação.
    

Esse modelo permite atualização instantânea da UI sem necessidade de recarregar toda a lista.

----------

### 3.3 Busca por Nome ou CPF

A busca é aplicada em tempo real e aceita:

-   Nome (sem distinção de acentos ou maiúsculas)
    
-   CPF com ou sem máscara
    

Funciona em conjunto com os filtros e com o modo de ordenação.

----------

### 3.4 Filtros Principais

O usuário pode filtrar por:

-   Todas
    
-   Pendentes
    
-   Em dia
    
-   Ativas
    
-   Inativas
    

Esses filtros são calculados no hook principal.

----------

### 3.5 Modos de Ordenação

Três modos foram implementados:

-   **Urgência**: pendentes vêm primeiro, depois em dia, depois inativos
    
-   **Alfabética**: ordenação alfabética
    
-   **Mais recentes**: última visita mais recente primeiro
    

O seletor de visualização fica ao lado da barra de busca.

----------

### 3.6 Métricas Operacionais

O resumo exibe:

-   Total de usuários
    
-   Ativos
    
-   Inativos
    
-   Pendentes
    
-   Em dia
    
-   Percentual em dia
    

E para o gráfico:

-   Em dia seguro
    
-   Vence hoje
    
-   Atraso leve
    
-   Atraso grave
    

Essas métricas são geradas por `visitasMetrics.ts`.

----------

### 3.7 Gráficos

#### StatusPieChart

-   Exibe visualmente os status de cada pessoa.
    
-   Legenda fixa com ordem imutável.
    
-   Fatias aparecem apenas se houver valor, mas a legenda permanece estática.
    
-   Cada status tem uma cor específica e constante.
    

#### FrequencyBarChart

-   Agrupa usuários de acordo com `verify_frequency_in_days`.
    
-   Faixas: 1–3, 4–7, 8–14, 15–30, 31+.
    
-   Útil para entender a distribuição de frequências de visita.
    

----------

## 4. Arquitetura e Decisões de Projeto

### 4.1 Separação entre Lógica e UI

A lógica principal fica no hook `useVisitasDashboard`, permitindo que os componentes foquem apenas na exibição.

### 4.2 Funções Puras e Testáveis

As regras de cálculo de pendência, atraso, vencimento e próximas datas são implementadas em funções puras, facilitando testes e manutenção.

### 4.3 Eventos Customizados

O evento `visita-registrada` permite atualizar o dashboard sem refazer todo o carregamento de dados.

### 4.4 Estilização Modular

Os estilos utilizam SCSS Modules, garantindo isolamento e evitando conflitos entre componentes.

----------

## 5. Testes Implementados

Os testes priorizaram as partes críticas e fundamentais da lógica operacional.

### 5.1 Testes em `date.ts`

Incluem:

-   Parse de datas
    
-   Cálculo da próxima visita
    
-   Verificação de pendência
    
-   Identificação de “vence hoje”
    
-   Cálculo de dias em atraso
    
-   Cálculo de dias para vencer
    
-   Formatação da data
    

### 5.2 Testes em `visitasMetrics.ts`

Verificam:

-   Agrupamento por frequência
    
-   Cálculo de pendentes
    
-   Dias de atraso leve e grave
    
-   Percentual em dia
    
-   Vencendo hoje
    
-   Em dia seguro
    

### 5.3 Testes em `sort.ts`

Valida:

-   Ordenação por urgência
    
-   Ativos antes de inativos
    
-   Pendentes antes de não pendentes
    
-   Ordenação pela próxima data de visita
    

### 5.4 Testes em `UserCard`

Incluem:

-   Renderização das informações principais
    
-   Exibição correta de badges
    
-   Comportamento do botão de registrar visita
    
-   Prevenção de múltiplos cliques
    
-   Emissão do evento de atualização

#### Não foi possível cobrir toda a aplicação com testes devido ao limite de tempo do desafio.
