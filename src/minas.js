const { dentroDoTabuleiro, vizinhos } = require('./tabuleiro');

// Sorteia `quantidade` posições distintas, nunca usando a posição `proibida`
function sortearMinas({ linhas, colunas, quantidade, proibida, rng = Math.random }) {
  const livres = [];
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      const ehProibida = proibida && proibida[0] === l && proibida[1] === c;
      if (!ehProibida) livres.push([l, c]);
    }
  }
  if (!Number.isInteger(quantidade) || quantidade < 0 || quantidade > livres.length) {
    throw new RangeError('Quantidade de minas inválida');
  }
  // Fisher-Yates parcial: as primeiras `quantidade` posições ficam embaralhadas
  for (let i = 0; i < quantidade; i++) {
    const j = i + Math.floor(rng() * (livres.length - i));
    [livres[i], livres[j]] = [livres[j], livres[i]];
  }
  return livres.slice(0, quantidade);
}

// Coloca as minas e recalcula quantas minas cada célula tem ao redor
function posicionarMinas(tabuleiro, posicoes) {
  const vistas = new Set();
  posicoes.forEach(([l, c]) => {
    const chave = `${l},${c}`;
    if (!dentroDoTabuleiro(tabuleiro, l, c) || vistas.has(chave)) throw new RangeError('Posição de mina inválida');
    vistas.add(chave);
  });
  posicoes.forEach(([l, c]) => { tabuleiro[l][c].mina = true; });
  tabuleiro.forEach((linha, l) => linha.forEach((celula, c) => {
    celula.minasAoRedor = vizinhos(tabuleiro, l, c).filter(([vl, vc]) => tabuleiro[vl][vc].mina).length;
  }));
  return tabuleiro;
}

module.exports = { sortearMinas, posicionarMinas };
