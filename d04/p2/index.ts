import { range, readInputFileLines } from '../../util'

const CARD_PATTERN = /Card ((?:\s|\d)+): ((?:\d|\s)+) \| ((?:\d|\s)+)/

function parseLine(line: string) {
  const match = CARD_PATTERN.exec(line)!
  const cardNumber = parseInt(match[1])
  const winningNumbers = match[2].split(' ').filter((n) => n.length > 0)
  const yourNumbers = match[3].split(' ').filter((n) => n.length > 0)
  return { cardNumber, winningNumbers, yourNumbers }
}

const inputs = readInputFileLines(__dirname, parseLine)
const matchesByCardNumber = new Map<number, number>()
const copiesOfCards = new Map<number, number>()
const maxCardNumber = inputs.length + 1

// Calculate how many matches each card has
for (const { cardNumber, winningNumbers, yourNumbers } of inputs) {
  let matches = 0

  for (const number of yourNumbers) {
    if (winningNumbers.includes(number)) {
      matches++
    }
  }

  matchesByCardNumber.set(cardNumber, matches)
  copiesOfCards.set(cardNumber, 1)
}

// For each card starting from 1...
for (const cardNumber of range(1, maxCardNumber)) {
  const copies = copiesOfCards.get(cardNumber)!
  const matches = matchesByCardNumber.get(cardNumber)!

  // ... for each match there was in the card...
  for (const offset of range(1, matches + 1)) {
    // Choose copied card
    const copiedCardNumber = cardNumber + offset
    if (copiedCardNumber > maxCardNumber) {
      break
    }

    // Increase number of copied card by number of cards doing the copying
    copiesOfCards.set(
      copiedCardNumber,
      copiesOfCards.get(copiedCardNumber)! + copies
    )
  }
}

// Sum up total number of copies
console.log([...copiesOfCards.values()].reduce((prev, curr) => prev + curr, 0))
