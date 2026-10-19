import type { Insumo, Receita } from './types.ts';

export class GerenciadorEstoque {
  private insumos = new Map<string, Insumo>();

  cadastrarInsumo(insumo: Insumo): void {
    if (this.insumos.has(insumo.id)) {
      throw new Error(`Insumo com ID ${insumo.id} já cadastrado.`);
    }
    this.insumos.set(insumo.id, { ...insumo });
  }

  obterInsumo(id: string): Insumo | undefined {
    const item = this.insumos.get(id);
    return item ? { ...item } : undefined;
  }

  listarInsumos(): Insumo[] {
    return Array.from(this.insumos.values()).map(i => ({ ...i }));
  }

  reporInsumo(id: string, quantidade: number, novoCustoCentavos?: number): void {
    if (quantidade <= 0) {
      throw new Error('A quantidade de reposição deve ser estritamente positiva.');
    }
    const insumo = this.insumos.get(id);
    if (!insumo) {
      throw new Error(`Insumo com ID ${id} não encontrado.`);
    }
    insumo.quantidadeEmEstoque += quantidade;
    if (novoCustoCentavos !== undefined && novoCustoCentavos >= 0) {
      insumo.custoPorUnidade = novoCustoCentavos;
    }
  }

  consumirInsumo(id: string, quantidade: number): void {
    if (quantidade <= 0) {
      throw new Error('A quantidade a consumir deve ser positiva.');
    }
    const insumo = this.insumos.get(id);
    if (!insumo) {
      throw new Error(`Insumo com ID ${id} não encontrado.`);
    }
    if (insumo.quantidadeEmEstoque < quantidade) {
      throw new Error(
        `Estoque insuficiente de ${insumo.nome}: disponível ${insumo.quantidadeEmEstoque}${insumo.unidade}, solicitado ${quantidade}${insumo.unidade}.`
      );
    }
    insumo.quantidadeEmEstoque -= quantidade;
  }

  verificarInsumosAbaixoDoMinimo(): Insumo[] {
    return this.listarInsumos().filter(i => i.quantidadeEmEstoque <= i.estoqueMinimo);
  }

  calcularCustoReceita(receita: Receita, multiplicador = 1): number {
    let custoTotal = 0;
    for (const ing of receita.ingredientes) {
      const insumo = this.obterInsumo(ing.insumoId);
      if (!insumo) {
        throw new Error(`Insumo ${ing.insumoId} da receita ${receita.nome} não encontrado no estoque.`);
      }
      custoTotal += Math.round(ing.quantidade * insumo.custoPorUnidade * multiplicador);
    }
    return custoTotal;
  }
}
