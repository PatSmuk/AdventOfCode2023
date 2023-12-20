import { readInputFileLines } from '../../util'

const WORKFLOW_PATTERN =
  /([a-z]+){((?:(?:[a-z]+|A|R)(?:<|>)\d+:(?:[a-z]+|A|R),)*(?:[a-z]+|A|R))}/
const RULE_PATTERN = /(x|m|a|s)(<|>)(\d+):([a-z]+|A|R)/

interface Rule {
  category: 'x' | 'm' | 'a' | 's'
  operator: '>' | '<'
  amount: number
  target: string
}

interface Workflow {
  name: string
  defaultTarget: string
  rules: Rule[]
}

type Range = [/*start*/ number, /*end*/ number]

interface RangeSet {
  x: Range
  m: Range
  a: Range
  s: Range
}

// "px{a<2006:qkq,m>2090:A,rfg}" -> {
//   name: 'px',
//   defaultTarget: 'rfg',
//   rules: [
//     { category: 'a', operator: '<', amount: 2006, target: 'qkq' },
//     { category: 'm', operator: '>', amount: 2090, target: 'A' }
//   ]
// }
function parseLine(line: string): Workflow | null {
  const workflowMatch = WORKFLOW_PATTERN.exec(line)
  if (workflowMatch) {
    const [_, name, allRules] = workflowMatch
    const rulesStrings = allRules.split(',')
    const defaultTarget = rulesStrings.pop()!

    const rules = []
    for (const ruleString of rulesStrings) {
      const [_, category, operator, amount, target] =
        RULE_PATTERN.exec(ruleString)!

      rules.push({
        category,
        operator,
        amount: parseInt(amount),
        target,
      } as Rule)
    }

    return { name, defaultTarget, rules }
  }

  // Don't care about non-workflow lines
  return null
}

const inputs = readInputFileLines(__dirname, parseLine)
const workflows: { [name: string]: Workflow } = {}

for (const input of inputs) {
  // Once we reach end of workflows, stop
  if (!input) {
    break
  }

  const workflow = input as Workflow
  workflows[workflow.name] = workflow
}

// Start with the "in" workflow and all ranges complete from 1-4000
const processingQueue: [Workflow, RangeSet][] = [
  [
    workflows['in'],
    {
      x: [1, 4000],
      m: [1, 4000],
      a: [1, 4000],
      s: [1, 4000],
    },
  ],
]

// This will end up containing only the range sets that ultimately
//   pass through as accepted
const acceptedRangeSets: RangeSet[] = []

while (processingQueue.length > 0) {
  // Make rangeSet a Partial here since we might entirely consume one of its
  //   category ranges to form a new RangeSet
  const [workflow, rangeSet] = processingQueue.shift() as [
    Workflow,
    Partial<RangeSet>
  ]

  for (const { category, operator, amount, target } of workflow.rules) {
    const range = rangeSet[category]
    // If this range has already been consumed, skip the rule
    if (!range) {
      continue
    }

    // Determine the parts of range that pass and fail the rule (if any)
    let trueRange: Range | undefined
    let falseRange: Range | undefined
    const [start, end] = range

    if (end < amount) {
      if (operator === '<') {
        trueRange = range
      } else {
        falseRange = range
      }
    } else if (start > amount) {
      if (operator === '>') {
        trueRange = range
      } else {
        falseRange = range
      }
    } else {
      // Range does not entirely pass or fail, so split it into two ranges
      if (operator === '<') {
        trueRange = [start, amount - 1]
        falseRange = [amount, end]
      } else {
        trueRange = [amount + 1, end]
        falseRange = [start, amount]
      }
    }

    // If range entirely failed the rule, this does nothing (falseRange === range)
    // If range entirely passed the rule, this sets it to undefined (it was consumed)
    // If part of range passed and part of it failed, this is the part that failed
    rangeSet[category] = falseRange

    // Likewise, if the range even partially passed the rule, this will be the part that did
    if (trueRange) {
      const newRange = {
        ...rangeSet,
        [category]: trueRange,
      } as RangeSet

      // It's accepted into Valhalla!
      if (target === 'A') {
        acceptedRangeSets.push(newRange)
      } else if (target !== 'R') {
        // If not rejected, we need to process it using the rules of the target workflow
        const targetWorkflow = workflows[target]
        processingQueue.push([targetWorkflow, newRange])
      }
    }
  }

  // Only continue using the range set if there's anything left that wasn't consumed
  if (rangeSet.x && rangeSet.m && rangeSet.a && rangeSet.s) {
    const target = workflow.defaultTarget

    if (target === 'A') {
      acceptedRangeSets.push(rangeSet as RangeSet)
    } else if (target !== 'R') {
      const targetWorkflow = workflows[target]
      processingQueue.push([targetWorkflow, rangeSet as RangeSet])
    }
  }
}

let sum = 0
for (const { x, m, a, s } of acceptedRangeSets) {
  sum +=
    (x[1] - x[0] + 1) * // +1 here since (4000 - 1) === 3999, but should be 4000
    (m[1] - m[0] + 1) *
    (a[1] - a[0] + 1) *
    (s[1] - s[0] + 1)
}
console.log(sum)
