import assert from 'assert'
import { each, range, readInputFileLines } from '../../util'

const INSTRUCTION_PATTERN = /(?:R|L|U|D) \d+ \(#([0-9a-f]{5})([0-9a-f]{1})\)/

const DIRECTION_VECTORS = {
  D: [0, +1] as [number, number],
  U: [0, -1] as [number, number],
  R: [+1, 0] as [number, number],
  L: [-1, 0] as [number, number],
}
type Direction = keyof typeof DIRECTION_VECTORS
const DIRECTIONS: Direction[] = ['R', 'D', 'L', 'U']

type ProjDirection = 'U' | 'D' // Can only project vertically
// Maps from directions in and out of a Node to the projection direction
const IN_AND_OUT_TO_PROJECTION: { [pair: string]: ProjDirection } = {
  'U,L': 'U',
  'L,D': 'U',
  'R,U': 'D',
  'D,R': 'D',
}

function getProjectionDirectionForNode(
  inDirection: Direction,
  outDirection: Direction
): ProjDirection | null {
  return IN_AND_OUT_TO_PROJECTION[`${inDirection},${outDirection}`] ?? null
}

interface Node {
  /** X coordinate of the Node */
  x: number
  /** Y coordinate of the Node */
  y: number
  /** If this Node is part of a left-hand turn, this holds the direction to project ('U' or 'D') */
  projectDir: ProjDirection | null
  /** These are the purple arrows in the diagram */
  nextNodeDownward: Node | null
}

// "R 6 (#70c710)" -> ['D', 461937]
function parseLine(line: string) {
  const [_, steps, direction] = INSTRUCTION_PATTERN.exec(line)!
  return [DIRECTIONS[parseInt(direction)], parseInt(steps, 16)] as [
    Direction,
    number
  ]
}

const instructions = readInputFileLines(__dirname, parseLine)
assert(
  instructions[0][0] === 'R' &&
    instructions[instructions.length - 1][0] === 'U',
  'expected starting point to be top-left corner'
)

/*
 * STEP 1 OF DIAGRAM EXPLANATION
 */

let x = 0
let y = 0
// Build list of nodes in the order they appear in the path, starting with (0,0)
const nodes: Node[] = [{ x, y, projectDir: null, nextNodeDownward: null }]
// Also keep track of any horizontal spans for later when we are projecting onto them
const horizontalSpans: [Node, Node, 'R' | 'L'][] = []
// Also start figuring out the total area already because there's also a
//   0.5m wide border around the whole path that we need to include
// Since the loop below skips the last instruction, add it to border here,
//   along with 0.25 for the right-hand turn at (0,0)
let totalArea = 0.25 + instructions[instructions.length - 1][1] / 2

// Ignore last instruction since it just takes us back to the start
for (const [[direction, steps], i] of each(instructions.slice(0, -1))) {
  // Move steps-times in this direction
  const [dx, dy] = DIRECTION_VECTORS[direction]
  x += dx * steps
  y += dy * steps

  // Figure out if the new node will need to project up or down
  const nextDirection = instructions[i + 1][0]
  const projectDir = getProjectionDirectionForNode(direction, nextDirection)

  // Add area of 0.5m-wide border for the steps we just did
  totalArea += steps * 0.5
  // If this is a left-hand turn then remove 0.25m^2 for overlap,
  //   otherwise add 0.25m^2 for the outside of the corner
  totalArea += projectDir ? -0.25 : 0.25

  // Create new node, grab previous one, and add new node to list
  const node: Node = {
    x,
    y,
    projectDir,
    nextNodeDownward: null,
  }
  const previousNode = nodes[nodes.length - 1]
  nodes.push(node)

  // If we moved downward, then link these two for later
  // If we moved left or right, add a span for projections later
  if (direction === 'D') {
    previousNode.nextNodeDownward = node
  } else if (direction === 'R') {
    horizontalSpans.push([previousNode, node, 'R'])
  } else if (direction === 'L') {
    horizontalSpans.push([node, previousNode, 'L'])
  }
}

/*
 * STEP 2 OF DIAGRAM EXPLANATION
 */

// For each node that still needs to project...
let node = nodes.find((n) => n.projectDir)
while (node) {
  const { x, y, projectDir } = node

  let nearestSpan: (typeof horizontalSpans)[0] | null = null

  // Find the nearest horizontal span in the projection direction
  for (const span of horizontalSpans) {
    const [left, right] = span

    // If going up make sure span is above us
    if (projectDir === 'U' && y <= left.y) {
      continue
    }
    // If going down make sure span is below us
    if (projectDir === 'D' && y >= left.y) {
      continue
    }
    // Make sure we fall somewhere inside span
    if (left.x > x || right.x < x) {
      continue
    }

    if (!nearestSpan) {
      nearestSpan = span
    } else {
      // Update nearestSpan if span is nearer
      if (projectDir === 'U' && left.y > nearestSpan[0].y) {
        nearestSpan = span
      }
      if (projectDir === 'D' && left.y < nearestSpan[0].y) {
        nearestSpan = span
      }
    }
  }

  // Should always have a span to project onto now
  assert(nearestSpan)
  const [left, right, spanDirection] = nearestSpan

  // Check if we are exactly aligned with the left or right node
  // If this is the case then we just need to update that node
  if (left.x === x) {
    if (projectDir === 'U') {
      left.nextNodeDownward = node
    } else {
      node.nextNodeDownward = left
    }
  } else if (right.x === x) {
    if (projectDir === 'U') {
      right.nextNodeDownward = node
    } else {
      node.nextNodeDownward = right
    }
  } else {
    // Not aligned with either left or right, so need to create
    // a new node in the middle and split the span into two spans

    // Remove the old span
    const spanIndex = horizontalSpans.indexOf(nearestSpan)
    horizontalSpans.splice(spanIndex, 1)

    // Create new node with X aligned with projecting node
    // and Y aligned with span
    const newNode: Node = {
      x,
      y: left.y,
      projectDir: null,
      nextNodeDownward: null,
    }
    // Connect new node up to projecting node in right direction
    if (projectDir === 'U') {
      newNode.nextNodeDownward = node
    } else {
      node.nextNodeDownward = newNode
    }

    // Insert new node into list of nodes before the one that appears second
    nodes.splice(
      nodes.indexOf(spanDirection === 'R' ? right : left),
      0,
      newNode
    )

    // Add the new spans to list of spans
    horizontalSpans.push([left, newNode, spanDirection])
    horizontalSpans.push([newNode, right, spanDirection])
  }

  // Don't need to project this node any more,
  //   find next one that needs projecting (if any)
  node.projectDir = null
  node = nodes.find((n) => n.projectDir)
}

/*
 * STEP 3 OF DIAGRAM EXPLANATION
 */

// Starting with Node A = (0,0)...
let index = 0
do {
  const nodeA = nodes[index]

  // Find Node B by going to the next node, then traversing downward until
  //   we hit the bottom
  let nodeB = nodes[index + 1]
  while (nodeB.nextNodeDownward) {
    nodeB = nodeB.nextNodeDownward
  }
  // Should always be able to go downward
  assert(nodeB.y !== nodeA.y)

  // Add the area between Node A and Node B
  totalArea += Math.abs(nodeA.x - nodeB.x) * Math.abs(nodeA.y - nodeB.y)
  // Safety check since JS can only do 52-bit integers without precision loss
  assert(totalArea < Number.MAX_SAFE_INTEGER)

  // Traverse the path looking for the next Node A;
  //   it must have path leading out to the right,
  //   i.e. next node is same Y coord, and greater X coord
  do {
    index = (index + 1) % nodes.length // wrap around to (0,0) again
  } while (
    nodes[index].y !== nodes[(index + 1) % nodes.length].y ||
    nodes[index].x > nodes[(index + 1) % nodes.length].x
  )
} while (index !== 0) // Stop when we are back to node (0,0)

console.log(totalArea)
