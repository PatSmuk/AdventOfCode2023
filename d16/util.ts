export type Tile = '.' | '-' | '|' | '/' | '\\'
export type Direction = 'r' | 'l' | 'u' | 'd'

const IN_DIRECTION_TO_OUT_DIRECTIONS: {
  [tile: string]: { [direction: string]: Direction[] }
} = {
  '.': {
    r: ['r'],
    l: ['l'],
    u: ['u'],
    d: ['d'],
  },
  '-': {
    r: ['r'],
    l: ['l'],
    u: ['r', 'l'],
    d: ['r', 'l'],
  },
  '|': {
    r: ['u', 'd'],
    l: ['u', 'd'],
    u: ['u'],
    d: ['d'],
  },
  '/': {
    r: ['u'],
    l: ['d'],
    u: ['r'],
    d: ['l'],
  },
  '\\': {
    r: ['d'],
    l: ['u'],
    u: ['l'],
    d: ['r'],
  },
}
const DIRECTION_VECTORS = {
  r: [+1, 0],
  l: [-1, 0],
  d: [0, +1],
  u: [0, -1],
}

export function findTotalEnergizedTiles(
  grid: Map<string, Tile>,
  startX: number,
  startY: number,
  startDirection: Direction
): number {
  const beamQueue: [/*x*/ number, /*y*/ number, Direction][] = [
    [startX, startY, startDirection],
  ]
  const visitedTiles = new Set<string>()

  while (beamQueue.length > 0) {
    let [x, y, direction] = beamQueue.shift()!

    for (;;) {
      // Check for beam out of bounds
      const tile = grid.get(`${x},${y}`)
      if (!tile) {
        break
      }

      // Check if we've already passed through this tile in this direction before
      const visitedKey = `${x},${y}/${direction}`
      if (visitedTiles.has(visitedKey)) {
        break
      }
      visitedTiles.add(visitedKey)

      const [newDirection, otherDirection] =
        IN_DIRECTION_TO_OUT_DIRECTIONS[tile][direction]

      // Is the beam being split?
      if (otherDirection !== undefined) {
        const [dx, dy] = DIRECTION_VECTORS[otherDirection]
        // Only add to the queue if we haven't already been there
        if (!visitedTiles.has(`${x + dx},${y + dy}/${otherDirection}`)) {
          beamQueue.push([x + dx, y + dy, otherDirection])
        }
      }

      // Update our direction and position
      const [dx, dy] = DIRECTION_VECTORS[newDirection]
      direction = newDirection
      x += dx
      y += dy
    }
  }

  const energizedTiles = new Set<string>()
  for (const coordsAndDirection of visitedTiles) {
    const coords = coordsAndDirection.split('/')[0]
    energizedTiles.add(coords)
  }
  return energizedTiles.size
}
