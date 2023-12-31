import { each, range, readInputFileLines } from '../../util'

const PART_NUMBER_PATTERN = /\d+/g
const SYMBOL_PATTERN = /[^0-9.]/g

function parseLine(line: string) {
  const symbolCols = []
  for (const [char, i] of each(line)) {
    if (SYMBOL_PATTERN.test(char)) {
      symbolCols.push(i)
    }
  }

  const partNums = [...line.matchAll(PART_NUMBER_PATTERN)].map((match) => ({
    partNumber: match[0],
    startIndex: match.index!,
  }))

  return { partNums, symbolCols }
}

const inputs = readInputFileLines(__dirname, parseLine)

// Create a set with the coordinates of all symbols
const symbolCoords = new Set<string>()
for (const row of range(0, inputs.length)) {
  for (const col of inputs[row].symbolCols) {
    symbolCoords.add(`${row},${col}`)
  }
}

let sum = 0

// For each part number of each row...
for (const row of range(0, inputs.length)) {
  nextPartNumber: for (const { partNumber, startIndex } of inputs[row]
    .partNums) {
    // Go through all the columns the part number occupies (plus the column before and after)
    for (const col of range(
      startIndex - 1,
      startIndex + partNumber.length + 1
    )) {
      // Check for a symbol above, below, and on this row
      if (
        symbolCoords.has(`${row - 1},${col}`) ||
        symbolCoords.has(`${row + 0},${col}`) ||
        symbolCoords.has(`${row + 1},${col}`)
      ) {
        sum += parseInt(partNumber)
        continue nextPartNumber
      }
    }
  }
}

console.log(sum)
