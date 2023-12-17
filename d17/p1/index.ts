import { aStarSearch, range, readInputFileLines } from '../../util'

const MAX_FORWARD_STEPS = 3

const DIRECTION_VECTORS = {
  d: [0, +1] as [number, number],
  u: [0, -1] as [number, number],
  r: [+1, 0] as [number, number],
  l: [-1, 0] as [number, number],
}
type Direction = keyof typeof DIRECTION_VECTORS

type Position = [
  /*x*/ number,
  /*y*/ number,
  /*prevDirection*/ Direction,
  /*forwardCounter*/ number
]

function posToKey(position: Position): string {
  return position.join('/')
}

function keyToPos(key: string): Position {
  const [x, y, prevDirection, forwardCounter] = key.split('/')
  return [
    parseInt(x),
    parseInt(y),
    prevDirection as Direction,
    parseInt(forwardCounter),
  ]
}

function parseLine(line: string) {
  return line.split('').map((x) => parseInt(x))
}

const heatLosses = readInputFileLines(__dirname, parseLine)
const maxY = heatLosses.length - 1
const maxX = heatLosses[0].length - 1

// Compute path with least heat loss using A* search
const path = aStarSearch({
  start: posToKey([0, 0, 'd', 0]),

  isEnd: (key) => {
    const [x, y] = keyToPos(key)
    return x === maxX && y === maxY
  },
  getDistance: (key) => {
    const [x, y] = keyToPos(key)
    return maxX - x + maxY - y
  },
  getWeight: (key) => {
    const [x, y] = keyToPos(key)
    return heatLosses[y][x]
  },
  getNeighbours: (key) => {
    const [x, y, prevDirection, forwardCounter] = keyToPos(key)
    // Start point is a special case; can go right or down without penalty
    if (x === 0 && y === 0) {
      return [posToKey([1, 0, 'r', 1]), posToKey([0, 1, 'd', 1])]
    }

    const neighbours: string[] = []

    // Can always turn right or left (with bounds check)
    if (prevDirection === 'u' || prevDirection === 'd') {
      if (x > 0) {
        neighbours.push(posToKey([x - 1, y, 'l', 1]))
      }
      if (x < maxX) {
        neighbours.push(posToKey([x + 1, y, 'r', 1]))
      }
    } else {
      if (y > 0) {
        neighbours.push(posToKey([x, y - 1, 'u', 1]))
      }
      if (y < maxY) {
        neighbours.push(posToKey([x, y + 1, 'd', 1]))
      }
    }

    // Can only go forward if we haven't hit MAX_FORWARD_STEPS
    if (forwardCounter < MAX_FORWARD_STEPS) {
      const [dx, dy] = DIRECTION_VECTORS[prevDirection]
      const x2 = x + dx
      const y2 = y + dy
      if (x2 >= 0 && x2 <= maxX && y2 >= 0 && y2 <= maxY) {
        neighbours.push(posToKey([x2, y2, prevDirection, forwardCounter + 1]))
      }
    }

    return neighbours
  },
})

const DIRECTION_TO_PATH_CHAR = {
  l: '<',
  r: '>',
  u: '^',
  d: 'v',
}

// Calculate total heat loss along the path and the chars to represent the path
let totalHeatLoss = 0
const pathChars = new Map<string, string>()
for (const key of path.slice(1)) {
  const [x, y, prevDirection] = keyToPos(key)
  totalHeatLoss += heatLosses[y][x]
  pathChars.set(`${x},${y}`, DIRECTION_TO_PATH_CHAR[prevDirection])
}

// Print the path
for (const y of range(0, maxY + 1)) {
  let line = ''
  for (const x of range(0, maxX + 1)) {
    const char = pathChars.get(`${x},${y}`)
    line += char ? char : '.'
  }
  console.log(line)
}

console.log('\n' + totalHeatLoss)
