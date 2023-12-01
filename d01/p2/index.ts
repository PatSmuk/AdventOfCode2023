import { readInputFileLines } from '../../util'

const DIGIT_PATTERN = /([0-9]|one|two|three|four|five|six|seven|eight|nine)/g
const WORD_TO_DIGIT: { [match: string]: string } = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
}

function parseLine(line: string) {
  const tokens = []

  let match: RegExpExecArray | null
  while ((match = DIGIT_PATTERN.exec(line))) {
    tokens.push(match[0])
    // Allow for overlapping tokens e.g. 'twone' -> ['two', 'one']
    DIGIT_PATTERN.lastIndex = match.index + 1
  }
  // Since last `exec` call returned no match, `DIGIT_PATTERN.lastIndex` is 0 again

  return tokens.map((token) => WORD_TO_DIGIT[token] ?? token)
}

const inputs = readInputFileLines(__dirname, parseLine)

let sum = 0
for (const nums of inputs) {
  const completeNum = nums[0] + nums[nums.length - 1]
  sum += parseInt(completeNum)
}

console.log(sum)
