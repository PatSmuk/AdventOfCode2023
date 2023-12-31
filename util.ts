import assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'

export function primeFactors(n: number) {
  const factors = []
  let divisor = 2

  while (n >= 2) {
    if (n % divisor == 0) {
      factors.push(divisor)
      n = n / divisor
    } else {
      divisor++
    }
  }

  return factors
}

export function* range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i
  }
}

export function* each<T>(iterable: Iterable<T>): Generator<[T, number]> {
  let i = 0
  for (const item of iterable) {
    yield [item, i]
    i++
  }
}

export function readInputFileLines<T>(
  dirname: string,
  parser: (line: string, i: number) => T
): T[] {
  const data = fs
    .readFileSync(path.join(dirname, '..', 'input.txt'), { encoding: 'utf8' })
    .split('\n')

  return data.map(parser)
}

/** Increments the value associated with `key` in `map` by `value`. */
export function mapInc<K>(map: Map<K, number>, key: K, value: number) {
  map.set(key, (map.get(key) ?? 0) + value)
}

export interface AStarParams<K> {
  /** The node to start on. */
  start: K
  /** The node that we want to find the optimal path to. */
  isEnd: (key: K) => boolean
  /** A function that returns an estimate of the distance from `key` to the target node. */
  getDistance: (key: K) => number
  /** A function that returns the weighting of `key`. */
  getWeight: (key: K) => number
  /** A function that returns the neighbours of `key`. */
  getNeighbours: (key: K) => K[]
}

/** Generic implementation of A* search algorithm over a graph of nodes identified by values of type `K`. */
export function aStarSearch<K>({
  start,
  isEnd,
  getDistance,
  getWeight,
  getNeighbours,
}: AStarParams<K>): K[] {
  let openSet: K[] = [start]
  const cameFrom = new Map<K, K>()
  const gScores = new Map<K, number>([[start, getWeight(start)]])
  const fScores = new Map([[start, getDistance(start)]])

  // While there are more nodes to visit...
  while (openSet.length > 0) {
    // Get element from openSet with lowest risk and closest distance.
    let minFScore = fScores.get(openSet[0])!
    let currentIndex = 0
    for (let i = 1; i < openSet.length; i++) {
      const score = fScores.get(openSet[i])!
      if (score < minFScore) {
        minFScore = score
        currentIndex = i
      }
    }

    // Remove current from the open set.
    let current = openSet.splice(currentIndex, 1)[0]

    // If we made it to the end...
    if (isEnd(current)) {
      const totalPath = [current]

      while (cameFrom.has(current)) {
        current = cameFrom.get(current)!
        totalPath.unshift(current)
      }

      return totalPath
    }

    const gScore = gScores.get(current)!
    for (const neighbour of getNeighbours(current)) {
      // Calculate what our risk would be if we were to visit neighbour from this node.
      const tentGScore = gScore + getWeight(neighbour)

      // If no one has visited neighbour yet or we have the lowest risk path...
      const neighbourGScore = gScores.get(neighbour)
      if (neighbourGScore === undefined || tentGScore < neighbourGScore) {
        // Set best path to neighbour to be from this node.
        cameFrom.set(neighbour, current)

        // Update neighbours risk and score.
        gScores.set(neighbour, tentGScore)
        fScores.set(neighbour, tentGScore + getDistance(neighbour))

        // If the neighbour is not in the set of nodes to visit, add it.
        if (!openSet.includes(neighbour)) {
          openSet.push(neighbour)
        }
      }
    }
  }

  return []
}

export class Coord {
  x: number
  y: number

  constructor(str: string)
  constructor(x: number, y: number)
  constructor(xOrString: number | string, y?: number) {
    if (typeof xOrString === 'number') {
      assert(typeof y === 'number')
      this.x = xOrString
      this.y = y
    } else {
      assert(typeof xOrString === 'string')
      const [l, r] = xOrString.split(',')
      this.x = parseInt(l)
      this.y = parseInt(r)
      assert(!isNaN(this.x))
      assert(!isNaN(this.y))
    }
  }

  toString(): string {
    return `${this.x},${this.y}`
  }

  add(coord: Coord): void
  add(dx: number, dy: number): void
  add(coordOrDx: Coord | number, dy?: number): void {
    if (typeof coordOrDx === 'number') {
      assert(typeof dy === 'number')
      this.x += coordOrDx
      this.y += dy
    } else {
      this.x += coordOrDx.x
      this.y += coordOrDx.y
    }
  }
}
