import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GerenciadorEstoque,
  ProducaoPadaria,
  PontoDeVenda,
  type Insumo,
  type Receita,
  type ProdutoVenda
} from '../src/index.ts';

test('1. Gerenciamento de Insumos e Alerta de Estoque Mínimo', () => {
  const estoque = new GerenciadorEstoque();

  const farinha: Insumo = {
    id: 'far-01',
    nome: 'Farinha de Trigo Especial',
    unidade: 'kg',
    quantidadeEmEstoque: 50,
    estoqueMinimo: 20,
    custoPorUnidade: 450 // R$ 4,50 / kg
  };

  const fermento: Insumo = {
    id: 'fer-01',
    nome: 'Fermento Biológico Seco',
    unidade: 'g',
    quantidadeEmEstoque: 1000,
    estoqueMinimo: 300,
    custoPorUnidade: 8 // R$ 0,08 / g
  };

  estoque.cadastrarInsumo(farinha);
  estoque.cadastrarInsumo(fermento);

  assert.equal(estoque.listarInsumos().length, 2);
  assert.equal(estoque.verificarInsumosAbaixoDoMinimo().length, 0);

  // Consumir até ficar abaixo do mínimo
  estoque.consumirInsumo('far-01', 35);
  assert.equal(estoque.obterInsumo('far-01')?.quantidadeEmEstoque, 15);
  
  const alertas = estoque.verificarInsumosAbaixoDoMinimo();
  assert.equal(alertas.length, 1);
  assert.equal(alertas[0].id, 'far-01');

  // Repor estoque
  estoque.reporInsumo('far-01', 50, 480);
  assert.equal(estoque.obterInsumo('far-01')?.quantidadeEmEstoque, 65);
  assert.equal(estoque.obterInsumo('far-01')?.custoPorUnidade, 480);
  assert.equal(estoque.verificarInsumosAbaixoDoMinimo().length, 0);
});

test('2. Cálculo de Custo e Execução de Fornada', () => {
  const estoque = new GerenciadorEstoque();
  estoque.cadastrarInsumo({
    id: 'far-01',
    nome: 'Farinha de Trigo',
    unidade: 'kg',
    quantidadeEmEstoque: 100,
    estoqueMinimo: 10,
    custoPorUnidade: 400 // R$ 4,00/kg
  });
  estoque.cadastrarInsumo({
    id: 'man-01',
    nome: 'Manteiga',
    unidade: 'g',
    quantidadeEmEstoque: 5000,
    estoqueMinimo: 500,
    custoPorUnidade: 5 // R$ 0,05/g
  });

  const receitaCroissant: Receita = {
    id: 'rec-croissant',
    nome: 'Croissant Tradicional Francês',
    rendimentoUnidades: 20,
    tempoFornoMinutos: 25,
    temperaturaFornoCelsius: 190,
    ingredientes: [
      { insumoId: 'far-01', quantidade: 2 }, // 2 kg = R$ 8,00
      { insumoId: 'man-01', quantidade: 500 } // 500 g = R$ 25,00
    ]
  };

  const custoTotalLote = estoque.calcularCustoReceita(receitaCroissant);
  assert.equal(custoTotalLote, 3300); // R$ 33,00 para 20 croissants = R$ 1,65 cada

  const producao = new ProducaoPadaria(estoque);
  producao.cadastrarReceita(receitaCroissant);

  const produtoCroissant: ProdutoVenda = {
    id: 'prod-croissant',
    nome: 'Croissant Francês',
    precoVendaCentavos: 850, // R$ 8,50 cada
    estoquePronto: 0
  };
  producao.cadastrarProdutoVenda(produtoCroissant);

  // Iniciar fornada (multiplicador 2 = 40 croissants)
  const fornada = producao.iniciarFornada('forn-001', 'rec-croissant', 2);
  assert.equal(fornada.status, 'assando');
  assert.equal(fornada.unidadesProduzidas, 40);

  // Verificar consumo proporcional no estoque
  assert.equal(estoque.obterInsumo('far-01')?.quantidadeEmEstoque, 96); // 100 - (2 * 2)
  assert.equal(estoque.obterInsumo('man-01')?.quantidadeEmEstoque, 4000); // 5000 - (500 * 2)

  // Concluir fornada
  producao.concluirFornada('forn-001', 'prod-croissant');
  assert.equal(producao.obterProduto('prod-croissant')?.estoquePronto, 40);
});

test('3. Venda no PDV com Troco e Emissão de Cupom', () => {
  const estoque = new GerenciadorEstoque();
  const producao = new ProducaoPadaria(estoque);

  const produtoPaoFrances: ProdutoVenda = {
    id: 'prod-pao-frances',
    nome: 'Pão Francês',
    precoVendaCentavos: 120, // R$ 1,20 a unidade
    estoquePronto: 50
  };
  producao.cadastrarProdutoVenda(produtoPaoFrances);

  const pdv = new PontoDeVenda(producao);

  // Realizar venda de 10 pães = R$ 12,00. Pago com R$ 20,00 em dinheiro.
  const venda = pdv.processarVenda('venda-101', {
    itens: [{ produtoId: 'prod-pao-frances', quantidade: 10 }],
    formaPagamento: 'dinheiro',
    valorRecebidoCentavos: 2000
  });

  assert.equal(venda.totalCentavos, 1200);
  assert.equal(venda.valorRecebidoCentavos, 2000);
  assert.equal(venda.trocoCentavos, 800); // Troco: R$ 8,00
  assert.equal(producao.obterProduto('prod-pao-frances')?.estoquePronto, 40);

  // Verificar cupom texto
  const cupom = pdv.gerarCupomTexto('venda-101');
  assert.match(cupom, /PADARIA DO BAIRRO/);
  assert.match(cupom, /TOTAL:\s+R\$\s+12\.00/);
  assert.match(cupom, /TROCO:\s+R\$\s+8\.00/);
  assert.match(cupom, /Pão Francês/);

  // Verificar faturamento
  assert.equal(pdv.faturamentoTotalCentavos(), 1200);
});

test('4. Validação de Restrições e Erros de Estoque e Pagamento', () => {
  const estoque = new GerenciadorEstoque();
  const producao = new ProducaoPadaria(estoque);
  const pdv = new PontoDeVenda(producao);

  producao.cadastrarProdutoVenda({
    id: 'prod-broa',
    nome: 'Broa de Milho',
    precoVendaCentavos: 500,
    estoquePronto: 2
  });

  // Tentar vender quantidade maior que o estoque pronto
  assert.throws(() => {
    pdv.processarVenda('venda-fail-1', {
      itens: [{ produtoId: 'prod-broa', quantidade: 5 }],
      formaPagamento: 'pix',
      valorRecebidoCentavos: 2500
    });
  }, /Estoque insuficiente/);

  // Tentar pagar com valor menor que o total em dinheiro
  assert.throws(() => {
    pdv.processarVenda('venda-fail-2', {
      itens: [{ produtoId: 'prod-broa', quantidade: 2 }],
      formaPagamento: 'dinheiro',
      valorRecebidoCentavos: 900 // Total é 1000
    });
  }, /inferior ao total/);
});
