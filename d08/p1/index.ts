import { each, range, readInputFileLines } from '../../util'

const NODE_PATTERN = /([A-Z]{3}) = \(([A-Z]{3}), ([A-Z]{3})\)/

interface Node {
  id: string
  left: Node
  right: Node
}

/* Input is of the form:
 *
 * LLR
 *
 * AAA = (BBB, BBB)
 * BBB = (AAA, ZZZ)
 * ZZZ = (ZZZ, ZZZ)
 *
 * So parse this into [['L', 'L', 'R'], null, { id: 'AAA', left: 'BBB', right: 'BBB'}, ...etc]
 */
function parseLine(line: string, n: number) {
  if (n === 0) {
    return line.split('') as ('L' | 'R')[]
  }
  if (n === 1) {
    return null
  }
  const match = NODE_PATTERN.exec(line)!
  return { id: match[1], left: match[2], right: match[3] }
}

const inputs = readInputFileLines(__dirname, parseLine)
const directions = inputs[0] as ('L' | 'R')[]
const unconnectedNodes = inputs.slice(2) as {
  id: string
  left: string
  right: string
}[]

// Create nodes and hook them up to each other
const nodeById = new Map<string, Node>()
for (const { id } of unconnectedNodes) {
  nodeById.set(id, { id } as Node)
}
for (const { id, left, right } of unconnectedNodes) {
  const node = nodeById.get(id)!
  node.left = nodeById.get(left)!
  node.right = nodeById.get(right)!
}

// Now tranverse the graph from node "AAA" to "ZZZ"
let directionIndex = 0
let currentNode = nodeById.get('AAA')!
let steps = 0

for (;;) {
  if (directions[directionIndex] === 'L') {
    currentNode = currentNode.left
  } else {
    currentNode = currentNode.right
  }
  steps++

  if (currentNode.id === 'ZZZ') {
    console.log(steps)
    break
  }

  // Update direction index, wrapping around
  directionIndex++
  directionIndex %= directions.length
}
