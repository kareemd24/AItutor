// Smoke harness: drives a real browser through the whole product and fails on
// ANY console error, ANY failed request, or ANY horizontal overflow at 390px.
// Uses the deterministic in-app hooks (__cmTarget / __cmProject / __cmAnimating)
// so every tap is computed, never guessed.

import http from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const SHOTS = path.join(ROOT, '.smoke-shots')
const EXECUTABLE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium'

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
}

function serve(dir) {
  return new Promise(resolve => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://x')
        let file = path.join(dir, decodeURIComponent(url.pathname))
        if (url.pathname === '/' || !existsSync(file)) file = path.join(dir, 'index.html')
        const body = await readFile(file)
        res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' })
        res.end(body)
      } catch (e) {
        res.writeHead(500)
        res.end(String(e))
      }
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

let step = 0
async function shot(page, name) {
  step++
  await page.screenshot({ path: path.join(SHOTS, `${String(step).padStart(2, '0')}-${name}.png`) })
}

function fail(msg) {
  console.error(`\nSMOKE FAIL: ${msg}`)
  process.exitCode = 1
  throw new Error(msg)
}

async function settle(page) {
  // never measure while the camera is mid-animation (playbook incident #9),
  // and never while layout is still shifting the canvas under the pointer
  const rectOf = () => page.evaluate(() => {
    const r = document.querySelector('[data-testid="concept-map"]').getBoundingClientRect()
    return `${r.left},${r.top},${r.width},${r.height}`
  })
  for (let i = 0; i < 40; i++) {
    await page.waitForFunction(() => window.__cmAnimating !== true, null, { timeout: 5000 })
    const before = await rectOf()
    await page.waitForTimeout(120)
    const stillCalm = await page.evaluate(() => window.__cmAnimating !== true)
    const after = await rectOf()
    if (stillCalm && before === after) return
  }
  fail('canvas never settled (camera or layout kept moving)')
}

async function currentTarget(page) {
  const t = await page.evaluate(() => window.__cmTarget)
  if (!t) fail('no __cmTarget exposed while a question was expected')
  return t
}

async function tapWorld(page, x, y) {
  await settle(page)
  const [sx, sy] = await page.evaluate(([wx, wy]) => window.__cmProject(wx, wy), [x, y])
  await page.mouse.click(sx, sy)
}

function farCorner(target) {
  const corners = [
    { x: 60, y: 60 }, { x: 940, y: 60 }, { x: 60, y: 560 }, { x: 940, y: 560 },
  ]
  let best = corners[0]
  let bestD = -1
  for (const c of corners) {
    const d = Math.hypot(c.x - target.x, c.y - target.y)
    if (d > bestD) { bestD = d; best = c }
  }
  if (bestD < 350) fail(`no corner far enough from target ${target.id}`)
  return best
}

async function checkOverflow(page, label) {
  const over = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
  }))
  if (over.doc > over.win + 1) {
    fail(`horizontal overflow at ${label}: content ${over.doc}px > viewport ${over.win}px`)
  }
}

async function answerQuestion(page, { wrong = false } = {}) {
  const t = await currentTarget(page)
  // targets behind a zoom threshold must be zoomed to first, like a player
  // would; the new-question refit can race the zoom, so verify it took
  if (!wrong && t.lod) {
    for (let attempt = 0; attempt < 5; attempt++) {
      await page.evaluate(([x, y, rel]) => window.__cmFocusWorld(x, y, rel), [t.x, t.y, t.lod * 1.3])
      await settle(page)
      const relK = await page.evaluate(() => window.__cmRelK)
      if (relK >= t.lod) break
      if (attempt === 4) fail(`could not hold zoom for ${t.id}: relK ${relK} < lod ${t.lod}`)
    }
  }
  const point = wrong ? farCorner(t) : { x: t.x, y: t.y }
  await tapWorld(page, point.x, point.y)
  try {
    await page.waitForSelector('[data-testid="verdict"]', { timeout: 5000 })
  } catch (e) {
    const diag = await page.evaluate(() => JSON.stringify({
      taps: window.__cmTaps, relK: window.__cmRelK, target: window.__cmTarget,
      phase: window.__cmPhase,
      rect: document.querySelector('[data-testid="concept-map"]')?.getBoundingClientRect(),
    }))
    console.error(`DIAG no-verdict for ${t.id}: ${diag}`)
    throw e
  }
  const cls = await page.getAttribute('[data-testid="verdict"]', 'class')
  const good = cls.includes('good')
  if (wrong && good) fail(`deliberate miss on ${t.id} was graded correct — forgiveness has no edges`)
  if (!wrong && !good) fail(`center tap on ${t.id} was graded wrong`)
  return t
}

async function run() {
  await mkdir(SHOTS, { recursive: true })
  const server = await serve(DIST)
  const port = server.address().port
  const base = `http://127.0.0.1:${port}/`

  const browser = await chromium.launch({ executablePath: EXECUTABLE })
  const errors = []
  const context = await browser.newContext({ viewport: { width: 1100, height: 800 } })
  const page = await context.newPage()
  const trackPage = (p, label) => {
    p.on('console', msg => { if (msg.type() === 'error') errors.push(`${label} console: ${msg.text()}`) })
    p.on('pageerror', err => errors.push(`${label} pageerror: ${err.message}`))
    p.on('requestfailed', req => {
      // ERR_ABORTED = cancelled by our own navigation, not a real failure
      const why = req.failure()?.errorText ?? ''
      if (!why.includes('ERR_ABORTED')) errors.push(`${label} request: ${req.url()} → ${why}`)
    })
  }
  trackPage(page, 'desktop')

  try {
    // ---- 1. home: all modules listed --------------------------------------
    await page.goto(base, { waitUntil: 'networkidle' })
    const cards = await page.locator('.module-card').count()
    if (cards !== 8) fail(`expected 8 module cards, found ${cards}`)
    await shot(page, 'home')

    // ---- 2. module setup --------------------------------------------------
    await page.click('.module-card:first-child')
    await page.waitForSelector('.mode-card')
    const modes = await page.locator('.mode-card').count()
    if (modes !== 5) fail(`expected 5 mode cards, found ${modes}`)
    await shot(page, 'setup')

    // ---- 3. learn tour, full walk ----------------------------------------
    await page.goto(`${base}#/m/transformer/learn`)
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="learn-card"]')
    const seen = new Set()
    const visualTitles = new Set()
    for (let i = 0; i < 60; i++) {
      const t = await currentTarget(page)
      seen.add(t.id)
      const scene = page.locator('.concept-scene')
      if (await scene.count() !== 1) fail(`learn step ${t.id} has no concept-specific visual`)
      if (await scene.locator('.scene-beat-meta, .scene-image-key em').count() === 0) {
        fail(`learn step ${t.id} does not explain which visual beats are input, action, memory, or result`)
      }
      visualTitles.add(await scene.locator('figcaption strong').textContent())
      if (i === 2) await page.getByRole('button', { name: 'Diagram' }).click()
      const next = page.locator('[data-testid="learn-next"]')
      if (await next.count() === 0) break
      await next.click()
      await page.waitForTimeout(60)
      if (i === 2) {
        const selected = await page.locator('.visual-toggle button.active').textContent()
        if (selected !== 'Diagram') fail(`visual preference reset after Next: ${selected}`)
        await page.getByRole('button', { name: 'Analogy' }).click()
      }
    }
    if (seen.size !== 20) fail(`learn tour visited ${seen.size} items, expected 20`)
    if (visualTitles.size !== 20) fail(`transformer reused visual stories: ${visualTitles.size} unique titles for 20 concepts`)
    await shot(page, 'learn-end')

    // ---- 4. full drill: correct taps, plus one deliberate miss -----------
    await page.click('a[href="#/m/transformer/drill"]')
    await page.waitForSelector('[data-testid="prompt"]')
    await page.waitForFunction(() => window.__cmQuizMasked === true)
    const firstQuestion = await page.evaluate(() => ({
      clue: document.querySelector('[data-testid="prompt"]')?.textContent?.toLowerCase() ?? '',
      answer: window.__cmTarget?.id ?? '',
      masked: window.__cmQuizMasked,
    }))
    if (!firstQuestion.masked) fail('drill map exposed authored labels')
    if (/\b(prefill|feed-forward|ffn)\b/.test(firstQuestion.clue) && /prefill|ffn/.test(firstQuestion.answer)) {
      fail(`drill clue leaked its answer: ${firstQuestion.clue}`)
    }
    let missDone = false
    for (let q = 0; q < 30; q++) {
      if (await page.locator('[data-testid="results"]').count() > 0) break
      const wrong = !missDone && q === 2
      await answerQuestion(page, { wrong })
      if (wrong) missDone = true
      if (q === 2) await shot(page, 'drill-verdict-wrong')
      const btn = page.locator('[data-testid="next-btn"]')
      await btn.click()
      await page.waitForTimeout(80)
    }
    await page.waitForSelector('[data-testid="results"]', { timeout: 5000 })
    if (!missDone) fail('drill ended before the deliberate-miss case ran')
    const score = await page.textContent('[data-testid="final-score"]')
    if (!(Number(score) > 0)) fail(`final score not positive: ${score}`)
    await shot(page, 'drill-results')

    // ---- 5. progress persisted -------------------------------------------
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('chipmap.progress.v1')
      return raw ? Object.keys(JSON.parse(raw).items).length : 0
    })
    if (stored < 5) fail(`only ${stored} items recorded in progress store`)

    // ---- 6. review with a seeded overdue item (real reload, incident #10) -
    await page.evaluate(() => {
      const raw = JSON.parse(localStorage.getItem('chipmap.progress.v1'))
      raw.items['tf.kvcache'] = { attempts: 3, correct: 1, streak: 0, box: 1, due: Date.now() - 60000 }
      localStorage.setItem('chipmap.progress.v1', JSON.stringify(raw))
    })
    await page.goto(`${base}#/m/transformer/review`)
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="prompt"]')
    // finish the whole due queue
    for (let q = 0; q < 40; q++) {
      if (await page.locator('[data-testid="results"]').count() > 0) break
      await answerQuestion(page)
      await page.locator('[data-testid="next-btn"]').click()
      await page.waitForTimeout(80)
    }
    await page.waitForSelector('[data-testid="results"]')
    await shot(page, 'review-results')

    // ---- 7. sprint: clock runs, prompts auto-advance ----------------------
    await page.goto(`${base}#/m/inference/sprint`)
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="prompt"]')
    await answerQuestion(page)
    // sprint advances by itself — the verdict must clear without a click
    await page.waitForSelector('[data-testid="verdict"]', { state: 'detached', timeout: 4000 })
    await answerQuestion(page)
    await shot(page, 'sprint')

    // ---- 7b. rack explore: tap-to-inspect + LOD zoom reveal ---------------
    await page.goto(`${base}#/m/rack/explore`)
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="explore-card"]')
    await tapWorld(page, 240, 65) // top-of-rack switches
    let card = await page.textContent('[data-testid="explore-card"]')
    if (!card.includes('Top-of-rack')) fail(`explore tap on ToR switch showed: ${card.slice(0, 60)}`)
    // focused Explore deliberately hides everything else; return to the map
    // before selecting a concept in another region.
    await page.getByRole('button', { name: '← Whole map' }).click()
    await settle(page)
    // at fit zoom the GPU die is LOD-hidden: tapping its spot must select the module, not the die
    await tapWorld(page, 635, 444)
    card = await page.textContent('[data-testid="explore-card"]')
    if (card.includes('Blackwell dies')) fail('LOD-hidden die was selectable at fit zoom')
    if (!card.includes('GPU module')) fail(`expected GPU module container, got: ${card.slice(0, 60)}`)
    // zoom in — now the die is there
    await page.evaluate(() => window.__cmFocusWorld(635, 444, 2))
    await tapWorld(page, 635, 444)
    card = await page.textContent('[data-testid="explore-card"]')
    if (!card.includes('Blackwell dies')) fail(`zoomed explore tap missed the die: ${card.slice(0, 60)}`)
    await shot(page, 'rack-explore-zoom')

    // ---- 7c. rack drill: LOD targets answered by zooming ------------------
    await page.goto(`${base}#/m/rack/drill`)
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="prompt"]')
    for (let q = 0; q < 5; q++) {
      if (await page.locator('[data-testid="results"]').count() > 0) break
      await answerQuestion(page)
      await page.locator('[data-testid="next-btn"]').click()
      await page.waitForTimeout(80)
    }
    await shot(page, 'rack-drill')

    // ---- 7d. token journey renders with its flows -------------------------
    await page.goto(`${base}#/m/tokenpath/learn`)
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="learn-card"]')
    await shot(page, 'tokenpath-learn')

    // ---- 7e. the grand tour crosses all four modules ----------------------
    await page.goto(`${base}#/tour`)
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="tour-card"]')
    const tourModules = new Set()
    for (let i = 0; i < 40; i++) {
      tourModules.add(await page.getAttribute('.tour-workspace', 'data-module'))
      const next = page.locator('[data-testid="tour-next"]')
      if (await next.count() === 0) break
      await next.click()
      await page.waitForTimeout(60)
    }
    if (await page.locator('[data-testid="tour-end"]').count() === 0) {
      fail('tour never reached its final step')
    }
    for (const m of ['tokenpath', 'inference', 'memory', 'rack']) {
      if (!tourModules.has(m)) fail(`tour never visited module ${m} (saw: ${[...tourModules].join(',')})`)
    }
    await shot(page, 'tour-end')

    // ---- 8. phone viewport: no overflow, drill still playable -------------
    const phone = await context.browser().newContext({
      viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true,
    })
    const pp = await phone.newPage()
    trackPage(pp, 'phone')
    await pp.goto(base, { waitUntil: 'networkidle' })
    await checkOverflow(pp, 'home@390')
    await shot(pp, 'phone-home')
    await pp.goto(`${base}#/m/tokenpath/learn`, { waitUntil: 'networkidle' })
    await pp.waitForSelector('[data-testid="learn-card"]')
    for (let i = 0; i < 4; i++) await pp.locator('[data-testid="learn-next"]').click()
    await pp.waitForSelector('img[alt*="THE CAPITAL OF FRANCE IS"]')
    const prefillImage = await pp.locator('.scene-illustration img').evaluate(img => ({
      width: img.clientWidth,
      height: img.clientHeight,
      loaded: img.complete && img.naturalWidth > 0,
    }))
    if (!prefillImage.loaded || prefillImage.width < 250 || prefillImage.height < 100) {
      fail(`mobile prefill visual is not reconstructable at a glance: ${JSON.stringify(prefillImage)}`)
    }
    await checkOverflow(pp, 'prefill-learn@390')
    await shot(pp, 'phone-prefill-learn')
    await pp.goto(`${base}#/m/transformer/learn`, { waitUntil: 'networkidle' })
    await pp.waitForSelector('[data-testid="learn-card"]')
    for (let i = 0; i < 10; i++) await pp.locator('[data-testid="learn-next"]').click()
    await pp.waitForTimeout(120)
    const lessonScroll = await pp.locator('.lesson-workspace').evaluate(node => node.scrollTop)
    if (lessonScroll !== 0) fail(`mobile lesson did not reset to its new visual: scrollTop=${lessonScroll}`)
    await checkOverflow(pp, 'ffn-learn@390')
    await shot(pp, 'phone-ffn-learn')
    await pp.goto(`${base}#/m/silicon/drill`)
    await pp.reload({ waitUntil: 'networkidle' })
    await pp.waitForSelector('[data-testid="prompt"]')
    await checkOverflow(pp, 'drill@390')
    for (let q = 0; q < 3; q++) {
      const t = await pp.evaluate(() => window.__cmTarget)
      if (!t) break
      await pp.waitForFunction(() => window.__cmAnimating !== true)
      await pp.waitForTimeout(120)
      const [sx, sy] = await pp.evaluate(([wx, wy]) => window.__cmProject(wx, wy), [t.x, t.y])
      await pp.touchscreen.tap(sx, sy)
      await pp.waitForSelector('[data-testid="verdict"]')
      const cls = await pp.getAttribute('[data-testid="verdict"]', 'class')
      if (!cls.includes('good')) fail(`phone center tap on ${t.id} graded wrong`)
      await checkOverflow(pp, 'verdict@390')
      await pp.locator('[data-testid="next-btn"]').click()
      await pp.waitForTimeout(80)
    }
    await shot(pp, 'phone-drill')
    await phone.close()
  } finally {
    await browser.close()
    server.close()
  }

  if (errors.length > 0) {
    console.error('\nSMOKE FAIL — page errors:')
    for (const e of errors) console.error('  ' + e)
    process.exit(1)
  }
  console.log(`\nSMOKE PASS — ${step} screenshots in ${path.relative(ROOT, SHOTS)}/`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
