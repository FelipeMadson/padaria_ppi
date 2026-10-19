export type UnidadeMedida = 'kg' | 'g' | 'l' | 'ml' | 'unidade';

export interface Insumo {
  id: string;
  nome: string;
  unidade: UnidadeMedida;
  quantidadeEmEstoque: number;
  estoqueMinimo: number;
  custoPorUnidade: number; // em centavos (R$ 0,01)
}

export interface IngredienteReceita {
  insumoId: string;
  quantidade: number;
}

export interface Receita {
  id: string;
  nome: string;
  ingredientes: IngredienteReceita[];
  rendimentoUnidades: number;
  tempoFornoMinutos: number;
  temperaturaFornoCelsius: number;
}

export interface ProdutoVenda {
  id: string;
  nome: string;
  receitaId?: string;
  precoVendaCentavos: number;
  estoquePronto: number;
}

export interface ItemVenda {
  produtoId: string;
  quantidade: number;
  precoUnitarioCentavos: number;
}

export interface Venda {
  id: string;
  timestamp: string;
  itens: ItemVenda[];
  totalCentavos: number;
  valorRecebidoCentavos: number;
  trocoCentavos: number;
  formaPagamento: 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito';
}

export interface Fornada {
  id: string;
  receitaId: string;
  multiplicador: number;
  iniciadaEm: string;
  concluidaEm?: string;
  status: 'em_preparo' | 'assando' | 'concluida' | 'cancelada';
  unidadesProduzidas: number;
}
