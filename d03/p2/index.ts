import { range, readInputFileLines } from '../../util'

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
    partNum: match[0],
    startIndex: match.index!,
  }))

  return { partNums, gearCols }
}

const inputs = readInputFileLines(__dirname, parseLine)

// Create a map from coordinates to the part number at that location (if any)
const partNumLocations = new Map<string, number>()
for (const row of range(0, inputs.length)) {
  for (const { partNum, startIndex } of inputs[row].partNums) {
    for (const col of range(startIndex, startIndex + partNum.length)) {
      partNumLocations.set(`${row},${col}`, parseInt(partNum))
    }
  }
}

let sum = 0

// For each gear of each row...
for (const row of range(0, inputs.length)) {
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
