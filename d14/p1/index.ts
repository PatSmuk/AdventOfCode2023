import { each, readInputFileLines } from '../../util'

const MOVING_ROCK = 'O'
const EMPTY_SPACE = '.'

function parseLine(line: string) {
  return line.split('')
}

const grid = readInputFileLines(__dirname, parseLine)

for (let y = 1; y < grid.length; y++) {
  const row = grid[y]

  // For each character of the row...
  for (const [char, x] of each(row)) {
    if (char !== MOVING_ROCK) {
      continue
    }

    // Go up until we hit another rock
    let y2 = y
    while (y2 - 1 >= 0) {
      if (grid[y2 - 1][x] !== EMPTY_SPACE) {
        break
      }
      y2--
    }
    // If we were able to move at all, update the grid
    if (y2 !== y) {
      grid[y2][x] = char
      grid[y][x] = EMPTY_SPACE
    }
  }
}

let totalLoad = 0
for (const [row, y] of each(grid)) {
  const load = grid.length - y

  for (const char of row) {
    if (char === MOVING_ROCK) {
      totalLoad += load
    }
  }
}
console.log(totalLoad)
