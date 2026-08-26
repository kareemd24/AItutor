# ChipMap — Investor Edition

Learn AI & semiconductor concepts the way you learn a map: **every idea has a
place, and tapping the place is the answer.** Built from the
[MyMapTap playbook](https://github.com/kareemd24/mymaptap) — the geography swapped
for hand-designed concept layouts, everything downstream kept.

The investor edition adds a plain-language thesis, diligence question, key
metrics, generation-specific caveats, and primary sources to every module.
Every one of the 168 tappable concepts now answers five questions in order:
**What does the term mean? Why does it exist? What is actually happening? How
does it connect to the worked prompt? Why does it matter?** Each one also has a
carefully labeled analogy so a non-technical reader has something concrete to
remember. A global concept finder jumps directly to any term on its map.

Lessons use a focused split-screen workspace: one isolated visual or analogy on
the left, and a large, scrollable explanation on the right. Original office and
kitchen illustrations make the transformer and inference stories reconstructable
without turning the diagrams into walls of labels.

## The modules

| Module | What you learn |
|---|---|
| **The Journey of a Token** | A clearly labeled worked example — "The capital of France is" → " Paris" — with token chips, illustrative attention weights and logits, and a KV cache that grows each decode step |
| **Inside a GPU Rack** | A DGX GB200 NVL72: 18 compute trays, 9 NVSwitch trays, eight redundant 33 kW power shelves, coolant manifolds, and the 5,000+ cable copper NVLink spine — exploding down to one Blackwell module |
| **The Transformer, Block by Block** | Tokenizer → embeddings → attention (Q/K/V, scores, KV cache, GQA) → FFN (up/gate/down, MoE) → output head, hung on the residual spine |
| **The Inference Stack** | Prefill vs decode, TTFT vs inter-token latency, prefix caching, speculative decoding, continuous batching, PagedAttention, FlashAttention, quantization, and serving trade-offs |
| **The Training Pipeline** | One example's story: "…France is Paris" guessed (Paris 0.42), scored (−log 0.42), backpropagated and nudged — then SFT/RLHF/DPO/RLVR post-training and the distributed machinery |
| **Silicon: GPUs, ASICs & Packaging** | An H100-style floorplan (SM banks, 50 MB L2, HBM PHYs), a TPU-v3-style 128×128 systolic array, and a CoWoS package cross-section |
| **The Memory Hierarchy** | Registers → SRAM → HBM → DDR → NVMe as a staircase, plus the physics: arithmetic intensity, the memory wall, bandwidth vs capacity |
| **The AI Datacenter & Optical Networking** | NVLink/NVSwitch scale-up vs InfiniBand/RoCE scale-out, Clos fabrics, and inside the optics: lasers, modulators, DSPs, silicon photonics, CPO, LPO |

**The Grand Tour** (`#/tour`) is a guided narrative that follows one request —
"The capital of France is" — across four modules in 20 steps: through the
model, across a serving worker's timetable, into physical memory, and down to
the rack. Worked values are explicitly marked as illustrative.

## The game

Each module is a **designed 2D layout** where placement is curation — related
concepts sit near each other, because partial credit decays with distance.
**Regions** (containers) are tapped inside; **concepts** (atoms) are tapped near.

Illustrated modules add three more layers: **vector art** drawn in world space
(the rack is drawn as a rack), **level-of-detail** (ports, dies and HBM stacks
appear only past a zoom threshold — drill targets behind a threshold show a
"zoom in" nudge), and **animated flows** (particles moving along paths:
coolant loops, token streams).

Five modes over the same items:

- **Learn** — guided tour, no score. Region by region, with a plain-English
  definition, causal “why,” analogy, step sequence, worked-prompt connection,
  misconception check where useful, and investor takeaway.
- **Explore** — a clean, label-light system view. Tap any component and the map
  isolates it beside the full teaching card; reveal all authored details only
  when you want them.
- **Drill** — the game. Timed prompts weighted toward what you know least,
  using clue-only questions. Region titles, component labels, and diagram text
  are hidden until the answer so the map cannot give the term away.
- **Sprint** — one 60-second clock, endless prompts, for fluency.
- **Review** — Leitner spaced repetition; only what you're due to forget.

When you miss, the verdict names *what you actually tapped*, lights up the
right answer, and teaches the sentence. The wrongness moment is the teaching
moment. Progress lives in `localStorage` only.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run audit    # verifies all 168 teaching layers and answer-safe clues
npm run build    # typecheck + production build
npm run smoke    # drives a real browser through the whole product
```

The smoke harness (`scripts/smoke.mjs`) fails on **any** console error, **any**
failed request, or **any** horizontal overflow at 390px, and uses the app's
deterministic hooks (`__cmTarget`, `__cmProject`, `__cmAnimating`) so every
tap is computed, never guessed. It needs a Chromium binary
(`CHROMIUM_PATH`, default `/opt/pw-browsers/chromium`).

## Architecture

```
src/data/*.ts        hand-authored layouts + beginner explanations (the dataset IS the product)
src/game/engine.ts   pure logic: sampling, scoring, grading, Leitner — no DOM
src/lib/progress.ts  versioned localStorage store; corruption costs history, never the app
src/canvas/          one canvas component: camera, gestures, hit resolution
src/screens/         home → module setup → play/results, hash-routed
scripts/smoke.mjs    the verification harness
```

Deployed to GitHub Pages by `.github/workflows/deploy.yml` (relative asset
paths, so the build runs under any subpath).
