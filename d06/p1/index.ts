import { each, range, readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line
    .split(' ')
    .slice(1)
    .filter((x) => x !== '')
    .map((x) => parseInt(x))
}

const [raceTimes, records] = readInputFileLines(__dirname, parseLine)

const waysToWin = []
for (const [raceTime, i] of each(raceTimes)) {
  const record = records[i]

  for (const chargeTime of range(1, raceTime)) {
    const distance = chargeTime * (raceTime - chargeTime)
    if (distance > record) {
      waysToWin.push(raceTime - chargeTime * 2 + 1)
      break
    }
  }
}

console.log(waysToWin.reduce((prev, curr) => prev * curr, 1))
