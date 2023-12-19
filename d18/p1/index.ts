import { each, range, readInputFileLines } from '../../util'

const INSTRUCTION_PATTERN = /(R|L|U|D) (\d+) \(#([0-9a-f]{6})\)/

const DIRECTION_VECTORS = {
  D: [0, +1] as [number, number],
  U: [0, -1] as [number, number],
  R: [+1, 0] as [number, number],
  L: [-1, 0] as [number, number],
}
type Direction = keyof typeof DIRECTION_VECTORS

// "R 6 (#70c710)" -> ['R', 6, '70c710']
function parseLine(line: string) {
  const [_, direction, steps, colour] = INSTRUCTION_PATTERN.exec(line)!
  return [direction, parseInt(steps), colour] as [Direction, number, string]
}

const instructions = readInputFileLines(__dirname, parseLine)

const dugCoords = new Set<string>(['0,0'])
let x = 0
let y = 0
let minX = x
let minY = y
let maxX = x
let maxY = y

// Follow the path, keeping track of all the coords we dug and the
//   bounds of the digging area
for (const [direction, steps] of instructions) {
  const [dx, dy] = DIRECTION_VECTORS[direction]

  for (const _ of range(0, steps)) {
    x += dx
    y += dy

    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)

    dugCoords.add(`${x},${y}`)
  }
}

// Now do a flood fill from just outside the top-left corner, to find out
//   all the coordinates that are on the outside
const exteriorCoords = new Set<string>([`${minX - 1},${minY - 1}`])
const frontier: [number, number][] = [[minX - 1, minY - 1]]

// While there are still squares to visit...
while (frontier.length > 0) {
  const [x, y] = frontier.shift()!

  // Check each direction
  for (const [dx, dy] of Object.values(DIRECTION_VECTORS)) {
    const x2 = x + dx
    const y2 = y + dy
    // Bounds check
    if (x2 < minX - 1 || x2 > maxX + 1 || y2 < minY - 1 || y2 > maxY + 1) {
      continue
    }
    const key = `${x2},${y2}`
    // If we've been here before or it was dug out, skip it
    if (exteriorCoords.has(key) || dugCoords.has(key)) {
      continue
    }
    exteriorCoords.add(key)
    frontier.push([x2, y2])
  }
}

// Now just add up all the squares within bounds that are not external
let dugSquaresSum = 0
for (const y of range(minY, maxY + 1)) {
  let line = ''
  for (const x of range(minX, maxX + 1)) {
    const isDug = !exteriorCoords.has(`${x},${y}`)
    line += isDug ? (dugCoords.has(`${x},${y}`) ? '#' : 'x') : '.'
    dugSquaresSum += isDug ? 1 : 0
  }
  console.log(line)
}
console.log('\n' + dugSquaresSum)
