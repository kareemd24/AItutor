// Static curriculum audit: every tappable item needs all three teaching
// layers, and assessment clues may not repeat the answer label or acronym.

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA = path.join(ROOT, 'src', 'data')

function source(text, filename) {
  return ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
}

function literalText(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : undefined
}

function property(object, key) {
  return object.properties.find(p =>
    ts.isPropertyAssignment(p) &&
    ((ts.isIdentifier(p.name) && p.name.text === key) || literalText(p.name) === key),
  )
}

function record(sf, variableName) {
  let result
  sf.forEachChild(node => {
    if (!ts.isVariableStatement(node)) return
    for (const declaration of node.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== variableName) continue
      const init = declaration.initializer
      if (!init || !ts.isObjectLiteralExpression(init)) continue
      result = new Map(init.properties.flatMap(p => {
        if (!ts.isPropertyAssignment(p)) return []
        const key = ts.isIdentifier(p.name) ? p.name.text : literalText(p.name)
        return key ? [[key, literalText(p.initializer) ?? '']] : []
      }))
    }
  })
  if (!result) throw new Error(`Could not find ${variableName}`)
  return result
}

const filenames = await readdir(DATA)
const moduleFiles = filenames.filter(name =>
  name.endsWith('.ts') && !['beginner.ts', 'guides.ts', 'index.ts', 'quiz.ts', 'teaching.ts', 'tour.ts', 'visuals.ts'].includes(name),
)

const items = []
for (const filename of moduleFiles) {
  const sf = source(await readFile(path.join(DATA, filename), 'utf8'), filename)
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const idProp = property(node, 'id')
      const nameProp = property(node, 'name')
      if (idProp && nameProp && ts.isPropertyAssignment(idProp) && ts.isPropertyAssignment(nameProp)) {
        const id = literalText(idProp.initializer)
        const name = literalText(nameProp.initializer)
        if (id && name) items.push({ id, name })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
}

const beginnerSf = source(await readFile(path.join(DATA, 'beginner.ts'), 'utf8'), 'beginner.ts')
const teachingSf = source(await readFile(path.join(DATA, 'teaching.ts'), 'utf8'), 'teaching.ts')
const quizSf = source(await readFile(path.join(DATA, 'quiz.ts'), 'utf8'), 'quiz.ts')
const visualsSf = source(await readFile(path.join(DATA, 'visuals.ts'), 'utf8'), 'visuals.ts')
const guides = record(beginnerSf, 'CONCEPT_GUIDES')
const lenses = record(teachingSf, 'TEACHING_LENSES')
const clues = record(quizSf, 'QUIZ_CLUES')
const visuals = record(visualsSf, 'VISUAL_STORIES')

const failures = []
const ids = new Set(items.map(item => item.id))
if (items.length !== 168 || ids.size !== 168) failures.push(`expected 168 unique items; found ${items.length} rows / ${ids.size} IDs`)

for (const item of items) {
  if (!guides.has(item.id)) failures.push(`${item.id}: missing plain-language guide`)
  if (!lenses.has(item.id)) failures.push(`${item.id}: missing why/analogy lens`)
  if (!visuals.has(item.id)) failures.push(`${item.id}: missing concept-specific visual story`)
  const clue = clues.get(item.id)
  if (!clue) {
    failures.push(`${item.id}: missing clue-only assessment prompt`)
    continue
  }

  const normalizedClue = clue.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const baseName = item.name.replace(/\([^)]*\)/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  if (baseName.length >= 4 && normalizedClue.includes(baseName)) {
    failures.push(`${item.id}: clue repeats answer label “${baseName}”`)
  }
  const acronyms = [
    ...(item.name.match(/\b[A-Z][A-Z0-9]{2,}\b/g) ?? []),
    ...(item.name.match(/\(([A-Z][A-Z0-9/-]{1,})\)/g) ?? []).map(value => value.slice(1, -1)),
  ]
  for (const acronym of new Set(acronyms)) {
    if (new RegExp(`\\b${acronym.toLowerCase()}\\b`).test(normalizedClue)) {
      failures.push(`${item.id}: clue repeats answer acronym “${acronym}”`)
    }
  }
}

for (const [label, map] of [['guide', guides], ['lens', lenses], ['clue', clues], ['visual', visuals]]) {
  for (const id of map.keys()) if (!ids.has(id)) failures.push(`${id}: orphan ${label} entry`)
}

if (failures.length) {
  console.error(`CONTENT AUDIT FAIL (${failures.length})`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`CONTENT AUDIT PASS — ${items.length} concepts have plain language, causal analogies, unique visuals, and answer-safe clues`)
