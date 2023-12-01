import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line
    .split('')
    .filter((char) => char.charCodeAt(0) >= 0x30 && char.charCodeAt(0) <= 0x39)
}

const inputs = readInputFileLines(__dirname, parseLine)

let sum = 0
for (const nums of inputs) {
  const completeNum = nums[0] + nums[nums.length - 1]
  sum += parseInt(completeNum)
}

console.log(sum)
