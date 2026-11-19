# Desafio Teste — Campo Minado (TDD)

Casos de teste em **JavaScript** (Jest) para um **Campo Minado de tabuleiro 18 x 14 com 40 bombas**.

Desenvolvido no estilo **TDD**: primeiro foram escritos os testes (`tests/`) e depois a implementação (`src/`)
que faz todos eles passarem, seguindo o contrato descrito abaixo.

## Colaborador

- Miguel Carreira — [@MiguelCarreiraa](https://github.com/MiguelCarreiraa)

---

## Especificação do desafio

- Casos de teste para testar **campo minado de tabuleiro 18 x 14 com 40 bombas**;
- Casos de teste em **JavaScript** para testar **JavaScript**.

### Regras adotadas

| Item | Regra |
|---|---|
| Tabuleiro | **18 colunas x 14 linhas** = 252 células. Posições são `(linha, coluna)`, começando em 0. |
| Minas (bombas) | **40**, sem repetição. |
| Sorteio | As minas só são sorteadas na **primeira jogada**, e a célula aberta nessa jogada **nunca** é mina. |
| Número da célula | Quantidade de minas nas até 8 células vizinhas (nas bordas e cantos, só contam os vizinhos que existem). |
| Abrir célula sem minas ao redor | Abre os vizinhos em **cascata**, parando nas células com número. A cascata não abre células marcadas. |
| Marcar (bandeira) | Marca/desmarca uma célula fechada. Célula marcada não é aberta por engano. O contador `minasRestantes` (= minas − bandeiras) pode ficar negativo. |
| Abrir vizinhos (clique duplo) | Em uma célula aberta com número, se a quantidade de bandeiras ao redor for igual ao número, abre todos os vizinhos não marcados. Se for diferente, nada acontece. |
| Derrota | Abrir uma mina. A mina que explodiu aparece como `X`, as outras como `*` (as já marcadas continuam `F`). |
| Vitória | Todas as células **sem mina** abertas (não é preciso marcar as minas). Ao ganhar, todas as minas aparecem marcadas. |
| Fim de jogo | Depois de ganhar ou perder, `abrir`, `marcar` e `abrirVizinhos` lançam erro. |

### Convenções escolhidas para os testes

- Com minas em **posições fixas** (opção `minas`), não há sorteio: a primeira jogada pode cair em mina.
  Isso existe só para deixar os testes determinísticos com tabuleiros pequenos (ex.: 3 x 3).
- O sorteio recebe uma função `rng` (gerador de números aleatórios) injetável; os testes usam um gerador com
  semente (`tests/helpers.js`), então os resultados são sempre os mesmos.

---

## Funcionamento dos casos de teste

### Como rodar

Requer [Node.js](https://nodejs.org/) 18 ou superior.

```bash
npm install
npm test
```

Resultado esperado: **4 suítes e 91 testes passando**.

### Estrutura

```
src/
├── tabuleiro.js          # dimensões 14 x 18, criação do tabuleiro e vizinhos
├── minas.js              # sorteio das 40 minas e contagem de minas ao redor
└── jogo.js               # classe Jogo (abrir, cascata, bandeiras, vitória e derrota)
tests/
├── helpers.js            # gerador aleatório com semente e utilitários dos testes
├── tabuleiro.test.js     # criação do tabuleiro 14 x 18 e cálculo de vizinhos
├── minas.test.js         # sorteio das 40 minas e contagem de minas ao redor
├── jogo.test.js          # configuração, primeira jogada, abrir, cascata, bandeiras, clique duplo
└── fimDeJogo.test.js     # derrota e vitória
```

### O que cada arquivo testa

| Arquivo | O que verifica |
|---|---|
| `tabuleiro.test.js` | Constantes (14 linhas, 18 colunas, 40 minas); tabuleiro com 252 células, todas fechadas e sem mina; células independentes; dimensões inválidas (`RangeError`); `dentroDoTabuleiro`; vizinhos no meio (8), nos cantos (3) e nas bordas (5). |
| `minas.test.js` | `sortearMinas`: exatamente 40, sem repetição, dentro do tabuleiro, nunca na posição proibida, mesma semente = mesmas minas, sementes diferentes = minas diferentes, funciona com `Math.random`, rejeita pedidos impossíveis. `posicionarMinas`: marca as minas, calcula o número de cada célula (inclusive 8 e cantos) e rejeita posições inválidas ou repetidas. |
| `jogo.test.js` | Jogo padrão 18 x 14 com 40 minas e estado `novo`; minas sorteadas só na primeira jogada; primeira célula nunca é mina (5 posições x 20 sementes); abrir célula com número; cascata (parando nos números, sem atravessar uma parede de minas e sem abrir células marcadas); bandeiras e contador; clique duplo; coordenadas inválidas; `celula()` devolve uma cópia. |
| `fimDeJogo.test.js` | Derrota (estado, `X`/`*` no mapa, minas marcadas, primeira jogada em mina fixa) e bloqueio de jogadas; vitória (sem precisar marcar, mapa final, contador zerado, partida completa no tabuleiro 18 x 14 abrindo as 212 células seguras) e bloqueio de jogadas. |

### Como ler o `mapa()` nos testes

Os testes usam tabuleiros pequenos e comparam o `mapa()`, uma lista de textos (uma linha por string):

| Símbolo | Significado |
|---|---|
| `#` | célula fechada |
| `F` | célula marcada com bandeira |
| `.` | aberta, sem minas ao redor |
| `1`…`8` | aberta, com essa quantidade de minas ao redor |
| `*` | mina revelada no fim do jogo |
| `X` | mina que explodiu |

Exemplo: em um tabuleiro 3 x 3 com mina em `(0,0)`, abrir `(2,2)` abre tudo em cascata e vence:

```
F1.
11.
...
```

---

## Contrato esperado (o que o código precisa exportar)

Módulos em CommonJS (`module.exports`). Posição = `[linha, coluna]`.
Célula = `{ mina, aberta, marcada, minasAoRedor }`.
Coordenadas fora do tabuleiro ou não inteiras lançam `RangeError`.

| Arquivo | Exporta |
|---|---|
| `src/tabuleiro.js` | `LINHAS` (14), `COLUNAS` (18), `TOTAL_MINAS` (40), `criarTabuleiro(linhas?, colunas?)` → matriz de células, `dentroDoTabuleiro(tabuleiro, linha, coluna)`, `vizinhos(tabuleiro, linha, coluna)` → lista de posições |
| `src/minas.js` | `sortearMinas({ linhas, colunas, quantidade, proibida?, rng? })` → lista de posições, `posicionarMinas(tabuleiro, posicoes)` → o mesmo tabuleiro, com minas e `minasAoRedor` calculados |
| `src/jogo.js` | classe `Jogo` |

### `Jogo`

`new Jogo({ linhas = 14, colunas = 18, totalMinas = 40, minas?, rng? })`

- `minas`: lista de posições fixas (sem sorteio); nesse caso `totalMinas` passa a ser `minas.length`.
- `totalMinas` precisa ser pelo menos 1 e menor que o número de células; senão, `RangeError`.
- Propriedades: `linhas`, `colunas`, `totalMinas`, `estado` (`'novo' | 'jogando' | 'ganhou' | 'perdeu'`),
  `minasRestantes`.
- Métodos:
  - `abrir(linha, coluna)`: abre a célula (ignorado se já aberta ou marcada);
  - `marcar(linha, coluna)`: alterna a bandeira (erro se a célula estiver aberta);
  - `abrirVizinhos(linha, coluna)`: clique duplo em um número;
  - `celula(linha, coluna)`: cópia de `{ mina, aberta, marcada, minasAoRedor }`;
  - `mapa()`: lista de strings, uma por linha, com os símbolos da tabela acima.
- Depois de `'ganhou'` ou `'perdeu'`, `abrir`, `marcar` e `abrirVizinhos` lançam erro.
