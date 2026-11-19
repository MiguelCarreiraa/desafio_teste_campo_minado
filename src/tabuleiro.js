const LINHAS = 14;
const COLUNAS = 18;
const TOTAL_MINAS = 40;

const inteiroPositivo = (n) => Number.isInteger(n) && n > 0;

// Matriz linhas x colunas; cada célula é um objeto independente
function criarTabuleiro(linhas = LINHAS, colunas = COLUNAS) {
  if (!inteiroPositivo(linhas) || !inteiroPositivo(colunas)) throw new RangeError('Dimensões inválidas');
  return Array.from({ length: linhas }, () =>
    Array.from({ length: colunas }, () => ({ mina: false, aberta: false, marcada: false, minasAoRedor: 0 })));
}

function dentroDoTabuleiro(tabuleiro, linha, coluna) {
  return Number.isInteger(linha) && Number.isInteger(coluna)
    && linha >= 0 && linha < tabuleiro.length
    && coluna >= 0 && coluna < tabuleiro[0].length;
}

// Até 8 posições ao redor (só as que existem no tabuleiro)
function vizinhos(tabuleiro, linha, coluna) {
  const lista = [];
  for (let dl = -1; dl <= 1; dl++) {
    for (let dc = -1; dc <= 1; dc++) {
      const naoEhElaMesma = dl !== 0 || dc !== 0;
      if (naoEhElaMesma && dentroDoTabuleiro(tabuleiro, linha + dl, coluna + dc)) {
        lista.push([linha + dl, coluna + dc]);
      }
    }
  }
  return lista;
}

module.exports = { LINHAS, COLUNAS, TOTAL_MINAS, criarTabuleiro, dentroDoTabuleiro, vizinhos };
