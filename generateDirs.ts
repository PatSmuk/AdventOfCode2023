import { mkdirSync, writeFileSync, existsSync } from 'fs'

const INITIAL_CODE = `import { each, range, readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line
}

const inputs = readInputFileLines(__dirname, parseLine)
console.log(JSON.stringify(inputs, null, 2))
`

for (let i = 1; i <= 25; i++) {
  const dir = 'd' + i.toString().padStart(2, '0')
  try {
    mkdirSync(dir)
  } catch (err) {}

  try {
    mkdirSync(`${dir}/p1`)
  } catch (err) {}

  try {
    mkdirSync(`${dir}/p2`)
  } catch (err) {}

  if (!existsSync(`${dir}/input.txt`)) {
    console.log(`creating ${dir}/input.txt`)
    writeFileSync(`${dir}/input.txt`, '')
  }

  if (!existsSync(`${dir}/p1/index.ts`)) {
    console.log(`creating ${dir}/p1/index.ts`)
    writeFileSync(`${dir}/p1/index.ts`, INITIAL_CODE)
  }

  if (!existsSync(`${dir}/p2/index.ts`)) {
    console.log(`creating ${dir}/p2/index.ts`)
    writeFileSync(`${dir}/p2/index.ts`, INITIAL_CODE)
  }
}
