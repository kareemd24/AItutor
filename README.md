# ChipMap

Learn AI & semiconductor concepts the way you learn a map: **every idea has a
place, and tapping the place is the answer.** Built from the
[MyMapTap playbook](https://github.com/kareemd24/mymaptap) — the geography swapped
for hand-designed concept layouts, everything downstream kept.

## The modules

| Module | What you learn |
|---|---|
| **The Transformer, Block by Block** | Tokenizer → embeddings → attention (Q/K/V, scores, KV cache, GQA) → FFN (up/gate/down, MoE) → output head, hung on the residual spine |
| **The Inference Stack** | Prefill vs decode, TTFT vs inter-token latency, speculative decoding (draft → verify → acceptance), continuous batching, PagedAttention, FlashAttention, quantization |
| **The Training Pipeline** | Pretraining (data, loss, AdamW, scaling laws) → post-training (SFT, RLHF, reward models, PPO, DPO, RLVR, Constitutional AI, distillation) over distributed-training machinery |
| **Silicon: GPUs, ASICs & Packaging** | SMs and tensor cores vs systolic arrays and vector units; HBM stacks, TSVs, CoWoS interposers, chiplets, the reticle limit |
| **The Memory Hierarchy** | Registers → SRAM → HBM → DDR → NVMe as a staircase, plus the physics: arithmetic intensity, the memory wall, bandwidth vs capacity |
| **The AI Datacenter & Optical Networking** | NVLink/NVSwitch scale-up vs InfiniBand/RoCE scale-out, Clos fabrics, and inside the optics: lasers, modulators, DSPs, silicon photonics, CPO, LPO |

## The game

Each module is a **designed 2D layout** where placement is curation — related
concepts sit near each other, because partial credit decays with distance.
**Regions** (containers) are tapped inside; **concepts** (atoms) are tapped near.

Four modes over the same items:

- **Learn** — guided tour, no score. Region by region, with one hand-written
  sentence per item: the hook you hang the concept on.
- **Drill** — the game. Timed prompts weighted toward what you know least,
  including "find the one that…" role questions.
- **Sprint** — one 60-second clock, endless prompts, for fluency.
- **Review** — Leitner spaced repetition; only what you're due to forget.

When you miss, the verdict names *what you actually tapped*, lights up the
right answer, and teaches the sentence. The wrongness moment is the teaching
moment. Progress lives in `localStorage` only.

## Develop

```bash
npm install
npm run dev      # local dev server
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
src/data/*.ts        hand-authored layouts + notes (the dataset IS the product)
src/game/engine.ts   pure logic: sampling, scoring, grading, Leitner — no DOM
src/lib/progress.ts  versioned localStorage store; corruption costs history, never the app
src/canvas/          one canvas component: camera, gestures, hit resolution
src/screens/         home → module setup → play/results, hash-routed
scripts/smoke.mjs    the verification harness
```

Deployed to GitHub Pages by `.github/workflows/deploy.yml` (relative asset
paths, so the build runs under any subpath).
