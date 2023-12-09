import { range, readInputFileLines } from '../../util'

function parseLine(line: string) {
  return parseInt(
    line
      .split(' ')
      .slice(1)
      .filter((x) => x !== '')
      .join('')
  )
}

const [raceTime, record] = readInputFileLines(__dirname, parseLine)
console.log(raceTime, record)

for (const chargeTime of range(1, raceTime)) {
  const distance = chargeTime * (raceTime - chargeTime)
  if (distance > record) {
    console.log(raceTime - chargeTime * 2 + 1)
    break
  }
}
