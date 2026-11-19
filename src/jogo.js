const {
  LINHAS, COLUNAS, TOTAL_MINAS, criarTabuleiro, dentroDoTabuleiro, vizinhos,
} = require('./tabuleiro');
const { sortearMinas, posicionarMinas } = require('./minas');

class Jogo {
  constructor({ linhas = LINHAS, colunas = COLUNAS, totalMinas = TOTAL_MINAS, minas, rng = Math.random } = {}) {
    this.tabuleiro = criarTabuleiro(linhas, colunas);
    this.linhas = linhas;
    this.colunas = colunas;
    this.rng = rng;
    this.estado = 'novo';
    this.minaExplodida = null;

    if (minas) {
      // Minas fixas: usadas nos testes, sem sorteio
      posicionarMinas(this.tabuleiro, minas);
      this.totalMinas = minas.length;
      this.minasPosicionadas = true;
    } else {
      // Minas sorteadas só na primeira jogada
      this.totalMinas = totalMinas;
      this.minasPosicionadas = false;
    }
    if (!Number.isInteger(this.totalMinas) || this.totalMinas < 1 || this.totalMinas >= linhas * colunas) {
      throw new RangeError('Quantidade de minas inválida');
    }
  }

  get minasRestantes() {
    return this.totalMinas - this.tabuleiro.flat().filter((celula) => celula.marcada).length;
  }

  get terminou() {
    return this.estado === 'ganhou' || this.estado === 'perdeu';
  }

  validarJogada(linha, coluna) {
    if (!dentroDoTabuleiro(this.tabuleiro, linha, coluna)) throw new RangeError('Coordenada inválida');
    if (this.terminou) throw new Error('Jogo encerrado');
  }

  abrir(linha, coluna) {
    this.validarJogada(linha, coluna);
    const celula = this.tabuleiro[linha][coluna];
    if (celula.aberta || celula.marcada) return;

    if (!this.minasPosicionadas) {
      const sorteadas = sortearMinas({
        linhas: this.linhas,
        colunas: this.colunas,
        quantidade: this.totalMinas,
        proibida: [linha, coluna],
        rng: this.rng,
      });
      posicionarMinas(this.tabuleiro, sorteadas);
      this.minasPosicionadas = true;
    }
    this.estado = 'jogando';

    if (celula.mina) {
      celula.aberta = true;
      this.minaExplodida = [linha, coluna];
      this.estado = 'perdeu';
      return;
    }

    // Cascata: células sem minas ao redor abrem os vizinhos
    const pendentes = [[linha, coluna]];
    while (pendentes.length) {
      const [l, c] = pendentes.pop();
      const atual = this.tabuleiro[l][c];
      if (atual.aberta || atual.marcada || atual.mina) continue;
      atual.aberta = true;
      if (atual.minasAoRedor === 0) pendentes.push(...vizinhos(this.tabuleiro, l, c));
    }

    if (this.tabuleiro.flat().every((x) => x.mina || x.aberta)) {
      this.estado = 'ganhou';
      this.tabuleiro.flat().forEach((x) => { if (x.mina) x.marcada = true; });
    }
  }

  marcar(linha, coluna) {
    this.validarJogada(linha, coluna);
    const celula = this.tabuleiro[linha][coluna];
    if (celula.aberta) throw new Error('Não é possível marcar uma célula aberta');
    celula.marcada = !celula.marcada;
  }

  // Clique duplo: se as bandeiras ao redor batem com o número, abre os outros vizinhos
  abrirVizinhos(linha, coluna) {
    this.validarJogada(linha, coluna);
    const celula = this.tabuleiro[linha][coluna];
    if (!celula.aberta || celula.minasAoRedor === 0) return;
    const aoRedor = vizinhos(this.tabuleiro, linha, coluna);
    const bandeiras = aoRedor.filter(([l, c]) => this.tabuleiro[l][c].marcada).length;
    if (bandeiras !== celula.minasAoRedor) return;
    for (const [l, c] of aoRedor) {
      if (this.terminou) break;
      this.abrir(l, c);
    }
  }

  celula(linha, coluna) {
    if (!dentroDoTabuleiro(this.tabuleiro, linha, coluna)) throw new RangeError('Coordenada inválida');
    const { mina, aberta, marcada, minasAoRedor } = this.tabuleiro[linha][coluna];
    return { mina, aberta, marcada, minasAoRedor };
  }

  mapa() {
    return this.tabuleiro.map((linhaDoTabuleiro, l) => linhaDoTabuleiro.map((celula, c) => {
      if (celula.marcada) return 'F';
      if (this.estado === 'perdeu' && celula.mina) {
        const explodiu = this.minaExplodida[0] === l && this.minaExplodida[1] === c;
        return explodiu ? 'X' : '*';
      }
      if (!celula.aberta) return '#';
      return celula.minasAoRedor === 0 ? '.' : String(celula.minasAoRedor);
    }).join(''));
  }
}

module.exports = { Jogo };
