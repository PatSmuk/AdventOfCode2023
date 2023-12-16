import { each, readInputFileLines } from '../../util'
import { Tile, findTotalEnergizedTiles } from '../util'

const inputs = readInputFileLines(__dirname, (line) => line)
const grid = new Map<string, Tile>()

for (const [row, y] of each(inputs)) {
  for (const [char, x] of each(row)) {
    grid.set(`${x},${y}`, char as Tile)
  }
}

console.log(findTotalEnergizedTiles(grid, 0, 0, 'r'))
