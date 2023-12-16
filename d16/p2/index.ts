import { each, range, readInputFileLines } from '../../util'
import { Tile, findTotalEnergizedTiles } from '../util'

const inputs = readInputFileLines(__dirname, (line) => line)
const grid = new Map<string, Tile>()

for (const [row, y] of each(inputs)) {
  for (const [char, x] of each(row)) {
    grid.set(`${x},${y}`, char as Tile)
  }
}

let maxEnergizedTiles = 0
for (const y of range(0, inputs.length)) {
  maxEnergizedTiles = Math.max(
    maxEnergizedTiles,
    findTotalEnergizedTiles(grid, 0, y, 'r'),
    findTotalEnergizedTiles(grid, inputs[0].length - 1, y, 'l')
  )
}
for (const x of range(0, inputs[0].length)) {
  maxEnergizedTiles = Math.max(
    maxEnergizedTiles,
    findTotalEnergizedTiles(grid, x, 0, 'd'),
    findTotalEnergizedTiles(grid, x, inputs.length - 1, 'u')
  )
}
console.log(maxEnergizedTiles)
