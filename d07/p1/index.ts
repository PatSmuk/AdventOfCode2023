import { each, range, readInputFileLines, mapInc } from '../../util'
import { HandKind, CARD_VALUE } from '../util'

function parseLine(line: string) {
  const [handString, bidString] = line.split(' ')
  const bid = parseInt(bidString)

  // Count up how many of each card there are in the hand
  const cardCounts = new Map<string, number>()
  // Also figure out the value of each card in original order
  const cardValues: number[] = []

  for (const card of handString.split('')) {
    mapInc(cardCounts, card, 1)
    cardValues.push(CARD_VALUE[card]!)
  }

  // Now sort the card counts and get the first-most and second-most count
  const [first, second] = [...cardCounts.values()].sort((a, b) => b - a)

  // If only TS had pattern matching T_T
  let kind = HandKind.HIGH_CARD
  if (first === 5) {
    kind = HandKind.FIVE_OF_A_KIND
  } else if (first === 4) {
    kind = HandKind.FOUR_OF_A_KIND
  } else if (first === 3) {
    if (second === 2) {
      kind = HandKind.FULL_HOUSE
    } else {
      kind = HandKind.THREE_OF_A_KIND
    }
  } else if (first === 2) {
    if (second === 2) {
      kind = HandKind.TWO_PAIR
    } else {
      kind = HandKind.ONE_PAIR
    }
  }

  return { hand: { kind, cardValues }, bid }
}

const hands = readInputFileLines(__dirname, parseLine)

// Sort the hands from lowest rank to highest
hands.sort((a, b) => {
  // Kind has highest priority
  if (a.hand.kind > b.hand.kind) {
    return 1
  }
  if (a.hand.kind < b.hand.kind) {
    return -1
  }

  // Break tie by comparing cards in original order
  for (const i of range(0, 5)) {
    if (a.hand.cardValues[i] > b.hand.cardValues[i]) {
      return 1
    }
    if (a.hand.cardValues[i] < b.hand.cardValues[i]) {
      return -1
    }
  }

  return 0
})

// Count up winnings since hands are now in order
let totalWinnings = 0
for (const [{ bid }, i] of each(hands)) {
  totalWinnings += bid * (i + 1)
}
console.log(totalWinnings)
