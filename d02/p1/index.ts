import { readInputFileLines } from '../../util'

const MAX_GEMS: { [color: string]: number } = {
  red: 12,
  green: 13,
  blue: 14,
}

function parseLine(line: string) {
  const [game, revealsRaw] = line.split(':')
  const [_, gameNum] = game.split(' ')
  const reveals = revealsRaw
    .split(';')
    .map((rev) => rev.split(',').map((pair) => pair.substring(1).split(' ')))
  return { gameNum: parseInt(gameNum), reveals }
}

const games = readInputFileLines(__dirname, parseLine)

let sum = 0

nextGame: for (const { gameNum, reveals } of games) {
  for (const reveal of reveals) {
    for (const [countString, color] of reveal) {
      const count = parseInt(countString)

      if (count > MAX_GEMS[color]) {
        continue nextGame
      }
    }
  }

  sum += gameNum
}

console.log(sum)
