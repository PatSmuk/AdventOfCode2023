import { each, range, readInputFileLines } from '../../util'

function parseLine(line: string, i: number) {
  if (i === 0) {
    return line
      .split(' ')
      .slice(1)
      .map((x) => parseInt(x))
  }
  if (line.charCodeAt(0) >= 0x30 && line.charCodeAt(0) <= 0x39) {
    return line.split(' ').map((x) => parseInt(x))
  }
  return null
}

interface MapEntry {
  destStart: number
  sourceStart: number
  length: number
}

const NEXT_MAP_KEY: { [currentKey: string]: string } = {
  seedToSoil: 'soilToFertilizer',
  soilToFertilizer: 'fertilizerToWater',
  fertilizerToWater: 'waterToLight',
  waterToLight: 'lightToTemperature',
  lightToTemperature: 'temperatureToHumidity',
  temperatureToHumidity: 'humidityToLocation',
}

const inputs = readInputFileLines(__dirname, parseLine)
const seeds = inputs[0]!
const maps: { [type: string]: MapEntry[] } = {
  seedToSoil: [],
  soilToFertilizer: [],
  fertilizerToWater: [],
  waterToLight: [],
  lightToTemperature: [],
  temperatureToHumidity: [],
  humidityToLocation: [],
}
// Build maps
{
  let currentMap = 'seedToSoil'
  let offset = 3
  for (;;) {
    const [destStart, sourceStart, length] = inputs[offset]!
    maps[currentMap].push({ destStart, sourceStart, length })
    offset++

    if (inputs[offset] == null) {
      currentMap = NEXT_MAP_KEY[currentMap]
      if (!currentMap) {
        break
      }
      while (inputs[offset] == null) {
        offset++
      }
    }
  }
}

let closestLocation = Number.POSITIVE_INFINITY

for (const seed of seeds) {
  let currentMap = 'seedToSoil'
  let currentId = seed

  for (;;) {
    for (const { destStart, sourceStart, length } of maps[currentMap]) {
      // If in bounds of the map, apply the map
      if (sourceStart <= currentId && currentId < sourceStart + length) {
        currentId = currentId - sourceStart + destStart
        break
      }
    }

    currentMap = NEXT_MAP_KEY[currentMap]
    if (!currentMap) {
      closestLocation = Math.min(closestLocation, currentId)
      break
    }
  }
}

console.log(closestLocation)
