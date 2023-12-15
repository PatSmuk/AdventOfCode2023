import { each, readInputFileLines } from '../../util'

function HASH(str: string): number {
  let hash = 0
  for (const char of str) {
    hash += char.charCodeAt(0)
    hash *= 17
    hash %= 256
  }
  return hash
}

const INSTRUCTION_PATTERN = /([a-z]+)(-|=)([0-9])*/

function parseLine(line: string) {
  return line
    .split(',')
    .map((part) => INSTRUCTION_PATTERN.exec(part)!)
    .map(([_, label, updateOrDelete, focalLength]) => ({
      label,
      updateOrDelete: updateOrDelete as '-' | '=',
      focalLength: focalLength ? parseInt(focalLength) : null,
    }))
}

const instructions = readInputFileLines(__dirname, parseLine)[0]
const boxes = new Array(256)
  .fill('')
  .map((_) => [] as { label: string; focalLength: number }[])

for (const { label, updateOrDelete, focalLength } of instructions) {
  const boxId = HASH(label)
  const index = boxes[boxId].findIndex((item) => item.label === label)

  if (updateOrDelete === '-') {
    if (index >= 0) {
      boxes[boxId].splice(index, 1)
    }
  } else {
    if (index >= 0) {
      boxes[boxId][index].focalLength = focalLength!
    } else {
      boxes[boxId].push({ label, focalLength: focalLength! })
    }
  }
}

let focusingPower = 0
for (const [box, boxId] of each(boxes)) {
  for (const [{ focalLength }, index] of each(box)) {
    focusingPower += (boxId + 1) * (index + 1) * focalLength
  }
}
console.log(focusingPower)
