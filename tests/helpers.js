// Gerador pseudoaleatório com semente (Park-Miller).
// Mesma semente => mesma sequência de números, o que deixa os testes reprodutíveis.
function rngComSemente(semente) {
  let estado = semente;
  return () => {
    estado = (estado * 16807) % 2147483647;
    return estado / 2147483647;
  };
}

// Ordena uma lista de posições [linha, coluna] para comparar sem depender da ordem.
function ordenar(posicoes) {
  return [...posicoes].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

// Lista as posições que têm mina em um jogo (usando jogo.celula).
function minasDoJogo(jogo) {
  const posicoes = [];
  for (let l = 0; l < jogo.linhas; l++) {
    for (let c = 0; c < jogo.colunas; c++) {
      if (jogo.celula(l, c).mina) posicoes.push([l, c]);
    }
  }
  return posicoes;
}

module.exports = { rngComSemente, ordenar, minasDoJogo };
