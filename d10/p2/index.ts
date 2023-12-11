import { each, range, readInputFileLines, Coord } from '../../util'
import { Direction, DIRECTION_IN_TO_OUT, DIRECTION_DELTAS } from '../util'

function parseLine(line: string) {
  return line.split('')
}

const rows = readInputFileLines(__dirname, parseLine)

// Find the coordinate of the starting point and build map of coords to pipe data
const startCoord = new Coord(0, 0)
const pipes = new Map<string, (typeof DIRECTION_IN_TO_OUT)['-']>()

for (const [row, i] of each(rows)) {
  for (const [char, j] of each(row)) {
    if (char === 'S') {
      startCoord.x = j
      startCoord.y = i
    }
    const pipe = DIRECTION_IN_TO_OUT[char]
    if (pipe) {
      pipes.set(`${j},${i}`, pipe)
    }
  }
}

// Figure out which way we can go from the starting point
let currentCoord = new Coord(0, 0)
let enteredByGoing: Direction = 'up'

// For each possible direction...
for (const [direction, [dx, dy]] of Object.entries(DIRECTION_DELTAS)) {
  const newCoord = new Coord(startCoord.x + dx, startCoord.y + dy)
  const pipe = pipes.get(newCoord.toString())
  // If there's no pipe or we can't enter from this direction, skip it
  if (!pipe || !pipe[direction]) {
    continue
  }

  currentCoord = newCoord
  enteredByGoing = direction as Direction
  break
}

// Create set of all coordinates in the loop
const coordsInLoop = new Set<string>([startCoord.toString()])

for (;;) {
  // If we've already been here, we've done a complete lap, so stop
  if (coordsInLoop.has(currentCoord.toString())) {
    break
  }
  coordsInLoop.add(currentCoord.toString())

  // Update our direction and position based on it
  const pipe = pipes.get(currentCoord.toString())!
  enteredByGoing = pipe[enteredByGoing]
  const [dx, dy] = DIRECTION_DELTAS[enteredByGoing]
  currentCoord.add(dx, dy)
}

// Now count all the tiles inside of the loop
let insideTilesCount = 0

// For each row...
for (const i of range(0, rows.length)) {
  // Figure out whether chars are inside or outside the loop in this row by
  //   counting how many walls we pass through.
  // If we passed through an even number (0, 2, 4, etc.) then we are outside.
  // If we passed through an odd number (1, 3, 5, etc.) then we are inside.
  // "L..7" and "F..J" count as a wall, but "L..J" and "F..7" do not.
  let wallCount = 0
  let incompleteWallChar: null | 'L' | 'F' = null

  // For each character of the row...
  for (const j of range(0, rows[i].length)) {
    const char = rows[i][j]

    // If it's part of the loop, might affect wall count
    if (coordsInLoop.has(j + ',' + i)) {
      switch (char) {
        case '|': {
          wallCount++
          break
        }
        case 'L': {
          incompleteWallChar = 'L'
          break
        }
        case 'F': {
          incompleteWallChar = 'F'
          break
        }
        case 'J': {
          if (incompleteWallChar === 'F') {
            wallCount++
          }
          break
        }
        case '7': {
          if (incompleteWallChar === 'L') {
            wallCount++
          }
          break
        }
      }
    } else {
      // Otherwise, determine if it's inside the loop and update count
      if (wallCount % 2 === 1) {
        insideTilesCount++
      }
    }
  }
}

console.log(insideTilesCount)
