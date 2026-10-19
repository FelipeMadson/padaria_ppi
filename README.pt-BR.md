# padaria-ppi — Sistema de Gestão de Padaria e Ponto de Venda

> Sistema determinístico de gestão de padaria e terminal de Ponto de Venda (PDV), desenvolvido como parte de Projeto Prático Integrado (PPI) em Tecnologia em Sistemas para Internet (TSI).

[![Verificação CI](https://github.com/FelipeMadson/padaria_ppi/actions/workflows/ci.yml/badge.svg)](https://github.com/FelipeMadson/padaria_ppi/actions/workflows/ci.yml)
[![Node.js 22](https://img.shields.io/badge/node-22.x-blue.svg)](https://nodejs.org/)
[![Licença: MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-yellow.svg)](LICENSE)

*Read this in [English](README.md).*

---

## Visão Geral

O `padaria-ppi` modela todo o fluxo operacional de uma padaria artesanal e comercial, desde a entrada de matérias-primas e insumos até o controle de receitas, execução de fornadas e emissão de cupons de venda no caixa.

O projeto foi concebido com TypeScript moderno e execução direta no Node.js 22+, garantindo confiabilidade, tipagem estrita e ausência de dependências runtime externas pesadas.

---

## Módulos do Sistema

### 1. Gestão de Insumos e Custos (`GerenciadorEstoque`)
- Cadastro de ingredientes com unidade de medida (`kg`, `g`, `l`, `ml`, `unidade`).
- Controle de estoque mínimo com alerta automatizado de necessidade de compra.
- Registro de reposições e atualização de custo médio ponderado por centavos inteiros.
- Cálculo de custo exato por lote de receita com base no preço atual dos insumos.

### 2. Controle de Produção e Fornadas (`ProducaoPadaria`)
- Cadastro de receitas com tempo de forno, temperatura e lista de ingredientes.
- Planejamento de fornadas com multiplicador de escala (ex: fornada dupla ou tripla).
- Abate atômico de insumos do estoque no momento em que a fornada é iniciada.
- Conclusão da fornada com transferência automática dos pães assados para o estoque de produtos prontos para venda.

### 3. Ponto de Venda (PDV) (`PontoDeVenda`)
- Registro de vendas com validação em tempo real da disponibilidade de produtos prontos.
- Suporte a múltiplas formas de pagamento: Dinheiro, PIX, Cartão de Débito e Crédito.
- Cálculo determinístico de troco para pagamentos em espécie.
- Geração de cupom de venda em formato de texto estruturado.

---

## Instalação e Execução

### Requisitos

- Node.js 22.0.0 ou superior
- npm 10+

### Instalação

```bash
git clone https://github.com/FelipeMadson/padaria_ppi.git
cd padaria_ppi
npm install
```

### Executar Testes Automatizados

```bash
npm test
```

### Checagem Estática de Tipos

```bash
npm run typecheck
```

---

## Verificação e Integração Contínua (CI)

O repositório conta com pipeline de CI no GitHub Actions com SHA fixado:
- `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`
- `actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af`

---

## Licença

Este projeto é distribuído sob os termos da licença [MIT](LICENSE).
