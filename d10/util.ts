export type Direction = 'up' | 'down' | 'right' | 'left'

export const DIRECTION_IN_TO_OUT: {
  [pipe: string]: { [inDirection: string]: Direction }
} = {
  '-': {
    right: 'right',
    left: 'left',
  },
  '|': {
    up: 'up',
    down: 'down',
  },
  L: {
    down: 'right',
    left: 'up',
  },
  J: {
    down: 'left',
    right: 'up',
  },
  '7': {
    up: 'left',
    right: 'down',
  },
  F: {
    up: 'right',
    left: 'down',
  },
}

export const DIRECTION_DELTAS: { [direction: string]: [number, number] } = {
  up: [0, -1],
  down: [0, +1],
  left: [-1, 0],
  right: [+1, 0],
}
