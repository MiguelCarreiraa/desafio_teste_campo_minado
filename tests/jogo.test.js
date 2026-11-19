const { Jogo } = require('../src/jogo');
const { rngComSemente, minasDoJogo } = require('./helpers');

// Legenda do mapa():
// '#' fechada | 'F' marcada | '.' aberta sem minas ao redor | '1'..'8' aberta com minas ao redor
// '*' mina revelada no fim | 'X' mina que explodiu

describe('Jogo - configuração inicial (18 colunas x 14 linhas, 40 minas)', () => {
  test('o jogo padrão tem 14 linhas, 18 colunas e 40 minas', () => {
    const jogo = new Jogo();
    expect(jogo.linhas).toBe(14);
    expect(jogo.colunas).toBe(18);
    expect(jogo.totalMinas).toBe(40);
  });

  test("começa no estado 'novo' com todas as 252 células fechadas", () => {
    const jogo = new Jogo();
    expect(jogo.estado).toBe('novo');
    expect(jogo.mapa()).toEqual(Array(14).fill('#'.repeat(18)));
  });

  test('o contador de minas restantes começa em 40', () => {
    expect(new Jogo().minasRestantes).toBe(40);
  });

  test('as minas só são sorteadas na primeira jogada', () => {
    const jogo = new Jogo({ rng: rngComSemente(5) });
    expect(minasDoJogo(jogo)).toHaveLength(0);
    jogo.abrir(7, 9);
    expect(minasDoJogo(jogo)).toHaveLength(40);
  });

  test('aceita minas em posições fixas (o total passa a ser a quantidade informada)', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0], [2, 2]] });
    expect(jogo.totalMinas).toBe(2);
    expect(jogo.estado).toBe('novo');
    expect(minasDoJogo(jogo)).toEqual([[0, 0], [2, 2]]);
  });

  test.each([
    ['zero minas', { totalMinas: 0 }],
    ['minas ocupando o tabuleiro todo', { linhas: 3, colunas: 3, totalMinas: 9 }],
    ['linhas inválidas', { linhas: 0 }],
    ['mina fixa fora do tabuleiro', { linhas: 3, colunas: 3, minas: [[3, 3]] }],
    ['mina fixa repetida', { linhas: 3, colunas: 3, minas: [[1, 1], [1, 1]] }],
  ])('rejeita configuração inválida: %s', (_nome, opcoes) => {
    expect(() => new Jogo(opcoes)).toThrow(RangeError);
  });
});

describe('Jogo - primeira jogada', () => {
  test.each([
    [0, 0], [0, 17], [13, 0], [13, 17], [7, 9],
  ])('a primeira célula aberta (%i, %i) nunca é mina (várias sementes)', (linha, coluna) => {
    for (let semente = 1; semente <= 20; semente++) {
      const jogo = new Jogo({ rng: rngComSemente(semente) });
      jogo.abrir(linha, coluna);
      expect(jogo.celula(linha, coluna).mina).toBe(false);
      expect(jogo.celula(linha, coluna).aberta).toBe(true);
      expect(jogo.estado).not.toBe('perdeu');
      expect(minasDoJogo(jogo)).toHaveLength(40);
    }
  });

  test('mesma semente gera o mesmo campo', () => {
    const gerar = () => {
      const jogo = new Jogo({ rng: rngComSemente(11) });
      jogo.abrir(0, 0);
      return minasDoJogo(jogo);
    };
    expect(gerar()).toEqual(gerar());
  });

  test("depois da primeira jogada (sem perder nem ganhar) o estado vira 'jogando'", () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.abrir(1, 1);
    expect(jogo.estado).toBe('jogando');
  });
});

describe('Jogo - abrir células', () => {
  test('abrir uma célula com número abre somente ela', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.abrir(1, 1);
    expect(jogo.mapa()).toEqual(['###', '#1#', '###']);
  });

  test('abrir uma célula sem minas ao redor abre os vizinhos em cascata até os números', () => {
    // Mina no centro da 3ª coluna: colunas 0 são vazias, colunas 1 são '1'.
    const jogo = new Jogo({ linhas: 3, colunas: 5, minas: [[1, 2]] });
    jogo.abrir(0, 0);
    expect(jogo.mapa()).toEqual(['.1###', '.1###', '.1###']);
  });

  test('a cascata não atravessa uma linha inteira de minas', () => {
    const jogo = new Jogo({ linhas: 5, colunas: 3, minas: [[2, 0], [2, 1], [2, 2]] });
    jogo.abrir(4, 0);
    expect(jogo.mapa()).toEqual(['###', '###', '###', '232', '...']);
  });

  test('a cascata não abre células marcadas', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 5, minas: [[1, 2]] });
    jogo.marcar(2, 0);
    jogo.abrir(0, 0);
    expect(jogo.mapa()).toEqual(['.1###', '.1###', 'F1###']);
  });

  test('abrir uma célula marcada é ignorado (a marcação protege a célula)', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.marcar(0, 0);
    jogo.abrir(0, 0);
    expect(jogo.estado).toBe('novo');
    expect(jogo.mapa()).toEqual(['F##', '###', '###']);
  });

  test('abrir uma célula já aberta não muda nada', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.abrir(1, 1);
    jogo.abrir(1, 1);
    expect(jogo.mapa()).toEqual(['###', '#1#', '###']);
    expect(jogo.estado).toBe('jogando');
  });

  test.each([
    ['linha negativa', -1, 0],
    ['linha além do limite', 14, 0],
    ['coluna negativa', 0, -1],
    ['coluna além do limite', 0, 18],
    ['coordenada não inteira', 0.5, 1],
  ])('rejeita coordenada inválida: %s', (_nome, linha, coluna) => {
    const jogo = new Jogo();
    expect(() => jogo.abrir(linha, coluna)).toThrow(RangeError);
    expect(() => jogo.marcar(linha, coluna)).toThrow(RangeError);
    expect(() => jogo.abrirVizinhos(linha, coluna)).toThrow(RangeError);
    expect(() => jogo.celula(linha, coluna)).toThrow(RangeError);
  });
});

describe('Jogo - marcar (bandeira)', () => {
  test('marcar e desmarcar alterna a bandeira da célula', () => {
    const jogo = new Jogo();
    jogo.marcar(3, 4);
    expect(jogo.celula(3, 4).marcada).toBe(true);
    jogo.marcar(3, 4);
    expect(jogo.celula(3, 4).marcada).toBe(false);
  });

  test('cada bandeira diminui o contador de minas restantes e desmarcar devolve', () => {
    const jogo = new Jogo();
    jogo.marcar(0, 0);
    jogo.marcar(0, 1);
    jogo.marcar(0, 2);
    expect(jogo.minasRestantes).toBe(37);
    jogo.marcar(0, 1);
    expect(jogo.minasRestantes).toBe(38);
  });

  test('o contador pode ficar negativo se houver mais bandeiras que minas', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.marcar(2, 2);
    jogo.marcar(2, 1);
    expect(jogo.minasRestantes).toBe(-1);
  });

  test("marcar antes da primeira jogada é permitido e mantém o estado 'novo'", () => {
    const jogo = new Jogo();
    jogo.marcar(5, 5);
    expect(jogo.estado).toBe('novo');
  });

  test('não é possível marcar uma célula aberta', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.abrir(1, 1);
    expect(() => jogo.marcar(1, 1)).toThrow();
  });
});

describe('Jogo - abrir vizinhos de um número (clique duplo)', () => {
  test('com bandeiras iguais ao número, abre todos os vizinhos não marcados', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 4, minas: [[0, 0]] });
    jogo.abrir(1, 1);
    jogo.marcar(0, 0);
    jogo.abrirVizinhos(1, 1);
    expect(jogo.celula(0, 1).aberta).toBe(true);
    expect(jogo.celula(2, 2).aberta).toBe(true);
    expect(jogo.celula(0, 0).aberta).toBe(false);
  });

  test('se o número de bandeiras for diferente do número da célula, nada acontece', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.abrir(1, 1);
    jogo.abrirVizinhos(1, 1);
    expect(jogo.mapa()).toEqual(['###', '#1#', '###']);
    expect(jogo.estado).toBe('jogando');
  });

  test('bandeira no lugar errado faz abrir a mina e perder o jogo', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.abrir(1, 1);
    jogo.marcar(0, 1); // bandeira errada
    jogo.abrirVizinhos(1, 1);
    expect(jogo.estado).toBe('perdeu');
  });

  test('em uma célula fechada não faz nada', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.abrir(1, 1);
    jogo.abrirVizinhos(2, 2);
    expect(jogo.mapa()).toEqual(['###', '#1#', '###']);
  });
});

describe('Jogo - consulta de célula', () => {
  test('celula() devolve { mina, aberta, marcada, minasAoRedor }', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    expect(jogo.celula(1, 1)).toEqual({ mina: false, aberta: false, marcada: false, minasAoRedor: 1 });
  });

  test('celula() devolve uma cópia: alterar o retorno não altera o jogo', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.celula(0, 0).mina = false;
    expect(jogo.celula(0, 0).mina).toBe(true);
  });
});
