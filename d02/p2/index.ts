import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  const [_, reveals] = line.split(':')
  const hands = reveals
    .split(';')
    .map((hand) => hand.split(',').map((x) => x.substring(1).split(' ')))
  return { hands }
}

const games = readInputFileLines(__dirname, parseLine)

let sum = 0

for (const { hands } of games) {
  const maxs: { [color: string]: number } = {
    red: 0,
    green: 0,
    blue: 0,
  }

  for (const hand of hands) {
    for (const [countString, color] of hand) {
      const count = parseInt(countString)
      maxs[color] = Math.max(maxs[color], count)
    }
  }

  sum += maxs.red * maxs.green * maxs.blue
}

console.log(sum)
