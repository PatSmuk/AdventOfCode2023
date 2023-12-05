import { readInputFileLines } from '../../util'

const CARD_PATTERN = /Card (?:(?:\s|\d)+): ((?:\d|\s)+) \| ((?:\d|\s)+)/

function parseLine(line: string) {
  const match = CARD_PATTERN.exec(line)!
  const winningNumbers = match[1].split(' ').filter((n) => n.length > 0)
  const yourNumbers = match[2].split(' ').filter((n) => n.length > 0)
  return { winningNumbers, yourNumbers }
}

const inputs = readInputFileLines(__dirname, parseLine)
let totalPoints = 0

for (const { winningNumbers, yourNumbers } of inputs) {
  let points = 0

  for (const number of yourNumbers) {
    if (winningNumbers.includes(number)) {
      points += points === 0 ? 1 : points
    }
  }

  totalPoints += points
}

console.log(totalPoints)
