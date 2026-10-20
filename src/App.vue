<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { depthKeyframes, zones } from './data'

const bgEl = ref<HTMLCanvasElement | null>(null)
const depth = ref(0)
const MAX_DEPTH = 11000

const depthM = computed(() => Math.round((depth.value / 100) * MAX_DEPTH))
const pressure = computed(() => Math.max(1, Math.round(depthM.value / 10)))
const lightPct = computed(() => Math.max(0, Math.round(100 - depth.value)))

const zone = computed(() => {
  const m = depthM.value
  return zones.find((z) => m >= z.range[0] && m <= z.range[1]) || zones[zones.length - 1]
})

function hexToRgb(h: string): [number, number, number] {
  const v = h.replace('#', '')
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
function mixColor(c1: string, c2: string, t: number) {
  const [r1, g1, b1] = hexToRgb(c1)
  const [r2, g2, b2] = hexToRgb(c2)
  return `rgb(${Math.round(lerp(r1, r2, t))},${Math.round(lerp(g1, g2, t))},${Math.round(lerp(b1, b2, t))})`
}

function colorsAt(d: number) {
  for (let i = 0; i < depthKeyframes.length - 1; i++) {
    const a = depthKeyframes[i]
    const b = depthKeyframes[i + 1]
    if (d >= a.d && d <= b.d) {
      const t = (d - a.d) / (b.d - a.d)
      return { top: mixColor(a.top, b.top, t), bottom: mixColor(a.bottom, b.bottom, t) }
    }
  }
  const last = depthKeyframes[depthKeyframes.length - 1]
  return { top: last.top, bottom: last.bottom }
}

let ctx: CanvasRenderingContext2D | null = null
let raf = 0
const parts = Array.from({ length: 130 }, () => ({
  x: Math.random(),
  y: Math.random(),
  s: Math.random() * 2 + 0.4,
  vx: (Math.random() - 0.5) * 0.0005,
  vy: 0.00008 + Math.random() * 0.0003,
  tw: Math.random() * Math.PI * 2,
  kind: Math.floor(Math.random() * 3),
}))

function draw() {
  const c = bgEl.value
  if (!c) return
  ctx = ctx || c.getContext('2d')
  if (!ctx) return
  const w = c.clientWidth
  const h = c.clientHeight
  if (c.width !== w) c.width = w
  if (c.height !== h) c.height = h

  const d = depth.value
  const cols = colorsAt(d)
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, cols.top)
  g.addColorStop(1, cols.bottom)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // light rays near surface
  const surface = 1 - d / 40
  if (surface > 0) {
    ctx.save()
    ctx.globalAlpha = 0.18 * surface
    for (let i = 0; i < 6; i++) {
      const x = ((i * 0.17 + 0.08) % 1) * w
      const grad = ctx.createLinearGradient(x, 0, x - w * 0.1, h)
      grad.addColorStop(0, 'rgba(220,245,255,.9)')
      grad.addColorStop(1, 'rgba(220,245,255,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x - w * 0.08, h)
      ctx.lineTo(x + w * 0.06, h)
      ctx.lineTo(x + w * 0.08, 0)
      ctx.fill()
    }
    ctx.restore()
  }

  // particles
  const glowy = d > 15
  for (const p of parts) {
    p.y -= p.vy
    p.x += p.vx
    if (p.y < 0) p.y = 1
    if (p.x < 0) p.x = 1
    if (p.x > 1) p.x = 0
    const tw = 0.5 + 0.5 * Math.sin(p.tw)
    const x = p.x * w
    const y = p.y * h
    if (glowy) {
      const hue = p.kind === 0 ? '190' : p.kind === 1 ? '220' : '280'
      ctx.fillStyle = `hsla(${hue},90%,70%,${0.25 + tw * 0.4})`
      ctx.beginPath()
      ctx.arc(x, y, p.s * (1 + tw), 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillStyle = `rgba(235,250,255,${0.12 + tw * 0.18})`
      ctx.fillRect(x, y, p.s, p.s)
    }
  }
  raf = requestAnimationFrame(draw)
}

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  depth.value = Math.max(0, Math.min(100, (window.scrollY / Math.max(1, max)) * 100))
}

function diveTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  raf = requestAnimationFrame(draw)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="ocean">
    <canvas ref="bgEl" class="ocean-bg" aria-hidden="true"></canvas>

    <div class="hud">
      <div class="hud-item"><span>深度</span><b>{{ depthM }}<i> m</i></b></div>
      <div class="hud-item"><span>压强</span><b>{{ pressure }}<i> atm</i></b></div>
      <div class="hud-item"><span>光照</span><b>{{ lightPct }}<i> %</i></b></div>
      <div class="hud-item hud-zone"><span>当前水层</span><b>{{ zone.name }}</b></div>
    </div>

    <div class="ruler" aria-hidden="true">
      <div class="ruler-track">
        <span v-for="z in zones" :key="z.id" class="ruler-zone">{{ z.range[0] }}m</span>
      </div>
      <div class="ruler-marker" :style="{ top: depth + '%' }">{{ depthM }}m</div>
    </div>

    <section class="dive-nav">
      <button v-for="z in zones" :key="z.id" @click="diveTo(z.id)">{{ z.name }}</button>
    </section>

    <main class="content">
      <section class="zone zone-surface" id="surface">
        <p class="zone-index">00</p>
        <h1 class="hero-title">深海<br />来信</h1>
        <p class="hero-sub">向下滚动，就是下潜。深度、光线、压强与生物，都会随着你的滚动一点点改变。</p>
        <div class="scroll-cue">↓ 开始下潜 ↓</div>
      </section>

      <section v-for="(z, i) in zones" :key="z.id" :id="z.id" class="zone">
        <div class="zone-inner">
          <div class="zone-head">
            <p class="zone-index">{{ String(i + 1).padStart(2, '0') }}</p>
            <div>
              <h2>{{ z.name }}</h2>
              <span class="zone-en">{{ z.en }}</span>
            </div>
          </div>
          <p class="zone-desc">{{ z.desc }}</p>
          <dl class="zone-facts">
            <div><dt>深度</dt><dd>{{ z.depth }}</dd></div>
            <div><dt>光照</dt><dd>{{ z.light }}</dd></div>
            <div><dt>温度</dt><dd>{{ z.temp }}</dd></div>
            <div><dt>压强</dt><dd>{{ z.pressure }}</dd></div>
          </dl>
          <ul class="creatures">
            <li v-for="c in z.creatures" :key="c.en">
              <span class="creature-dot" :class="'c' + i"></span>
              <span class="creature-body"><b>{{ c.name }}</b><i>{{ c.en }} — {{ c.note }}</i></span>
            </li>
          </ul>
        </div>
        <svg class="swim" :class="'swim-' + z.id" viewBox="0 0 120 80" aria-hidden="true">
          <g v-if="z.id === 'twilight' || z.id === 'midnight'">
            <path d="M60 12 C48 12 42 22 42 32 C42 44 52 52 60 52 C68 52 78 44 78 32 C78 22 72 12 60 12Z" fill="rgba(180,240,255,.28)" />
            <path v-for="t in 5" :key="t" :d="`M${46 + t * 5} 50 Q${44 + t * 5} ${60 + t * 4} ${46 + t * 5} ${72 + t * 2}`" fill="none" stroke="rgba(180,240,255,.25)" stroke-width="1.2" />
          </g>
          <g v-else-if="z.id === 'midnight'">
            <circle cx="40" cy="40" r="4" fill="rgba(255,240,180,.9)" />
          </g>
          <g v-else>
            <path d="M20 70 Q60 50 100 70 Q60 78 20 70Z" fill="rgba(200,235,255,.18)" />
          </g>
        </svg>
      </section>

      <section class="zone zone-final">
        <div class="zone-inner">
          <p class="zone-index">06</p>
          <h2 class="final-title">海沟之下</h2>
          <p class="zone-desc">
            你已抵达 11000 米的想象尽头。真实的海洋比我们更沉默、更辽阔，
            每一束游动的光，都是一封来自深渊的信。
          </p>
          <div class="about-meta">
            <span>深度数据基于公开海洋学常识</span>
            <span>全部视觉为 Canvas / SVG 原创绘制</span>
            <span>无外部素材依赖</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
:root {
  --sans: system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.ocean {
  position: relative;
  min-height: 100vh;
  color: #eaf6ff;
  font-family: var(--sans);
  overflow-x: hidden;
}
.ocean-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hud {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 20;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.hud-item {
  background: rgba(4, 18, 38, 0.55);
  border: 1px solid rgba(150, 220, 255, 0.25);
  backdrop-filter: blur(8px);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  min-width: 92px;
}
.hud-item span {
  font-size: 10px;
  letter-spacing: 3px;
  color: rgba(180, 220, 245, 0.8);
}
.hud-item b {
  font-size: 22px;
  font-weight: 700;
  color: #dff4ff;
}
.hud-item i {
  font-style: normal;
  font-size: 12px;
  color: rgba(180, 220, 245, 0.7);
}
.hud-zone b {
  font-size: 16px;
}

.ruler {
  position: fixed;
  left: 18px;
  top: 12%;
  bottom: 12%;
  width: 70px;
  z-index: 20;
}
.ruler-track {
  position: absolute;
  inset: 0;
  border-left: 1px solid rgba(150, 220, 255, 0.35);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 12px;
}
.ruler-zone {
  font-size: 10px;
  color: rgba(170, 215, 245, 0.75);
  letter-spacing: 1px;
}
.ruler-marker {
  position: absolute;
  left: 0;
  transform: translateY(-50%);
  font-size: 11px;
  color: #fff;
  background: rgba(80, 180, 235, 0.7);
  padding: 2px 8px;
  border-radius: 999px;
  transition: top 0.08s linear;
}

.dive-nav {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.dive-nav button {
  background: rgba(4, 18, 38, 0.5);
  border: 1px solid rgba(150, 220, 255, 0.3);
  color: #dff4ff;
  padding: 7px 14px;
  font-size: 12px;
  letter-spacing: 1px;
  backdrop-filter: blur(6px);
  transition: background 0.2s;
}
.dive-nav button:hover {
  background: rgba(50, 160, 225, 0.4);
}

.content {
  position: relative;
  z-index: 10;
}
.zone {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 90px clamp(20px, 5vw, 80px) 120px;
  position: relative;
}
.zone-inner {
  max-width: 680px;
}
.zone-index {
  font-size: 13px;
  letter-spacing: 4px;
  color: rgba(190, 230, 255, 0.7);
  margin: 0 0 18px;
}
.hero-title {
  font-size: clamp(52px, 11vw, 150px);
  line-height: 0.95;
  margin: 0 0 20px;
  letter-spacing: 0.02em;
  text-shadow: 0 0 50px rgba(150, 220, 255, 0.35);
}
.hero-sub {
  max-width: 46ch;
  color: rgba(220, 242, 255, 0.88);
  font-size: clamp(15px, 1.8vw, 19px);
  margin: 0 0 30px;
  line-height: 1.7;
}
.scroll-cue {
  color: rgba(210, 238, 255, 0.9);
  letter-spacing: 3px;
  font-size: 14px;
  animation: bob 2s ease-in-out infinite;
}
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

.zone-head {
  display: flex;
  gap: 18px;
  align-items: baseline;
  margin-bottom: 16px;
}
.zone-head .zone-index {
  margin: 0;
}
.zone-head h2 {
  font-size: clamp(34px, 6vw, 72px);
  margin: 0;
  letter-spacing: 0.02em;
}
.zone-en {
  display: block;
  color: rgba(170, 215, 245, 0.75);
  letter-spacing: 2px;
  font-size: 13px;
}
.zone-desc {
  max-width: 54ch;
  color: rgba(220, 242, 255, 0.85);
  line-height: 1.75;
  margin: 18px 0 22px;
}
.zone-facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 0 0 26px;
}
.zone-facts div {
  border: 1px solid rgba(150, 220, 255, 0.2);
  padding: 12px 16px;
  background: rgba(4, 18, 38, 0.35);
  backdrop-filter: blur(4px);
}
.zone-facts dt {
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(170, 215, 245, 0.7);
}
.zone-facts dd {
  margin: 4px 0 0;
  font-size: 16px;
}
.creatures {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.creatures li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.creature-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 7px;
  flex: none;
  background: #8ed8ff;
  box-shadow: 0 0 12px #8ed8ff;
}
.creature-body {
  display: flex;
  flex-direction: column;
}
.creature-body b {
  font-size: 16px;
}
.creature-body i {
  font-style: normal;
  color: rgba(190, 225, 248, 0.75);
  font-size: 13px;
}

.swim {
  position: absolute;
  right: 8%;
  width: clamp(120px, 20vw, 260px);
  opacity: 0.9;
  pointer-events: none;
}
.swim-twilight {
  top: 18%;
  animation: drift 9s ease-in-out infinite alternate;
}
.swim-midnight {
  top: 30%;
  animation: drift 13s ease-in-out infinite alternate-reverse;
}
@keyframes drift {
  from { transform: translateX(0) translateY(0); }
  to { transform: translateX(-40px) translateY(30px); }
}

.zone-final {
  min-height: 100vh;
}
.final-title {
  font-size: clamp(40px, 8vw, 100px);
  margin: 0 0 14px;
}
.about-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  font-size: 12px;
  color: rgba(170, 215, 245, 0.7);
  letter-spacing: 1px;
  margin-top: 24px;
}

@media (max-width: 720px) {
  .ruler {
    display: none;
  }
  .hud {
    top: 10px;
    right: 10px;
    gap: 6px;
  }
  .hud-item {
    min-width: 70px;
    padding: 8px 10px;
  }
  .hud-item b {
    font-size: 17px;
  }
  .zone-facts {
    grid-template-columns: 1fr;
  }
  .swim {
    right: 4%;
    width: 110px;
  }
}
</style>
