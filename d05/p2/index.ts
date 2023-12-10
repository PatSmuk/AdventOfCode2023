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

let ranges = [] as [number, number][]
for (let i = 0; i < inputs[0]!.length; i += 2) {
  ranges.push([inputs[0]![i], inputs[0]![i + 1]])
}

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

let currentMap = 'seedToSoil'

for (;;) {
  const mappedRanges = [] as typeof ranges

  // For each map...
  for (const { destStart, sourceStart, length: mapLength } of maps[
    currentMap
  ]) {
    const applyMap = (original: number) => original - sourceStart + destStart
    // Keep track of any left-over bits of ranges that get snipped
    const leftOverRanges = [] as typeof ranges

    // For each range...
    for (const [rangeStart, rangeLength] of ranges) {
      // Determine whether the start and/or end is inside the map's span
      const isStartInMap =
        rangeStart >= sourceStart && rangeStart < sourceStart + mapLength
      const isEndInMap =
        rangeStart + rangeLength - 1 >= sourceStart &&
        rangeStart + rangeLength - 1 < sourceStart + mapLength

      if (isStartInMap && !isEndInMap) {
        // range: ----[XXXXXXX]-----
        //   map: --[XXX]-----------
        const overlapLength = sourceStart + mapLength - rangeStart
        mappedRanges.push([applyMap(rangeStart), overlapLength])
        leftOverRanges.push([
          sourceStart + mapLength,
          rangeLength - overlapLength,
        ])
      } else if (!isStartInMap && isEndInMap) {
        // range: ----[XXXXXXX]-----
        //   map: ----------[XXX]---
        const overlapLength = rangeStart + rangeLength - sourceStart
        mappedRanges.push([applyMap(sourceStart), overlapLength])
        leftOverRanges.push([rangeStart, rangeLength - overlapLength])
      } else if (isStartInMap && isEndInMap) {
        // range: ----[XXX]-----
        //   map: --[XXXXXXX]---
        mappedRanges.push([applyMap(rangeStart), rangeLength])
      } else if (
        sourceStart > rangeStart &&
        sourceStart < rangeStart + rangeLength
      ) {
        // range: ----[XXXXXXX]---
        //   map: ------[XXX]-----
        mappedRanges.push([applyMap(sourceStart), mapLength])
        leftOverRanges.push([rangeStart, sourceStart - rangeStart])
        leftOverRanges.push([
          sourceStart + mapLength,
          rangeStart + rangeLength - (sourceStart + mapLength),
        ])
      } else {
        // range: --------[XXXXXXX]--
        //   map: --[XXX]------------
        leftOverRanges.push([rangeStart, rangeLength])
      }
    }

    ranges = leftOverRanges
  }

  // Add mapped ranges back in for next round
  ranges = [...ranges, ...mappedRanges]

  currentMap = NEXT_MAP_KEY[currentMap]
  if (!currentMap) {
    break
  }
}

let closestLocation = Number.POSITIVE_INFINITY
for (const [start] of ranges) {
  closestLocation = Math.min(start, closestLocation)
}
console.log(closestLocation)
