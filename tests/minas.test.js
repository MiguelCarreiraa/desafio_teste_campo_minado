const { criarTabuleiro } = require('../src/tabuleiro');
const { sortearMinas, posicionarMinas } = require('../src/minas');
const { rngComSemente, ordenar } = require('./helpers');

const chave = ([l, c]) => `${l},${c}`;

describe('sortearMinas', () => {
  const padrao = (opcoes = {}) =>
    sortearMinas({ linhas: 14, colunas: 18, quantidade: 40, rng: rngComSemente(7), ...opcoes });

  test('sorteia exatamente a quantidade pedida (40)', () => {
    expect(padrao()).toHaveLength(40);
  });

  test('não repete posições', () => {
    const minas = padrao();
    expect(new Set(minas.map(chave)).size).toBe(40);
  });

  test('todas as posições estão dentro do tabuleiro 14 x 18', () => {
    padrao().forEach(([l, c]) => {
      expect(Number.isInteger(l) && l >= 0 && l < 14).toBe(true);
      expect(Number.isInteger(c) && c >= 0 && c < 18).toBe(true);
    });
  });

  test('nunca coloca mina na posição proibida (várias sementes)', () => {
    for (let semente = 1; semente <= 30; semente++) {
      const minas = padrao({ proibida: [6, 9], rng: rngComSemente(semente) });
      expect(minas).not.toContainEqual([6, 9]);
      expect(minas).toHaveLength(40);
    }
  });

  test('com 8 minas em 3 x 3 e o centro proibido, ocupa todas as outras 8 casas', () => {
    for (let semente = 1; semente <= 10; semente++) {
      const minas = sortearMinas({
        linhas: 3, colunas: 3, quantidade: 8, proibida: [1, 1], rng: rngComSemente(semente),
      });
      expect(ordenar(minas)).toEqual([
        [0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2],
      ]);
    }
  });

  test('a mesma semente sorteia as mesmas posições', () => {
    expect(padrao({ rng: rngComSemente(3) })).toEqual(padrao({ rng: rngComSemente(3) }));
  });

  test('sementes diferentes sorteiam posições diferentes', () => {
    const a = ordenar(padrao({ rng: rngComSemente(1) }));
    const b = ordenar(padrao({ rng: rngComSemente(2) }));
    expect(a).not.toEqual(b);
  });

  test('sem rng informado, usa Math.random e continua válido', () => {
    const minas = sortearMinas({ linhas: 14, colunas: 18, quantidade: 40 });
    expect(new Set(minas.map(chave)).size).toBe(40);
  });

  test.each([
    ['quantidade negativa', { quantidade: -1 }],
    ['quantidade não inteira', { quantidade: 2.5 }],
    ['mais minas do que casas livres', { linhas: 3, colunas: 3, quantidade: 9, proibida: [0, 0] }],
  ])('rejeita pedido inválido: %s', (_nome, opcoes) => {
    expect(() => padrao(opcoes)).toThrow(RangeError);
  });
});

describe('posicionarMinas', () => {
  test('coloca as minas nas posições informadas e devolve o próprio tabuleiro', () => {
    const tabuleiro = criarTabuleiro(3, 3);
    const retorno = posicionarMinas(tabuleiro, [[0, 0], [2, 1]]);
    expect(retorno).toBe(tabuleiro);
    expect(tabuleiro[0][0].mina).toBe(true);
    expect(tabuleiro[2][1].mina).toBe(true);
    expect(tabuleiro.flat().filter((cel) => cel.mina)).toHaveLength(2);
  });

  test('calcula quantas minas existem ao redor de cada célula', () => {
    // M . .
    // . . .
    // . M .
    const tabuleiro = posicionarMinas(criarTabuleiro(3, 3), [[0, 0], [2, 1]]);
    expect(tabuleiro[0][1].minasAoRedor).toBe(1);
    expect(tabuleiro[0][2].minasAoRedor).toBe(0);
    expect(tabuleiro[1][0].minasAoRedor).toBe(2);
    expect(tabuleiro[1][1].minasAoRedor).toBe(2);
    expect(tabuleiro[1][2].minasAoRedor).toBe(1);
    expect(tabuleiro[2][0].minasAoRedor).toBe(1);
    expect(tabuleiro[2][2].minasAoRedor).toBe(1);
  });

  test('uma célula cercada por 8 minas tem 8 minas ao redor', () => {
    const anel = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]];
    const tabuleiro = posicionarMinas(criarTabuleiro(3, 3), anel);
    expect(tabuleiro[1][1].minasAoRedor).toBe(8);
  });

  test('nos cantos, conta só os vizinhos que existem', () => {
    const tabuleiro = posicionarMinas(criarTabuleiro(14, 18), [[0, 17], [1, 16]]);
    expect(tabuleiro[0][16].minasAoRedor).toBe(2);
    expect(tabuleiro[1][17].minasAoRedor).toBe(2);
  });

  test.each([
    ['linha fora do tabuleiro', [[3, 0]]],
    ['coluna fora do tabuleiro', [[0, -1]]],
    ['posição repetida', [[1, 1], [1, 1]]],
  ])('rejeita posições inválidas: %s', (_nome, posicoes) => {
    expect(() => posicionarMinas(criarTabuleiro(3, 3), posicoes)).toThrow(RangeError);
  });
});
