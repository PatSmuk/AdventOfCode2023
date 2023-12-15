import { each, readInputFileLines } from '../../util'

const MOVING_ROCK = 'O'
const EMPTY_SPACE = '.'
const NUM_CYCLES = 1_000_000_000

function parseLine(line: string) {
  return line.split('')
}

const grid = readInputFileLines(__dirname, parseLine)
const maxY = grid.length - 1
const maxX = grid[0].length - 1
const previousGrids = new Map<string, number>()

function gridToString(grid: string[][]): string {
  return grid.map((row) => row.join('')).join('\n')
}

function findEmptySpace(x: number, y: number, dx: number, dy: number): number {
  // Bounds check on x and y
  while (y + dy >= 0 && x + dx >= 0 && y + dy <= maxY && x + dx <= maxX) {
    // Check for rock hit
    if (grid[y + dy][x + dx] !== EMPTY_SPACE) {
      break
    }
    x += dx
    y += dy
  }

  // Return whichever coordinate actually changed
  return dx !== 0 ? x : y
}

// Only do the skip once
let checkForSkip = true

for (let cycle = 0; cycle < NUM_CYCLES; cycle++) {
  // Slide north
  for (let y = 1; y <= maxY; y++) {
    const row = grid[y]

    // For each character of the row...
    for (const [char, x] of each(row)) {
      if (char !== MOVING_ROCK) {
        continue
      }

      const y2 = findEmptySpace(x, y, 0, -1)
      // If we were able to move at all, update the grid
      if (y2 !== y) {
        grid[y2][x] = char
        grid[y][x] = EMPTY_SPACE
      }
    }
  }

  // Slide west
  for (let x = 1; x <= maxX; x++) {
    // For each character of the column...
    for (let y = 0; y <= maxY; y++) {
      const char = grid[y][x]
      if (char !== MOVING_ROCK) {
        continue
      }

      const x2 = findEmptySpace(x, y, -1, 0)
      if (x2 !== x) {
        grid[y][x2] = char
        grid[y][x] = EMPTY_SPACE
      }
    }
  }

  // Slide south
  for (let y = maxY - 1; y >= 0; y--) {
    const row = grid[y]

    // For each character of the row...
    for (const [char, x] of each(row)) {
      if (char !== MOVING_ROCK) {
        continue
      }

      const y2 = findEmptySpace(x, y, 0, +1)
      if (y2 !== y) {
        grid[y2][x] = char
        grid[y][x] = EMPTY_SPACE
      }
    }
  }

  // Slide east
  for (let x = maxX - 1; x >= 0; x--) {
    // For each character of the column...
    for (let y = 0; y <= maxY; y++) {
      const char = grid[y][x]
      if (char !== MOVING_ROCK) {
        continue
      }

      const x2 = findEmptySpace(x, y, +1, 0)
      if (x2 !== x) {
        grid[y][x2] = char
        grid[y][x] = EMPTY_SPACE
      }
    }
  }

  // If we haven't done the skip yet...
  if (checkForSkip) {
    const gridString = gridToString(grid)
    const lastSeenCycle = previousGrids.get(gridString)

    // If we've been in this position before...
    if (lastSeenCycle !== undefined) {
      // Calculate the cycle difference and skip ahead until we are close to the end
      const diff = cycle - lastSeenCycle
      while (cycle + diff < NUM_CYCLES) {
        cycle += diff
      }

      // Don't bother checking for skip again
      checkForSkip = false
    } else {
      previousGrids.set(gridString, cycle)
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
