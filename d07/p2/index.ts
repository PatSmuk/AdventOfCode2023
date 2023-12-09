import { each, range, readInputFileLines, mapInc } from '../../util'
import { HandKind, CARD_VALUE } from '../util'

const CARD_VALUE_JOKER: { [card: string]: number } = { ...CARD_VALUE, J: 0 }

function parseLine(line: string) {
  const [handString, bidString] = line.split(' ')
  const bid = parseInt(bidString)

  // Count up how many of each card there are in the hand
  const cardCounts = new Map<string, number>()
  // Also figure out the value of each card in original order
  const cardValues: number[] = []
  // Count jokers separate from other cards
  let jokers = 0

  for (const card of handString.split('')) {
    if (card === 'J') {
      jokers++
    } else {
      mapInc(cardCounts, card, 1)
    }
    cardValues.push(CARD_VALUE_JOKER[card]!)
  }

  // Now sort the card counts and get the first-most and second-most count
  let [first, second] = [...cardCounts.values()].sort((a, b) => b - a)
  // Possible for first and second to be undefined so set to 0 if they are
  first ??= 0
  second ??= 0

  const firstPlusJokers = first + jokers
  let kind = HandKind.HIGH_CARD

  if (firstPlusJokers === 5) {
    kind = HandKind.FIVE_OF_A_KIND
  } else if (firstPlusJokers === 4) {
    kind = HandKind.FOUR_OF_A_KIND
  } else if (firstPlusJokers === 3) {
    // Remove any jokers used to make the triplet
    jokers -= 3 - first

    if (second + jokers === 2) {
      kind = HandKind.FULL_HOUSE
    } else {
      kind = HandKind.THREE_OF_A_KIND
    }
  } else if (firstPlusJokers === 2) {
    // Remove any jokers used to make the pair
    jokers -= 2 - first

    if (second + jokers === 2) {
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
