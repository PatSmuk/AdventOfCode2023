import { each, range, readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line
}

const inputs = readInputFileLines(__dirname, parseLine)

// Expand rows by doubling any that are empty
const expandedRows = []
for (const row of inputs) {
  expandedRows.push(row)
  if (row.split('').every((char) => char === '.')) {
    expandedRows.push(row)
  }
}

// Figure out which columns are empty
const emptyColumns = new Set<number>()
nextColumn: for (const i of range(0, expandedRows[0].length)) {
  for (const row of inputs) {
    if (row[i] !== '.') {
      continue nextColumn
    }
  }
  emptyColumns.add(i)
}

// Now for each row, double any elements whose column is in empty columns
const expandedSpace = []
for (const row of expandedRows) {
  expandedSpace.push(
    row
      .split('')
      .flatMap((char, i) => (emptyColumns.has(i) ? ['.', '.'] : char))
  )
}

// Sum distances between galaxies
let distanceSum = 0
const prevGalaxies: [number, number][] = []

for (const [row, y1] of each(expandedSpace)) {
  for (const [char, x1] of each(row)) {
    if (char !== '.') {
      for (const [x2, y2] of prevGalaxies) {
        distanceSum += Math.abs(y2 - y1) + Math.abs(x2 - x1)
      }
      prevGalaxies.push([x1, y1])
    }
  }
}

console.log(distanceSum)
