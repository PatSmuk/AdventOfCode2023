import { readInputFileLines } from '../../util'

const PART_NUMBER_PATTERN = /\d+/g
const SEARCH_DIRECTIONS: [number, number][] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 0],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

function parseLine(line: string) {
  const gearCols = []
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '*') {
      gearCols.push(i)
    }
  }

  const partNums = [...line.matchAll(PART_NUMBER_PATTERN)].map((match) => ({
    partNumber: match[0],
    startIndex: match.index!,
  }))

  return { partNums, gearCols }
}

const inputs = readInputFileLines(__dirname, parseLine)

// Create a map from coordinates to the part number at that location (if any)
const partNumLocations = new Map<string, number>()
for (let row = 0; row < inputs.length; row++) {
  for (const { partNumber, startIndex } of inputs[row].partNums) {
    for (let col = startIndex; col < startIndex + partNumber.length; col++) {
      partNumLocations.set(`${row},${col}`, parseInt(partNumber))
    }
  }
}

let sum = 0

// For each gear of each row...
for (let row = 0; row < inputs.length; row++) {
  for (const gearCol of inputs[row].gearCols) {
    const nearbyPartNum = new Set<number>()

    // Search around the gear in every direction for any part numbers
    for (const [dx, dy] of SEARCH_DIRECTIONS) {
      const maybePartNum = partNumLocations.get(`${row + dx},${gearCol + dy}`)

      if (maybePartNum !== undefined) {
        nearbyPartNum.add(maybePartNum)
      }
    }

    // If there are exactly two unique part numbers nearby, they are connected gears
    if (nearbyPartNum.size === 2) {
      const partPair = [...nearbyPartNum]
      sum += partPair[0] * partPair[1]
    }
  }
}

console.log(sum)
