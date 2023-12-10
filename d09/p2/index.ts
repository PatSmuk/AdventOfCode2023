import { range, readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line.split(' ').map((x) => parseInt(x))
}

const inputs = readInputFileLines(__dirname, parseLine)
let sum = 0

for (const seq of inputs) {
  const stack = [seq]

  // Until the last sequence on the stack is all zeroes...
  while (!stack[stack.length - 1].every((x) => x === 0)) {
    const lastSeq = stack[stack.length - 1]
    const newSeq = []
    for (const i of range(0, lastSeq.length - 1)) {
      newSeq.push(lastSeq[i + 1] - lastSeq[i + 0])
    }
    stack.push(newSeq)
  }

  let delta = 0
  stack.pop()

  // Until the original sequence is the only one left...
  while (stack.length > 1) {
    // Pop the next sequence and calculate the preceding element using the
    // delta from the last sequence
    const lastSeq = stack.pop()!
    delta = lastSeq[0] - delta
  }

  // Now we know the delta for the original sequence's preceding element
  sum += seq[0] - delta
}

console.log(sum)
