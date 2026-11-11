<template>
  <svg width="100%" :height="height" class="sparkline" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" style="overflow: visible;">
    <defs>
      <linearGradient :id="gradientId" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" :stop-color="color" stop-opacity="0.3" />
        <stop offset="100%" :stop-color="color" stop-opacity="0.02" />
      </linearGradient>
      <clipPath :id="clipId">
        <rect :x="points[0]?.x || 0" y="0" :width="(points[points.length-1]?.x - points[0]?.x) || width" :height="height" />
      </clipPath>
    </defs>
    <g :clip-path="`url(#${clipId})`">
      <!-- Area fill -->
      <path :d="areaPath" :fill="`url(#${gradientId})`" />
      <!-- Line -->
      <path :d="linePath" fill="none" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [3, 5, 4, 7, 6, 8, 7, 9, 8, 10] },
  width: { type: Number, default: 80 },
  height: { type: Number, default: 32 },
  color: { type: String, default: '#22c55e' } // green by default
})

const gradientId = computed(() => `sparkline-grad-${Math.random().toString(36).slice(2, 8)}`)
const clipId = computed(() => `sparkline-clip-${Math.random().toString(36).slice(2, 8)}`)

const points = computed(() => {
  const d = props.data
  if (!d || d.length < 2) return []
  // All-zero (or empty) data is "no data" — don't draw a misleading flat line.
  if (!d.some((v) => Number(v) !== 0)) return []
  const min = Math.min(...d)
  const max = Math.max(...d)
  const range = max - min || 1
  const paddingX = 0
  const paddingY = 2
  const w = props.width - paddingX * 2
  const h = props.height - paddingY * 2
  return d.map((v, i) => ({
    x: paddingX + (i / (d.length - 1)) * w,
    y: paddingY + h - ((v - min) / range) * h
  }))
})

// Build a smooth path through points using Catmull-Rom spline → cubic bezier.
// Produces curvy lines without overshoot at the endpoints.
function smoothPath(pts) {
  if (pts.length < 2) return ''
  if (pts.length === 2) return `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} L${pts[1].x.toFixed(1)},${pts[1].y.toFixed(1)}`
  const tension = 0.5 // 0.5 = standard Catmull-Rom; lower = flatter, higher = looser
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  return d
}

const linePath = computed(() => smoothPath(points.value))

const areaPath = computed(() => {
  const pts = points.value
  if (pts.length < 2) return ''
  const line = smoothPath(pts)
  const lastX = pts[pts.length - 1].x
  const firstX = pts[0].x
  return `${line} L${lastX.toFixed(1)},${props.height} L${firstX.toFixed(1)},${props.height} Z`
})
</script>
