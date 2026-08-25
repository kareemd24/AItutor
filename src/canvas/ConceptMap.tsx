import { useEffect, useRef } from 'react'
import type { Item, ItemKind, ModuleDef, Shape } from '../types'

export type Mark = 'focus' | 'correct' | 'wrong'

interface Props {
  mod: ModuleDef
  marks: Record<string, Mark>
  /** show every atom's label (learn mode); marked atoms are always labeled */
  showAtomLabels: boolean
  /** hit-resolution hint from the current prompt */
  prefer?: ItemKind
  /** item to animate the camera toward */
  focusId?: string | null
  /** when this number changes, the camera animates back to the fitted view */
  resetSignal?: number
  interactive: boolean
  onTap?: (world: { x: number; y: number }, resolved: Item | null) => void
}

const PALETTE = [
  { h: 199, s: 90 }, // sky
  { h: 262, s: 75 }, // violet
  { h: 38, s: 95 },  // amber
  { h: 152, s: 65 }, // emerald
  { h: 340, s: 75 }, // rose
  { h: 185, s: 80 }, // cyan
]

interface Cam { k: number; tx: number; ty: number }

declare global {
  interface Window {
    __cmProject?: (x: number, y: number) => [number, number]
    __cmAnimating?: boolean
    __cmModule?: string
    /** zoom relative to fit — 1 means fitted, 2 means 2× in */
    __cmRelK?: number
    /** input diagnostics for the smoke harness */
    __cmTaps?: { downs: number; ups: number; taps: number; last: string }
    /** deterministic camera control for tests: center on a world point at relK */
    __cmFocusWorld?: (x: number, y: number, relK: number) => void
  }
}

export default function ConceptMap(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef(props)
  propsRef.current = props

  const camRef = useRef<Cam>({ k: 1, tx: 0, ty: 0 })
  const camTargetRef = useRef<Cam | null>(null)
  const lastFocusRef = useRef<string | null | undefined>(undefined)
  const lastResetRef = useRef<number | undefined>(undefined)
  const fitRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let cssW = 0
    let cssH = 0
    let disposed = false

    const containerIndex = new Map<string, number>()
    propsRef.current.mod.items
      .filter(i => i.kind === 'container')
      .forEach((c, idx) => containerIndex.set(c.id, idx))

    const hueOf = (item: Item) => {
      const key = item.kind === 'container' ? item.id : item.parent
      const idx = key !== undefined ? containerIndex.get(key) : undefined
      return idx !== undefined ? PALETTE[idx % PALETTE.length] : { h: 220, s: 15 }
    }

    function fitCam(): Cam {
      const { w, h } = propsRef.current.mod.world
      const k = Math.min(cssW / w, cssH / h) * 0.92
      return { k, tx: (cssW - w * k) / 2, ty: (cssH - h * k) / 2 }
    }

    function clampCam(c: Cam): Cam {
      const fit = fitCam()
      const k = Math.min(Math.max(c.k, fit.k * 0.5), fit.k * 8)
      return { k, tx: c.tx, ty: c.ty }
    }

    function resize() {
      // A resize (panel opening/closing, rotation) must not reset the view:
      // preserve each camera's world center and zoom-relative-to-fit.
      const hadSize = cssW > 0 && cssH > 0
      const oldFitK = hadSize ? fitCam().k : 1
      const oldW = cssW
      const oldH = cssH
      const capture = (c: Cam) => ({
        rel: c.k / oldFitK,
        wx: (oldW / 2 - c.tx) / c.k,
        wy: (oldH / 2 - c.ty) / c.k,
      })
      const saved = hadSize ? capture(camRef.current) : null
      const savedTarget = hadSize && camTargetRef.current ? capture(camTargetRef.current) : null

      const rect = canvas!.parentElement!.getBoundingClientRect()
      cssW = rect.width
      cssH = rect.height
      const dpr = window.devicePixelRatio || 1
      canvas!.width = Math.max(1, Math.round(cssW * dpr))
      canvas!.height = Math.max(1, Math.round(cssH * dpr))
      canvas!.style.width = `${cssW}px`
      canvas!.style.height = `${cssH}px`

      const restore = (s: { rel: number; wx: number; wy: number }): Cam => {
        const k = fitCam().k * s.rel
        return { k, tx: cssW / 2 - s.wx * k, ty: cssH / 2 - s.wy * k }
      }
      camRef.current = saved ? restore(saved) : fitCam()
      camTargetRef.current = savedTarget ? restore(savedTarget) : null
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)
    resize()

    // ---------------------------------------------------------- camera focus
    function focusOn(item: Item | null) {
      if (!item) {
        camTargetRef.current = fitCam()
        return
      }
      const fit = fitCam()
      let bw: number, bh: number
      if (item.kind === 'container') {
        bw = (item.w ?? 200) + 120
        bh = (item.h ?? 200) + 120
      } else {
        bw = 420
        bh = 300
      }
      const lod = item.lod ?? 1
      let k = Math.min(cssW / bw, cssH / bh)
      k = Math.min(k, fit.k * Math.max(2.4, lod * 1.6))
      // an item hidden behind a zoom threshold must be zoomed past it
      k = Math.max(k, fit.k, fit.k * lod * 1.15)
      camTargetRef.current = {
        k,
        tx: cssW / 2 - item.x * k,
        ty: cssH / 2 - item.y * k,
      }
    }

    // ------------------------------------------------------------- geometry
    const project = (x: number, y: number): [number, number] => {
      const c = camRef.current
      return [x * c.k + c.tx, y * c.k + c.ty]
    }
    const invert = (sx: number, sy: number) => {
      const c = camRef.current
      return { x: (sx - c.tx) / c.k, y: (sy - c.ty) / c.k }
    }

    function containerRect(item: Item): { x: number; y: number; w: number; h: number } {
      const w = item.w ?? 100
      const h = item.h ?? 100
      return { x: item.x - w / 2, y: item.y - h / 2, w, h }
    }

    // ------------------------------------------------------- hit resolution
    function resolveTap(sx: number, sy: number, prefer?: ItemKind): Item | null {
      const items = propsRef.current.mod.items
      const world = invert(sx, sy)
      const relK = camRef.current.k / fitCam().k

      const nearestAtomWithin = (rPx: number): Item | null => {
        let best: Item | null = null
        let bestD = Infinity
        for (const it of items) {
          if (it.kind !== 'atom') continue
          if (it.lod !== undefined && relK < it.lod) continue // hidden until zoomed
          const [ax, ay] = project(it.x, it.y)
          // atoms with big art accept taps anywhere over the art (hitR)
          const raw = Math.hypot(ax - sx, ay - sy)
          const d = it.hitR ? Math.max(0, raw - it.hitR * camRef.current.k) : raw
          if (d <= rPx && d < bestD) {
            best = it
            bestD = d
          }
        }
        return best
      }

      if (prefer !== 'container') {
        for (const r of [14, 22, 32]) {
          const hit = nearestAtomWithin(r)
          if (hit) return hit
        }
        if (prefer === 'atom') return null
      }

      // containment, smallest containing region wins
      let best: Item | null = null
      let bestArea = Infinity
      for (const it of items) {
        if (it.kind !== 'container') continue
        const r = containerRect(it)
        if (world.x >= r.x && world.x <= r.x + r.w && world.y >= r.y && world.y <= r.y + r.h) {
          const area = r.w * r.h
          if (area < bestArea) {
            best = it
            bestArea = area
          }
        }
      }
      if (best) return best

      // forgiveness: probe expanding screen-space rings against region edges
      const k = camRef.current.k
      for (const rPx of [10, 18, 28]) {
        let ring: Item | null = null
        let ringD = Infinity
        for (const it of items) {
          if (it.kind !== 'container') continue
          const r = containerRect(it)
          const dx = Math.max(r.x - world.x, 0, world.x - (r.x + r.w))
          const dy = Math.max(r.y - world.y, 0, world.y - (r.y + r.h))
          const d = Math.hypot(dx, dy) * k
          if (d <= rPx && d < ringD) {
            ring = it
            ringD = d
          }
        }
        if (ring) return ring
      }
      return null
    }

    // --------------------------------------------------------------- input
    const pointers = new Map<number, { x: number; y: number }>()
    // gesture state lives for the whole interaction, first finger down → last up
    let gesture = { dragged: false, maxPointers: 0, moved: 0, lastDist: 0, lastMid: { x: 0, y: 0 } }

    const toLocal = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const taps = { downs: 0, ups: 0, taps: 0, last: '' }
    window.__cmTaps = taps

    function onPointerDown(e: PointerEvent) {
      taps.downs++
      canvas!.setPointerCapture(e.pointerId)
      const p = toLocal(e)
      if (pointers.size === 0) {
        gesture = { dragged: false, maxPointers: 0, moved: 0, lastDist: 0, lastMid: p }
      }
      pointers.set(e.pointerId, p)
      gesture.maxPointers = Math.max(gesture.maxPointers, pointers.size)
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        gesture.lastDist = Math.hypot(a.x - b.x, a.y - b.y)
        gesture.lastMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (!pointers.has(e.pointerId)) return
      const p = toLocal(e)
      const prev = pointers.get(e.pointerId)!
      pointers.set(e.pointerId, p)

      if (pointers.size === 1) {
        gesture.moved += Math.hypot(p.x - prev.x, p.y - prev.y)
        if (gesture.moved > 6) gesture.dragged = true
        if (gesture.dragged) {
          camRef.current.tx += p.x - prev.x
          camRef.current.ty += p.y - prev.y
          camTargetRef.current = null
        }
      } else if (pointers.size === 2) {
        gesture.dragged = true
        camTargetRef.current = null
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
        if (gesture.lastDist > 0) {
          const factor = dist / gesture.lastDist
          zoomAround(mid.x, mid.y, factor)
        }
        camRef.current.tx += mid.x - gesture.lastMid.x
        camRef.current.ty += mid.y - gesture.lastMid.y
        gesture.lastDist = dist
        gesture.lastMid = mid
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (!pointers.has(e.pointerId)) return
      taps.ups++
      const p = toLocal(e)
      pointers.delete(e.pointerId)
      if (pointers.size === 0) {
        // only a single finger that never dragged is a tap; a pinch never is
        if (!gesture.dragged && gesture.maxPointers === 1 && propsRef.current.interactive) {
          const resolved = resolveTap(p.x, p.y, propsRef.current.prefer)
          taps.taps++
          taps.last = `(${Math.round(p.x)},${Math.round(p.y)})→${resolved?.id ?? 'null'}`
          propsRef.current.onTap?.(invert(p.x, p.y), resolved)
        } else {
          taps.last = `discarded drag=${gesture.dragged} maxP=${gesture.maxPointers} interactive=${propsRef.current.interactive}`
        }
        gesture = { dragged: false, maxPointers: 0, moved: 0, lastDist: 0, lastMid: p }
      } else if (pointers.size === 1) {
        gesture.lastDist = 0
      }
    }

    function zoomAround(sx: number, sy: number, factor: number) {
      const c = camRef.current
      const fit = fitCam()
      const nk = Math.min(Math.max(c.k * factor, fit.k * 0.5), fit.k * 8)
      const real = nk / c.k
      camRef.current = { k: nk, tx: sx - (sx - c.tx) * real, ty: sy - (sy - c.ty) * real }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const rect = canvas!.getBoundingClientRect()
      camTargetRef.current = null
      zoomAround(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.0016))
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    // ------------------------------------------------------------ test hooks
    window.__cmProject = (x: number, y: number) => {
      const rect = canvas!.getBoundingClientRect()
      const [sx, sy] = project(x, y)
      return [rect.left + sx, rect.top + sy]
    }
    window.__cmFocusWorld = (x: number, y: number, relK: number) => {
      const fit = fitCam()
      const k = Math.min(fit.k * relK, fit.k * 8)
      camTargetRef.current = { k, tx: cssW / 2 - x * k, ty: cssH / 2 - y * k }
    }
    window.__cmModule = propsRef.current.mod.id
    fitRef.current = () => { camTargetRef.current = fitCam() }

    // ---------------------------------------------------------------- draw
    function drawShape(s: Shape, relK: number) {
      if (s.lod !== undefined && relK < s.lod) return
      if (s.lodMax !== undefined && relK > s.lodMax) return
      const k = camRef.current.k
      if (s.t === 'rect') {
        const [sx, sy] = project(s.x, s.y)
        ctx!.beginPath()
        ctx!.roundRect(sx, sy, s.w * k, s.h * k, (s.r ?? 0) * k)
        if (s.f) { ctx!.fillStyle = s.f; ctx!.fill() }
        if (s.s) { ctx!.strokeStyle = s.s; ctx!.lineWidth = s.lw ?? 1; ctx!.stroke() }
      } else if (s.t === 'circle') {
        const [sx, sy] = project(s.cx, s.cy)
        ctx!.beginPath()
        ctx!.arc(sx, sy, s.r * k, 0, Math.PI * 2)
        if (s.f) { ctx!.fillStyle = s.f; ctx!.fill() }
        if (s.s) { ctx!.strokeStyle = s.s; ctx!.lineWidth = s.lw ?? 1; ctx!.stroke() }
      } else if (s.t === 'line') {
        ctx!.beginPath()
        for (let i = 0; i < s.pts.length; i += 2) {
          const [sx, sy] = project(s.pts[i], s.pts[i + 1])
          if (i === 0) ctx!.moveTo(sx, sy)
          else ctx!.lineTo(sx, sy)
        }
        ctx!.strokeStyle = s.s ?? 'rgba(226,232,240,0.5)'
        ctx!.lineWidth = s.lw ?? 1
        ctx!.setLineDash(s.dash ?? [])
        ctx!.stroke()
        ctx!.setLineDash([])
      } else if (s.t === 'text') {
        const px = (s.size ?? 12) * k
        if (px < 6) return
        const [sx, sy] = project(s.x, s.y)
        ctx!.font = `500 ${px}px system-ui, sans-serif`
        ctx!.textAlign = 'left'
        ctx!.textBaseline = 'middle'
        ctx!.fillStyle = s.f ?? 'rgba(148,163,184,0.7)'
        ctx!.fillText(s.text, sx, sy)
      }
    }

    // flows: animated particles along polylines. Precompute segment lengths.
    const flowGeom = (propsRef.current.mod.flows ?? []).map(f => {
      const segs: { x1: number; y1: number; dx: number; dy: number; len: number; start: number }[] = []
      let total = 0
      for (let i = 0; i + 3 < f.pts.length; i += 2) {
        const [x1, y1, x2, y2] = [f.pts[i], f.pts[i + 1], f.pts[i + 2], f.pts[i + 3]]
        const len = Math.hypot(x2 - x1, y2 - y1)
        segs.push({ x1, y1, dx: x2 - x1, dy: y2 - y1, len, start: total })
        total += len
      }
      return { f, segs, total }
    })

    function drawFlows(now: number) {
      const k = camRef.current.k
      for (const { f, segs, total } of flowGeom) {
        if (total <= 0) continue
        for (let i = 0; i < f.n; i++) {
          const offset = ((now / 1000) * f.speed + (i * total) / f.n) % total
          const seg = segs.find(sg => offset - sg.start <= sg.len) ?? segs[segs.length - 1]
          const u = Math.min(1, (offset - seg.start) / (seg.len || 1))
          const [sx, sy] = project(seg.x1 + seg.dx * u, seg.y1 + seg.dy * u)
          ctx!.beginPath()
          ctx!.arc(sx, sy, Math.max(1.5, (f.size ?? 2.5) * Math.min(k, 2)), 0, Math.PI * 2)
          ctx!.fillStyle = f.color
          ctx!.fill()
        }
      }
    }

    function drawFrame(now: number) {
      const { mod, marks, showAtomLabels } = propsRef.current
      const dpr = window.devicePixelRatio || 1
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, cssW, cssH)
      const k = camRef.current.k
      const relK = k / fitCam().k
      window.__cmRelK = relK

      // faint world grid for spatial texture
      ctx!.strokeStyle = 'rgba(148,163,184,0.07)'
      ctx!.lineWidth = 1
      for (let gx = 0; gx <= mod.world.w; gx += 100) {
        const [sx0, sy0] = project(gx, 0)
        const [, sy1] = project(gx, mod.world.h)
        ctx!.beginPath(); ctx!.moveTo(sx0, sy0); ctx!.lineTo(sx0, sy1); ctx!.stroke()
      }
      for (let gy = 0; gy <= mod.world.h; gy += 100) {
        const [sx0, sy0] = project(0, gy)
        const [sx1] = project(mod.world.w, gy)
        ctx!.beginPath(); ctx!.moveTo(sx0, sy0); ctx!.lineTo(sx1, sy0); ctx!.stroke()
      }

      const pulse = 0.5 + 0.5 * Math.sin(now / 220)

      // module backdrop illustration (leader lines, annotations)
      for (const s of mod.art ?? []) drawShape(s, relK)

      // containers first
      for (const it of mod.items) {
        if (it.kind !== 'container') continue
        const { h, s } = hueOf(it)
        const r = containerRect(it)
        const [sx, sy] = project(r.x, r.y)
        const sw = r.w * k
        const sh = r.h * k
        const mark = marks[it.id]
        const rad = Math.min(14, sw / 8, sh / 8)
        ctx!.beginPath()
        ctx!.roundRect(sx, sy, sw, sh, rad)
        ctx!.fillStyle = `hsla(${h},${s}%,60%,${mark === 'focus' ? 0.22 : 0.09})`
        ctx!.fill()
        if (mark === 'correct') { ctx!.fillStyle = 'rgba(52,211,153,0.16)'; ctx!.fill() }
        if (mark === 'wrong') { ctx!.fillStyle = 'rgba(251,113,133,0.16)'; ctx!.fill() }
        ctx!.lineWidth = mark ? 2.5 : 1.5
        ctx!.strokeStyle =
          mark === 'correct' ? 'rgba(52,211,153,0.95)'
          : mark === 'wrong' ? 'rgba(251,113,133,0.95)'
          : mark === 'focus' ? `hsla(${h},${s}%,72%,${0.55 + 0.45 * pulse})`
          : `hsla(${h},${s}%,65%,0.45)`
        ctx!.stroke()
        // the item's own illustration, on top of its region fill
        for (const shape of it.art ?? []) drawShape(shape, relK)
        // region label, always visible, top-left inside
        ctx!.font = '600 12px system-ui, sans-serif'
        ctx!.textAlign = 'left'
        ctx!.textBaseline = 'top'
        ctx!.fillStyle = `hsla(${h},${s}%,78%,0.95)`
        ctx!.fillText(it.name.toUpperCase(), sx + 10, sy + 8, Math.max(40, sw - 20))
      }

      // animated flows ride above the artwork, below the atoms
      drawFlows(now)

      // atoms on top; marked atoms drawn last; LOD-hidden atoms not at all
      const atoms = mod.items.filter(
        i => i.kind === 'atom' && (i.lod === undefined || relK >= i.lod),
      )
      atoms.sort((a, b) => (marks[a.id] ? 1 : 0) - (marks[b.id] ? 1 : 0))
      for (const it of atoms) {
        const { h, s } = hueOf(it)
        const [sx, sy] = project(it.x, it.y)
        const mark = marks[it.id]
        const R = 7
        for (const shape of it.art ?? []) drawShape(shape, relK)
        // hitR atoms get rings sized to their artwork, not their dot
        const ringBase = Math.max(R, (it.hitR ?? 0) * k * 0.8)
        if (mark === 'focus') {
          ctx!.beginPath()
          ctx!.arc(sx, sy, ringBase + 5 + 5 * pulse, 0, Math.PI * 2)
          ctx!.strokeStyle = 'rgba(251,191,36,0.9)'
          ctx!.lineWidth = 3
          ctx!.stroke()
        }
        if (mark === 'correct' || mark === 'wrong') {
          ctx!.beginPath()
          ctx!.arc(sx, sy, ringBase + 6, 0, Math.PI * 2)
          ctx!.strokeStyle = mark === 'correct' ? 'rgba(52,211,153,0.95)' : 'rgba(251,113,133,0.95)'
          ctx!.lineWidth = 3.5
          ctx!.stroke()
        }
        ctx!.beginPath()
        ctx!.arc(sx, sy, R, 0, Math.PI * 2)
        ctx!.fillStyle =
          mark === 'correct' ? 'rgb(52,211,153)'
          : mark === 'wrong' ? 'rgb(251,113,133)'
          : `hsl(${h},${s}%,66%)`
        ctx!.fill()
        ctx!.lineWidth = 1.5
        ctx!.strokeStyle = 'rgba(11,16,32,0.9)'
        ctx!.stroke()

        // labels sit beside the dot, never on top of it
        if (showAtomLabels || mark) {
          ctx!.font = '500 12px system-ui, sans-serif'
          ctx!.textAlign = 'left'
          ctx!.textBaseline = 'middle'
          const label = it.name
          const lx = sx + R + 6
          ctx!.lineWidth = 3
          ctx!.strokeStyle = 'rgba(11,16,32,0.85)'
          ctx!.strokeText(label, lx, sy)
          ctx!.fillStyle = mark ? '#f8fafc' : 'rgba(226,232,240,0.92)'
          ctx!.fillText(label, lx, sy)
        }
      }
    }

    function tick(now: number) {
      if (disposed) return
      // an incremented reset signal (each new question) refits the view
      const reset = propsRef.current.resetSignal
      if (reset !== undefined && reset !== lastResetRef.current) {
        lastResetRef.current = reset
        camTargetRef.current = fitCam()
      }
      // camera focus changes arrive via props
      const want = propsRef.current.focusId
      if (want !== lastFocusRef.current) {
        lastFocusRef.current = want
        focusOn(want ? propsRef.current.mod.items.find(i => i.id === want) ?? null : null)
      }
      const target = camTargetRef.current
      let animating = false
      if (target) {
        const c = camRef.current
        c.k += (target.k - c.k) * 0.14
        c.tx += (target.tx - c.tx) * 0.14
        c.ty += (target.ty - c.ty) * 0.14
        const settled =
          Math.abs(target.k - c.k) < 0.001 &&
          Math.abs(target.tx - c.tx) < 0.4 &&
          Math.abs(target.ty - c.ty) < 0.4
        if (settled) {
          camRef.current = clampCam(target)
          camTargetRef.current = null
        } else {
          animating = true
        }
      }
      window.__cmAnimating = animating
      // one bad frame must not crash the app
      try {
        drawFrame(now)
      } catch {
        // recover on the next frame
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      delete window.__cmProject
      delete window.__cmFocusWorld
      delete window.__cmModule
      delete window.__cmRelK
      window.__cmAnimating = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mod.id])

  return (
    <div className="map-wrap">
      <canvas ref={canvasRef} className="map-canvas" data-testid="concept-map" />
      <button
        className="fit-btn"
        aria-label="Fit view"
        title="Fit view"
        onClick={() => fitRef.current?.()}
      >
        ⛶
      </button>
    </div>
  )
}
