import type { Receita, Fornada, ProdutoVenda } from './types.ts';
import { GerenciadorEstoque } from './inventory.ts';

export class ProducaoPadaria {
  private estoque: GerenciadorEstoque;
  private receitas = new Map<string, Receita>();
  private produtos = new Map<string, ProdutoVenda>();
  private fornadas = new Map<string, Fornada>();

  constructor(estoque: GerenciadorEstoque) {
    this.estoque = estoque;
  }

  cadastrarReceita(receita: Receita): void {
    if (this.receitas.has(receita.id)) {
      throw new Error(`Receita ${receita.id} já existe.`);
    }
    if (receita.ingredientes.length === 0) {
      throw new Error('A receita precisa conter pelo menos um ingrediente.');
    }
    if (receita.rendimentoUnidades <= 0) {
      throw new Error('O rendimento da receita deve ser maior que zero.');
    }
    this.receitas.set(receita.id, { ...receita });
  }

  obterReceita(id: string): Receita | undefined {
    const r = this.receitas.get(id);
    return r ? { ...r } : undefined;
  }

  cadastrarProdutoVenda(produto: ProdutoVenda): void {
    if (this.produtos.has(produto.id)) {
      throw new Error(`Produto ${produto.id} já cadastrado.`);
    }
    if (produto.precoVendaCentavos <= 0) {
      throw new Error('O preço de venda deve ser positivo.');
    }
    this.produtos.set(produto.id, { ...produto });
  }

  obterProduto(id: string): ProdutoVenda | undefined {
    const p = this.produtos.get(id);
    return p ? { ...p } : undefined;
  }

  abaterEstoqueProduto(id: string, quantidade: number): void {
    const p = this.produtos.get(id);
    if (!p) throw new Error(`Produto ${id} não encontrado.`);
    if (p.estoquePronto < quantidade) throw new Error(`Estoque insuficiente de ${p.nome}.`);
    p.estoquePronto -= quantidade;
  }

  listarProdutos(): ProdutoVenda[] {
    return Array.from(this.produtos.values()).map(p => ({ ...p }));
  }

  iniciarFornada(id: string, receitaId: string, multiplicador = 1): Fornada {
    if (this.fornadas.has(id)) {
      throw new Error(`Fornada ${id} já existe.`);
    }
    if (multiplicador <= 0) {
      throw new Error('O multiplicador de produção deve ser positivo.');
    }
    const receita = this.obterReceita(receitaId);
    if (!receita) {
      throw new Error(`Receita ${receitaId} não encontrada.`);
    }

    // 1. Validar e abater insumos do estoque
    for (const ing of receita.ingredientes) {
      const qtdTotal = ing.quantidade * multiplicador;
      this.estoque.consumirInsumo(ing.insumoId, qtdTotal);
    }

    const fornada: Fornada = {
      id,
      receitaId,
      multiplicador,
      iniciadaEm: new Date().toISOString(),
      status: 'assando',
      unidadesProduzidas: Math.round(receita.rendimentoUnidades * multiplicador)
    };

    this.fornadas.set(id, fornada);
    return { ...fornada };
  }

  concluirFornada(fornadaId: string, produtoIdDestino: string): Fornada {
    const fornada = this.fornadas.get(fornadaId);
    if (!fornada) {
      throw new Error(`Fornada ${fornadaId} não encontrada.`);
    }
    if (fornada.status !== 'assando') {
      throw new Error(`Fornada em status inválido para conclusão: ${fornada.status}`);
    }

    const produto = this.produtos.get(produtoIdDestino);
    if (!produto) {
      throw new Error(`Produto destino ${produtoIdDestino} não encontrado.`);
    }

    fornada.status = 'concluida';
    fornada.concluidaEm = new Date().toISOString();
    produto.estoquePronto += fornada.unidadesProduzidas;

    return { ...fornada };
  }

  obterFornada(id: string): Fornada | undefined {
    const f = this.fornadas.get(id);
    return f ? { ...f } : undefined;
  }
}
