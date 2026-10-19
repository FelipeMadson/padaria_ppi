import type { Venda, ItemVenda } from './types.ts';
import { ProducaoPadaria } from './bakery.ts';

export interface VendaInput {
  itens: Array<{ produtoId: string; quantidade: number }>;
  valorRecebidoCentavos: number;
  formaPagamento: 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito';
}

export class PontoDeVenda {
  private producao: ProducaoPadaria;
  private vendas: Venda[] = [];

  constructor(producao: ProducaoPadaria) {
    this.producao = producao;
  }

  processarVenda(id: string, input: VendaInput): Venda {
    if (input.itens.length === 0) {
      throw new Error('A venda deve conter pelo menos um item.');
    }

    let totalCentavos = 0;
    const itensProcessados: ItemVenda[] = [];

    // 1. Validar disponibilidade de estoque e calcular total
    for (const item of input.itens) {
      if (item.quantidade <= 0) {
        throw new Error('A quantidade vendida deve ser maior que zero.');
      }
      const produto = this.producao.obterProduto(item.produtoId);
      if (!produto) {
        throw new Error(`Produto ${item.produtoId} não encontrado.`);
      }
      if (produto.estoquePronto < item.quantidade) {
        throw new Error(
          `Estoque insuficiente de ${produto.nome}: disponível ${produto.estoquePronto}, solicitado ${item.quantidade}.`
        );
      }
      const subtotal = produto.precoVendaCentavos * item.quantidade;
      totalCentavos += subtotal;
      itensProcessados.push({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitarioCentavos: produto.precoVendaCentavos
      });
    }

    // 2. Validar pagamento
    if (input.formaPagamento === 'dinheiro' && input.valorRecebidoCentavos < totalCentavos) {
      throw new Error(
        `Valor recebido (R$ ${(input.valorRecebidoCentavos / 100).toFixed(2)}) é inferior ao total da venda (R$ ${(totalCentavos / 100).toFixed(2)}).`
      );
    }

    const trocoCentavos = input.formaPagamento === 'dinheiro'
      ? input.valorRecebidoCentavos - totalCentavos
      : 0;

    // 3. Abater itens do estoque de produtos prontos
    for (const item of input.itens) {
      this.producao.abaterEstoqueProduto(item.produtoId, item.quantidade);
    }

    const venda: Venda = {
      id,
      timestamp: new Date().toISOString(),
      itens: itensProcessados,
      totalCentavos,
      valorRecebidoCentavos: input.formaPagamento === 'dinheiro' ? input.valorRecebidoCentavos : totalCentavos,
      trocoCentavos,
      formaPagamento: input.formaPagamento
    };

    this.vendas.push(venda);
    return { ...venda };
  }

  gerarCupomTexto(vendaId: string): string {
    const venda = this.vendas.find(v => v.id === vendaId);
    if (!venda) {
      throw new Error(`Venda ${vendaId} não encontrada.`);
    }

    const linhas: string[] = [
      '========================================',
      '           PADARIA DO BAIRRO            ',
      '      CUPOM NÃO FISCAL - PDV PPI        ',
      '========================================',
      `Data: ${new Date(venda.timestamp).toLocaleString('pt-BR')}`,
      `Venda Nº: ${venda.id}`,
      '----------------------------------------',
      'ITEM   QTD   UN(R$)   TOTAL(R$)'
    ];

    for (const item of venda.itens) {
      const prod = this.producao.obterProduto(item.produtoId);
      const nome = prod ? prod.nome.slice(0, 16).padEnd(16, ' ') : item.produtoId.slice(0, 16);
      const qtd = String(item.quantidade).padStart(3, ' ');
      const un = (item.precoUnitarioCentavos / 100).toFixed(2).padStart(6, ' ');
      const tot = ((item.quantidade * item.precoUnitarioCentavos) / 100).toFixed(2).padStart(8, ' ');
      linhas.push(`${nome} ${qtd} ${un} ${tot}`);
    }

    linhas.push('----------------------------------------');
    linhas.push(`TOTAL:                  R$ ${(venda.totalCentavos / 100).toFixed(2)}`);
    linhas.push(`PAGAMENTO (${venda.formaPagamento.toUpperCase()}): R$ ${(venda.valorRecebidoCentavos / 100).toFixed(2)}`);
    if (venda.trocoCentavos > 0) {
      linhas.push(`TROCO:                  R$ ${(venda.trocoCentavos / 100).toFixed(2)}`);
    }
    linhas.push('========================================');
    linhas.push('        Obrigado pela preferência!       ');
    linhas.push('========================================');

    return linhas.join('\n');
  }

  listarVendas(): Venda[] {
    return this.vendas.map(v => ({ ...v }));
  }

  faturamentoTotalCentavos(): number {
    return this.vendas.reduce((acc, v) => acc + v.totalCentavos, 0);
  }
}
