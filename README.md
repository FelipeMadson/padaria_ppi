# padaria-ppi

> Deterministic bakery management system and Point of Sale (POS) engine designed for practical integrated academic projects (PPI - Projeto Prático Integrado).

[![CI Verification](https://github.com/FelipeMadson/padaria_ppi/actions/workflows/ci.yml/badge.svg)](https://github.com/FelipeMadson/padaria_ppi/actions/workflows/ci.yml)
[![Node.js 22](https://img.shields.io/badge/node-22.x-blue.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*Read this in [Português](README.pt-BR.md).*

---

## Overview

`padaria-ppi` is a focused software engineering implementation modeling the end-to-end operational lifecycle of a commercial bakery. Built with modern TypeScript and designed to run natively on Node.js 22+, it provides strict domain boundary modeling across three core sub-domains:

1. **Raw Material Inventory (`GerenciadorEstoque`)**: Tracking raw ingredients (flour, yeast, butter, sugar) with minimum stock alerts and exact recipe cost calculation in integer cents.
2. **Batch Production (`ProducaoPadaria`)**: Scheduling and executing baking batches (*fornadas*), consuming inventory proportionally and restocking shelf-ready baked goods.
3. **Point of Sale (`PontoDeVenda`)**: Fast checkout terminal computing sub-totals, payment methods, cash change calculation, and itemized text receipts.

---

## Architecture & Domain Model

```
       [ Fornecedores ]
              │
              ▼
   ┌───────────────────────┐
   │  GerenciadorEstoque   │ ◄── [ Consumo por Fornada ]
   │  (Insumos & Custos)   │
   └──────────┬────────────┘
              │ Insumos
              ▼
   ┌───────────────────────┐
   │   ProducaoPadaria     │ ───► [ Fornada Concluída ]
   │ (Receitas & Batches)  │               │
   └───────────────────────┘               ▼
                                 ┌───────────────────────┐
                                 │     PontoDeVenda      │ ───► [ Cupom Não Fiscal ]
                                 │ (Estoque Pronto & PDV)│
                                 └───────────────────────┘
```

### Key Principles

- **Integer Financial Precision**: All monetary values are modeled in integer cents (`precoVendaCentavos`, `custoPorUnidade`) to prevent floating-point rounding errors.
- **Transactional Consistency**: If ingredients are insufficient, a batch cannot start; if finished goods are depleted, a sale is rejected atomically.
- **Zero Heavy Dependencies**: Pure TypeScript utilizing native Node.js test runners (`node:test`, `node:assert/strict`) for instant, hermetic CI verification.

---

## Installation & Testing

### Prerequisites

- Node.js 22.0.0 or higher
- npm 10+

### Setup

```bash
git clone https://github.com/FelipeMadson/padaria_ppi.git
cd padaria_ppi
npm install
```

### Running Tests

```bash
npm test
```

### Type Checking

```bash
npm run typecheck
```

---

## Verification & CI

The repository is guarded by a GitHub Actions workflow using SHA-pinned official actions:
- `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`
- `actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af`

---

## License

This project is licensed under the [MIT License](LICENSE).
