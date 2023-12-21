import { readInputFileLines } from '../../util'

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

// Output a GraphViz diagram of the modules (optional)
// console.log('\ndigraph {')
// for (const module of readInputFileLines(__dirname, parseLine)) {
//   console.log(`  ${module.name} -> {${module.targets.join(' ')}};`)
// }
// console.log()
// for (const module of readInputFileLines(__dirname, parseLine)) {
//   if (module.type === 'conjunction') {
//     console.log(`  ${module.name} [shape=box];`)
//   }
// }
// console.log('  broadcaster [shape=doublecircle];')
// console.log('  rx [shape=doublecircle];')
// console.log('}\n')

const modules = new Map(
  readInputFileLines(__dirname, parseLine).map((m) => [m.name, m])
)

// All of the modules are ultimately connected to a final conjunction right before
//   the rx module, so figure out the name of that final conjunction
const finalConjunction = [...modules.values()].filter((m) =>
  m.targets.includes('rx')
)[0].name

// For each input to the final conjunction, figure out how many times the button
//   was pressed until it sends a high pulse
const finalConjunctionButtonPressesForInput: { [module: string]: number } = {}

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

      if (target === finalConjunction) {
        finalConjunctionButtonPressesForInput[module.name] = 0
      }
    }
  }
}

type Pulse = [/*source*/ string, /*dest*/ string, /*isHigh*/ boolean]

// Each time an input to the final conjunction goes high, we have figured out
//   how often it repeats, so multiply that into this number to get the final answer
let finalProduct = 1

// While there's an input to the final conjunction that has not gone high yet,
//   keep pressing the button
while (Object.keys(finalConjunctionButtonPressesForInput).length > 0) {
  // Increment button press counters for final conjunction inputs
  for (const module of Object.keys(finalConjunctionButtonPressesForInput)) {
    finalConjunctionButtonPressesForInput[module]++
  }

  let pulses: Pulse[] = [['button', 'broadcaster', false]]

  while (pulses.length > 0) {
    const nextPulses: Pulse[] = []

    for (const [source, dest, isHigh] of pulses) {
      const module = modules.get(dest)
      if (!module) {
        continue
      }

      // If the destination is the final conjunction and its high, we have
      //   figured out how often that input goes high, so combine it into the
      //   final product and mark it as done
      if (dest === finalConjunction && isHigh) {
        console.log(source, finalConjunctionButtonPressesForInput[source])
        finalProduct *= finalConjunctionButtonPressesForInput[source]
        delete finalConjunctionButtonPressesForInput[source]
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

        const outputIsHigh = !Object.values(
          module.lastPulseWasHighForInput
        ).every((wasHigh) => wasHigh)

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

// If any of the numbers in this product had common factors it could be reduced,
//  but for my input they were all prime, so don't need to reduce it
console.log(finalProduct)
