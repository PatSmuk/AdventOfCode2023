import { readInputFileLines } from '../../util'

const strings = readInputFileLines(__dirname, (line) => line.split(','))[0]

let sum = 0
for (const string of strings) {
  let hash = 0

  for (const char of string) {
    hash += char.charCodeAt(0)
    hash *= 17
    hash %= 256
  }
  sum += hash
}

console.log(sum)
