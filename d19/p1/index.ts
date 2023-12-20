import { readInputFileLines } from '../../util'

const WORKFLOW_PATTERN =
  /([a-z]+){((?:(?:[a-z]+|A|R)(?:<|>)\d+:(?:[a-z]+|A|R),)*(?:[a-z]+|A|R))}/
const PART_PATTERN = /{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}/
const RULE_PATTERN = /(x|m|a|s)(<|>)(\d+):([a-z]+|A|R)/

interface Part {
  x: number
  m: number
  a: number
  s: number
}

interface Rule {
  category: keyof Part
  operator: '>' | '<'
  amount: number
  target: string
}

interface Workflow {
  name: string
  defaultTarget: string
  rules: Rule[]
}

// "px{a<2006:qkq,m>2090:A,rfg}" -> {
//   name: 'px',
//   defaultTarget: 'rfg',
//   rules: [
//     { category: 'a', operator: '<', amount: 2006, target: 'qkq' },
//     { category: 'm', operator: '>', amount: 2090, target: 'A' }
//   ]
// }
// "{x=787,m=2655,a=1222,s=2876}" -> { x: 787, m: 2655, a: 1222, s: 2876 }
function parseLine(line: string): Workflow | Part | null {
  // Try parsing a workflow
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

  // Try parsing a part description
  const partMatch = PART_PATTERN.exec(line)
  if (partMatch) {
    const [_, x, m, a, s] = partMatch
    return { x: parseInt(x), m: parseInt(m), a: parseInt(a), s: parseInt(s) }
  }

  return null
}

const inputs = readInputFileLines(__dirname, parseLine)
const workflows: { [name: string]: Workflow } = {}
let pastSeparator = false
let sum = 0

for (const input of inputs) {
  // Once we hit the first null, we're beyond the workflows
  if (!input) {
    pastSeparator = true
    continue
  }

  if (!pastSeparator) {
    const workflow = input as Workflow
    workflows[workflow.name] = workflow
    continue
  }

  const part = input as Part
  let currentWorkflow = 'in'

  // Pass the part through each workflow until it is either accepted or rejected
  nextWorkflow: while (currentWorkflow !== 'A' && currentWorkflow !== 'R') {
    const workflow = workflows[currentWorkflow]

    for (const rule of workflow.rules) {
      if (rule.operator === '>') {
        if (part[rule.category] > rule.amount) {
          currentWorkflow = rule.target
          continue nextWorkflow
        }
      } else {
        if (part[rule.category] < rule.amount) {
          currentWorkflow = rule.target
          continue nextWorkflow
        }
      }
    }

    currentWorkflow = workflow.defaultTarget
  }

  // If it was accepted, add its values to the sum
  if (currentWorkflow === 'A') {
    sum += part.x + part.m + part.a + part.s
  }
}

console.log(sum)
