import { each, readInputFileLines, Coord } from '../../util'
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

// Initialize the two pipe runners by figuring out where we can go from the start
const runners: {
  currentCoord: Coord
  enteredByGoing: Direction
  currentDistance: number
}[] = []

// For each possible direction...
for (const [direction, [dx, dy]] of Object.entries(DIRECTION_DELTAS)) {
  const newCoord = new Coord(startCoord.x + dx, startCoord.y + dy)
  const pipe = pipes.get(newCoord.toString())
  // If there's no pipe or we can't enter from this direction, skip it
  if (!pipe || !pipe[direction]) {
    continue
  }

  runners.push({
    currentCoord: newCoord,
    enteredByGoing: direction as Direction,
    currentDistance: 1,
  })
}

// Now traverse the loop, noting the distances of each pipe from start
const distances = new Map<string, number>([[startCoord.toString(), 0]])

done: for (;;) {
  for (const runner of runners) {
    const maybeDistance = distances.get(runner.currentCoord.toString())
    // If we already know the distance of this pipe, we're overlapping the
    // other runner, so stop here
    if (maybeDistance !== undefined) {
      console.log(maybeDistance)
      break done
    }
    distances.set(runner.currentCoord.toString(), runner.currentDistance)

    // Update our direction and position based on it
    const pipe = pipes.get(runner.currentCoord.toString())!
    runner.enteredByGoing = pipe[runner.enteredByGoing]
    const [dx, dy] = DIRECTION_DELTAS[runner.enteredByGoing]
    runner.currentCoord.add(dx, dy)

    runner.currentDistance++
  }
}
