const {
  LINHAS,
  COLUNAS,
  TOTAL_MINAS,
  criarTabuleiro,
  dentroDoTabuleiro,
  vizinhos,
} = require('../src/tabuleiro');
const { ordenar } = require('./helpers');

describe('Constantes do desafio', () => {
  test('o tabuleiro padrão tem 14 linhas, 18 colunas e 40 minas', () => {
    expect(LINHAS).toBe(14);
    expect(COLUNAS).toBe(18);
    expect(TOTAL_MINAS).toBe(40);
  });
});

describe('criarTabuleiro', () => {
  test('sem argumentos cria uma matriz de 14 linhas por 18 colunas (252 células)', () => {
    const tabuleiro = criarTabuleiro();
    expect(tabuleiro).toHaveLength(14);
    tabuleiro.forEach((linha) => expect(linha).toHaveLength(18));
    expect(tabuleiro.flat()).toHaveLength(252);
  });

  test('toda célula começa fechada, sem mina, sem marcação e com 0 minas ao redor', () => {
    criarTabuleiro().flat().forEach((celula) => {
      expect(celula).toEqual({ mina: false, aberta: false, marcada: false, minasAoRedor: 0 });
    });
  });

  test('aceita outras dimensões (linhas, colunas)', () => {
    const tabuleiro = criarTabuleiro(3, 5);
    expect(tabuleiro).toHaveLength(3);
    tabuleiro.forEach((linha) => expect(linha).toHaveLength(5));
  });

  test('cada célula é um objeto independente', () => {
    const tabuleiro = criarTabuleiro(2, 2);
    tabuleiro[0][0].aberta = true;
    expect(tabuleiro[0][1].aberta).toBe(false);
    expect(tabuleiro[1][0].aberta).toBe(false);
  });

  test.each([
    ['zero linhas', 0, 5],
    ['colunas negativas', 5, -1],
    ['linhas não inteiras', 2.5, 5],
  ])('rejeita dimensões inválidas: %s', (_nome, linhas, colunas) => {
    expect(() => criarTabuleiro(linhas, colunas)).toThrow(RangeError);
  });
});

describe('dentroDoTabuleiro', () => {
  const tabuleiro = criarTabuleiro();

  test.each([
    [0, 0],
    [13, 17],
    [7, 9],
  ])('(%i, %i) está dentro do tabuleiro 14 x 18', (linha, coluna) => {
    expect(dentroDoTabuleiro(tabuleiro, linha, coluna)).toBe(true);
  });

  test.each([
    [-1, 0],
    [0, -1],
    [14, 0],
    [0, 18],
    [1.5, 2],
  ])('(%p, %p) está fora do tabuleiro 14 x 18', (linha, coluna) => {
    expect(dentroDoTabuleiro(tabuleiro, linha, coluna)).toBe(false);
  });
});

describe('vizinhos', () => {
  const tabuleiro = criarTabuleiro();

  test('uma célula do meio tem 8 vizinhos', () => {
    expect(ordenar(vizinhos(tabuleiro, 5, 5))).toEqual([
      [4, 4], [4, 5], [4, 6],
      [5, 4], [5, 6],
      [6, 4], [6, 5], [6, 6],
    ]);
  });

  test.each([
    [0, 0, [[0, 1], [1, 0], [1, 1]]],
    [0, 17, [[0, 16], [1, 16], [1, 17]]],
    [13, 0, [[12, 0], [12, 1], [13, 1]]],
    [13, 17, [[12, 16], [12, 17], [13, 16]]],
  ])('o canto (%i, %i) tem só 3 vizinhos', (linha, coluna, esperado) => {
    expect(ordenar(vizinhos(tabuleiro, linha, coluna))).toEqual(esperado);
  });

  test('uma célula de borda (não canto) tem 5 vizinhos', () => {
    expect(vizinhos(tabuleiro, 0, 8)).toHaveLength(5);
    expect(vizinhos(tabuleiro, 6, 17)).toHaveLength(5);
  });

  test('a própria célula não é vizinha dela mesma', () => {
    expect(vizinhos(tabuleiro, 5, 5)).not.toContainEqual([5, 5]);
  });
});
