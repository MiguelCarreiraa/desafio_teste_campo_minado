const { Jogo } = require('../src/jogo');
const { rngComSemente } = require('./helpers');

describe('Fim de jogo - derrota', () => {
  test("abrir uma mina termina o jogo com estado 'perdeu'", () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0], [2, 2]] });
    jogo.abrir(1, 1);
    jogo.abrir(2, 2);
    expect(jogo.estado).toBe('perdeu');
  });

  test("a mina que explodiu aparece como 'X' e as outras minas são reveladas como '*'", () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0], [2, 2]] });
    jogo.abrir(2, 2);
    expect(jogo.mapa()).toEqual(['*##', '###', '##X']);
  });

  test("minas que já estavam marcadas continuam como 'F' na derrota", () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0], [2, 2]] });
    jogo.marcar(0, 0);
    jogo.abrir(2, 2);
    expect(jogo.mapa()).toEqual(['F##', '###', '##X']);
  });

  test('com minas fixas, a primeira jogada pode cair em mina (não há reposicionamento)', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[1, 1]] });
    jogo.abrir(1, 1);
    expect(jogo.estado).toBe('perdeu');
  });

  test('depois de perder não é possível abrir, marcar nem abrir vizinhos', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.abrir(0, 0);
    expect(() => jogo.abrir(2, 2)).toThrow();
    expect(() => jogo.marcar(2, 2)).toThrow();
    expect(() => jogo.abrirVizinhos(1, 1)).toThrow();
  });
});

describe('Fim de jogo - vitória', () => {
  test("abrir todas as células sem mina termina o jogo com estado 'ganhou'", () => {
    const jogo = new Jogo({ linhas: 2, colunas: 2, minas: [[0, 0]] });
    jogo.abrir(0, 1);
    jogo.abrir(1, 0);
    expect(jogo.estado).toBe('jogando');
    jogo.abrir(1, 1);
    expect(jogo.estado).toBe('ganhou');
  });

  test('não é preciso marcar as minas para ganhar', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.abrir(2, 2); // a cascata abre tudo, menos a mina
    expect(jogo.estado).toBe('ganhou');
  });

  test("ao ganhar, todas as minas aparecem marcadas ('F') e o contador zera", () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.abrir(2, 2);
    expect(jogo.mapa()).toEqual(['F1.', '11.', '...']);
    expect(jogo.minasRestantes).toBe(0);
  });

  test('vence o tabuleiro completo 14 x 18 com 40 minas abrindo as 212 células seguras', () => {
    const jogo = new Jogo({ rng: rngComSemente(21) });
    jogo.abrir(7, 9);
    const seguras = [];
    for (let l = 0; l < 14; l++) {
      for (let c = 0; c < 18; c++) {
        if (!jogo.celula(l, c).mina) seguras.push([l, c]);
      }
    }
    expect(seguras).toHaveLength(14 * 18 - 40);
    seguras.forEach(([l, c]) => {
      if (jogo.estado === 'jogando') jogo.abrir(l, c);
    });
    expect(jogo.estado).toBe('ganhou');
  });

  test('enquanto restar uma célula segura fechada, o jogo continua', () => {
    // A célula (0,0) fica isolada por minas, então a cascata não chega nela.
    const jogo = new Jogo({ linhas: 4, colunas: 4, minas: [[0, 1], [1, 0], [1, 1]] });
    jogo.abrir(3, 3);
    expect(jogo.celula(0, 0).aberta).toBe(false);
    expect(jogo.estado).toBe('jogando');
    jogo.abrir(0, 0);
    expect(jogo.estado).toBe('ganhou');
  });

  test('depois de ganhar não é possível continuar jogando', () => {
    const jogo = new Jogo({ linhas: 3, colunas: 3, minas: [[0, 0]] });
    jogo.abrir(2, 2);
    expect(() => jogo.abrir(0, 0)).toThrow();
    expect(() => jogo.marcar(0, 0)).toThrow();
  });
});
