import { each, range, readInputFileLines } from '../../util'

const EXPANSION_FACTOR = 1_000_000

function parseLine(line: string) {
  return line
}

const inputs = readInputFileLines(__dirname, parseLine)

// Calculate how far off each Y coordinate is after expansion
const yOffsets: number[] = []
let offset = 0

for (const row of inputs) {
  if (row.split('').every((char) => char === '.')) {
    offset += EXPANSION_FACTOR - 1 // adjust for the empty row still existing
  }
  yOffsets.push(offset)
}

// Calculate how far off each X coordinate is after expansion
const xOffsets: number[] = []
offset = 0

for (const x of range(0, inputs[0].length)) {
  if (inputs.every((row) => row[x] === '.')) {
    offset += EXPANSION_FACTOR - 1 // adjust for the empty column still existing
  }
  xOffsets.push(offset)
}

// Sum distances between galaxies, after adjusting coordinates for expansion
let distanceSum = 0
const prevGalaxies: [number, number][] = []

for (const [row, y] of each(inputs)) {
  const y1 = y + yOffsets[y]

  for (const [char, x] of each(row)) {
    const x1 = x + xOffsets[x]

    if (char !== '.') {
      for (const [x2, y2] of prevGalaxies) {
        distanceSum += Math.abs(y2 - y1) + Math.abs(x2 - x1)
      }
      prevGalaxies.push([x1, y1])
    }
  }
}

console.log(distanceSum)
