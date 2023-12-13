import { range, readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line
}

const inputs = readInputFileLines(__dirname, parseLine)

// Split the input lines into a series of grids
const grids = []
let grid = []
for (const line of inputs) {
  if (line !== '') {
    grid.push(line)
  } else {
    grids.push(grid)
    grid = []
  }
}
grids.push(grid)

let sum = 0

// For each grid...
nextGrid: for (const grid of grids) {
  // Check whether there is a horizontal line of reflection
  for (const y of range(0, grid.length - 1)) {
    // Keep track of how many differences there are from a perfect reflection
    let differences = 0

    // y = 0 -> linesToCheck = 1
    // y = 1 -> linesToCheck = 2
    // ...
    // y = (grid.length - 3) -> linesToCheck = 2
    // y = (grid.length - 2) -> linesToCheck = 1
    const linesToCheck = Math.min(y + 1, grid.length - y - 1)

    for (const y2 of range(0, linesToCheck)) {
      // For each character that is off, add 1 to differences
      for (const x of range(0, grid[0].length)) {
        if (grid[y - y2][x] !== grid[y + y2 + 1][x]) {
          differences++
        }
      }
    }

    // If there is exactly 1 difference, this is a reflection after correcting it
    if (differences === 1) {
      sum += 100 * (y + 1)
      continue nextGrid
    }
  }

  // Check whether there is a vertical line of reflection
  for (const x of range(0, grid[0].length - 1)) {
    let differences = 0

    // Same as above
    const columnsToCheck = Math.min(x + 1, grid[0].length - x - 1)

    for (const x2 of range(0, columnsToCheck)) {
      for (const y of range(0, grid.length)) {
        if (grid[y][x - x2] !== grid[y][x + x2 + 1]) {
          differences++
        }
      }
    }

    if (differences === 1) {
      sum += x + 1
    }
  }
}

console.log(sum)
