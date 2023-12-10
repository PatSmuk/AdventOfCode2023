import { readInputFileLines, primeFactors } from '../../util'

const NODE_PATTERN = /([A-Z0-9]{3}) = \(([A-Z0-9]{3}), ([A-Z0-9]{3})\)/

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
const startingNodes: Node[] = []
for (const { id, left, right } of unconnectedNodes) {
  const node = nodeById.get(id)!
  node.left = nodeById.get(left)!
  node.right = nodeById.get(right)!

  if (id.endsWith('A')) {
    startingNodes.push(node)
  }
}

const factorSet = new Set<number>()

for (const node of startingNodes) {
  let directionIndex = 0
  let steps = 0
  let currentNode = node

  for (;;) {
    if (directions[directionIndex] === 'L') {
      currentNode = currentNode.left
    } else {
      currentNode = currentNode.right
    }
    steps++

    if (currentNode.id.endsWith('Z')) {
      for (const factor of primeFactors(steps)) {
        factorSet.add(factor)
      }
      break
    }

    // Update direction index, wrapping around
    directionIndex++
    directionIndex %= directions.length
  }
}

console.log([...factorSet].reduce((prev, curr) => prev * curr, 1))
