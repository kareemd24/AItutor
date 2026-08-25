// Capture every module's Explore view at fit zoom, for visual review.
import http from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'

const ROOT = path.resolve(new URL('..', import.meta.url).pathname)
const DIST = path.join(ROOT, 'dist')
const OUT = path.join(ROOT, '.smoke-shots', 'modules')
const EXECUTABLE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium'
const MODULES = ['tokenpath', 'rack', 'transformer', 'inference', 'training', 'silicon', 'memory', 'datacenter']

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' }
const server = await new Promise(resolve => {
  const s = http.createServer(async (req, res) => {
    let file = path.join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname))
    if (!existsSync(file) || !path.extname(file)) file = path.join(DIST, 'index.html')
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' })
    res.end(await readFile(file))
  })
  s.listen(0, '127.0.0.1', () => resolve(s))
})

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: EXECUTABLE })
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } })
const base = `http://127.0.0.1:${server.address().port}/`
for (const id of MODULES) {
  await page.goto(`${base}#/m/${id}/explore`)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="explore-card"]')
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, `${id}.png`) })
}
await browser.close()
server.close()
console.log(`captured ${MODULES.length} module shots in .smoke-shots/modules/`)
