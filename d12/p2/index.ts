import { readInputFileLines } from '../../util'

// Parse ".???##?.?.##? 4,3" into { springs: ".???##?.?.##?", groups: [4, 3] }
function parseLine(line: string) {
  const [springs, groups] = line.split(' ')
  return { springs, groups: groups.split(',').map((x) => parseInt(x)) }
}

const inputs = readInputFileLines(__dirname, parseLine)
const positionsCache = new Map<string, number>()

console.log(
  inputs.reduce((prev, { springs, groups }) => {
    const unfoldedSprings = `${springs}?${springs}?${springs}?${springs}?${springs}`
    const unfoldedGroups = [groups, groups, groups, groups, groups].flat()

    return prev + findAllPositions(unfoldedSprings, unfoldedGroups)
  }, 0)
)

function findAllPositions(springs: string, groups: number[]): number {
  // Check if we've already been here before, and if we have, skip everything else
  const cacheKey = springs + ',' + groups.join(',')
  const cachedPositions = positionsCache.get(cacheKey)
  if (cachedPositions !== undefined) {
    return cachedPositions
  }

  const [nextGroupSize, ...remainingGroups] = groups
  // If there aren't even enough springs left to hold the next group, don't bother
  if (springs.length < nextGroupSize) {
    return 0
  }

  // Figure out how far we can go until the first mandatory spring is at the
  //   left edge of the group
  let maxOffset = springs.indexOf('#')
  // ... or, if there are no springs, how far until we run out of space for any
  //   remaining groups
  if (maxOffset < 0) {
    maxOffset = springs.length - 1 - remainingGroups.length * 2
  }
  // maxOffset might be negative now, but this will just cause the for loop to be skipped

  let positions = 0
  // For each offset that might work...
  nextIndex: for (let offset = 0; offset <= maxOffset; offset++) {
    // Can we fit it here?
    for (let i = 0; i < nextGroupSize; i++) {
      if (springs[offset + i] === '.') {
        // Hit a mandatory space, so continue past it (if possible)
        offset += i
        continue nextIndex
      }
      if (springs[offset + i] === undefined) {
        // Hit the end of the springs, stop looking for more places to fit it
        break nextIndex
      }
    }

    // Make sure the space immediately following isn't a mandatory spring
    if (springs[offset + nextGroupSize] === '#') {
      continue
    }

    // If there are any groups that we still need to place, figure out how many
    //   ways we can place them
    if (remainingGroups.length > 0) {
      positions += findAllPositions(
        springs.substring(offset + nextGroupSize + 1), // +1 to account for group spacing
        remainingGroups
      )
    } else {
      // If there are more mandatory springs that we aren't including,
      //   this position isn't valid
      if (springs.substring(offset + nextGroupSize + 1).includes('#')) {
        continue
      }
      positions++
    }
  }

  positionsCache.set(cacheKey, positions)
  return positions
}
