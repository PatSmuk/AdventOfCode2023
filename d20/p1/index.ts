import { range, readInputFileLines } from '../../util'

const BUTTON_PRESSES = 1000

const MODULE_PATTERN = /(broadcaster|%[a-z]+|&[a-z]+) -> ((?:[a-z]+, )*[a-z]+)/

interface Broadcaster {
  name: string
  type: 'broadcaster'
  targets: string[]
}
interface FlipFlop {
  name: string
  type: 'flipflop'
  targets: string[]
  isOn: boolean
}
interface Conjunction {
  name: string
  type: 'conjunction'
  targets: string[]
  lastPulseWasHighForInput: { [input: string]: boolean }
}
type Module = Broadcaster | FlipFlop | Conjunction

// "%ks -> xk, kd" => { name: "ks", type: "flipflop", targets: ["xk", "kd"], isOn: false }
// "broadcaster -> a, b, c" => { name: "broadcaster", type: "bc", targets: ["a", "b", "c"] }
// "&inv -> a" => { name: "inv", type: "conjunction", targets: ["a"], lastPulseWasHighForInput: {} }
function parseLine(line: string): Module {
  const [_, nameAndType, targetsString] = MODULE_PATTERN.exec(line)!
  const targets = targetsString.split(', ')

  if (nameAndType === 'broadcaster') {
    return { name: 'broadcaster', type: 'broadcaster', targets }
  } else if (nameAndType.startsWith('%')) {
    return {
      name: nameAndType.substring(1),
      type: 'flipflop',
      targets,
      isOn: false,
    }
  } else {
    return {
      name: nameAndType.substring(1),
      type: 'conjunction',
      targets,
      lastPulseWasHighForInput: {},
    }
  }
}

const modules = new Map(
  readInputFileLines(__dirname, parseLine).map((m) => [m.name, m])
)

// Initialize inputs of conjunction modules
const conjunctionNames = new Set(
  [...modules.values()]
    .filter((m) => m.type === 'conjunction')
    .map((m) => m.name)
)
for (const module of modules.values()) {
  for (const target of module.targets) {
    if (conjunctionNames.has(target)) {
      const conj = modules.get(target)! as Conjunction
      conj.lastPulseWasHighForInput[module.name] = false
    }
  }
}

type Pulse = [/*source*/ string, /*dest*/ string, /*isHigh*/ boolean]

let totalHighPulses = 0
let totalLowPulses = 0

// For each button press...
for (const _ of range(0, BUTTON_PRESSES)) {
  let pulses: Pulse[] = [['button', 'broadcaster', false]]

  // Until there are no more pulses being sent around...
  while (pulses.length > 0) {
    const nextPulses: Pulse[] = []

    // Fire each pulse
    for (const [source, dest, isHigh] of pulses) {
      if (isHigh) {
        totalHighPulses++
      } else {
        totalLowPulses++
      }

      const module = modules.get(dest)
      if (!module) {
        continue
      }

      if (module.type === 'broadcaster') {
        nextPulses.push(
          ...module.targets.map((name) => [module.name, name, isHigh] as Pulse)
        )
      } else if (module.type === 'flipflop') {
        if (!isHigh) {
          module.isOn = !module.isOn

          nextPulses.push(
            ...module.targets.map(
              (name) => [module.name, name, module.isOn] as Pulse
            )
          )
        }
      } else {
        module.lastPulseWasHighForInput[source] = isHigh

        // Output is high if any inputs are low
        const outputIsHigh = Object.values(
          module.lastPulseWasHighForInput
        ).some((wasHigh) => !wasHigh)

        nextPulses.push(
          ...module.targets.map(
            (name) => [module.name, name, outputIsHigh] as Pulse
          )
        )
      }
    }

    pulses = nextPulses
  }
}

console.log(totalLowPulses, totalHighPulses, totalHighPulses * totalLowPulses)
