<script setup lang="ts">
defineOptions({ name: 'admin-dashboard' })

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { weddingConfig } from '@/config/wedding'
import { fetchRsvpList, fetchWall, type RsvpRecord } from '@/api/client'
import type { WallItem } from '@/types'

echarts.use([
  PieChart,
  BarChart,
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer
])

const loading = ref(true)
const error = ref('')
const rsvpList = ref<RsvpRecord[]>([])
const wallList = ref<WallItem[]>([])

const attendChartEl = ref<HTMLElement | null>(null)
const trendChartEl = ref<HTMLElement | null>(null)
const partyChartEl = ref<HTMLElement | null>(null)

let attendChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null
let partyChart: echarts.ECharts | null = null

const stats = computed(() => {
  const total = rsvpList.value.length
  const attendYes = rsvpList.value.filter((r) => r.attend !== 'no').length
  const attendNo = total - attendYes
  const guests = rsvpList.value.reduce((sum, r) => {
    const n = Number.parseInt(String(r.num || '1'), 10)
    return sum + (Number.isFinite(n) && n > 0 ? n : 1)
  }, 0)
  return {
    rsvpTotal: total,
    attendYes,
    attendNo,
    guests,
    wallTotal: wallList.value.length
  }
})

function dayKey(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '未知'
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${m}-${day}`
}

function renderCharts(): void {
  const yes = stats.value.attendYes
  const no = stats.value.attendNo

  if (attendChartEl.value) {
    attendChart ??= echarts.init(attendChartEl.value)
    attendChart.setOption(
      {
        color: ['#2d4a36', '#c9a86a'],
        tooltip: { trigger: 'item' },
        series: [
          {
            type: 'pie',
            radius: ['42%', '68%'],
            label: { color: '#1c2e24' },
            data: [
              { name: '欣然赴约', value: yes },
              { name: '遗憾缺席', value: no }
            ]
          }
        ]
      },
      { notMerge: true }
    )
  }

  const trendMap = new Map<string, number>()
  for (const r of rsvpList.value) {
    const key = dayKey(r.time || '')
    trendMap.set(key, (trendMap.get(key) || 0) + 1)
  }
  const wallMap = new Map<string, number>()
  for (const w of wallList.value) {
    const key = dayKey(w.createdAt || '')
    wallMap.set(key, (wallMap.get(key) || 0) + 1)
  }
  const days = [...new Set([...trendMap.keys(), ...wallMap.keys()])].sort()

  if (trendChartEl.value) {
    trendChart ??= echarts.init(trendChartEl.value)
    trendChart.setOption(
      {
        color: ['#2d4a36', '#c9a86a'],
        tooltip: { trigger: 'axis' },
        legend: { data: ['登记人数', '照片上传'] },
        grid: { left: 40, right: 20, top: 40, bottom: 30 },
        xAxis: { type: 'category', data: days.length ? days : ['暂无'] },
        yAxis: { type: 'value', minInterval: 1 },
        series: [
          {
            name: '登记人数',
            type: 'line',
            smooth: true,
            data: days.length ? days.map((d) => trendMap.get(d) || 0) : [0]
          },
          {
            name: '照片上传',
            type: 'bar',
            barMaxWidth: 28,
            data: days.length ? days.map((d) => wallMap.get(d) || 0) : [0]
          }
        ]
      },
      { notMerge: true }
    )
  }

  const buckets = [
    { name: '1人', min: 1, max: 1 },
    { name: '2人', min: 2, max: 2 },
    { name: '3-4人', min: 3, max: 4 },
    { name: '5人+', min: 5, max: 999 }
  ]
  const partyData = buckets.map((b) =>
    rsvpList.value.filter((r) => {
      const n = Number.parseInt(String(r.num || '1'), 10) || 1
      return n >= b.min && n <= b.max
    }).length
  )

  if (partyChartEl.value) {
    partyChart ??= echarts.init(partyChartEl.value)
    partyChart.setOption(
      {
        color: ['#4a6b52'],
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 16, top: 24, bottom: 30 },
        xAxis: { type: 'category', data: buckets.map((b) => b.name) },
        yAxis: { type: 'value', minInterval: 1 },
        series: [{ type: 'bar', barMaxWidth: 36, data: partyData }]
      },
      { notMerge: true }
    )
  }
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const [rsvp, wall] = await Promise.all([
      fetchRsvpList(weddingConfig.api.rsvpEndpoint),
      fetchWall(weddingConfig.api.wallEndpoint)
    ])
    rsvpList.value = rsvp
    wallList.value = wall
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function onResize(): void {
  attendChart?.resize()
  trendChart?.resize()
  partyChart?.resize()
}

watch([rsvpList, wallList, loading], () => {
  if (!loading.value) {
    requestAnimationFrame(() => renderCharts())
  }
})

onMounted(async () => {
  await load()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  attendChart?.dispose()
  trendChart?.dispose()
  partyChart?.dispose()
})
</script>

<template>
  <div class="dash">
    <header class="head">
      <div>
        <h1>数据看板</h1>
        <p>登记回复与照片墙上传统计</p>
      </div>
      <button type="button" class="refresh" :disabled="loading" @click="load">刷新</button>
    </header>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="cards">
      <div class="card">
        <span>登记总数</span>
        <strong>{{ stats.rsvpTotal }}</strong>
      </div>
      <div class="card">
        <span>预计到场</span>
        <strong>{{ stats.guests }}</strong>
      </div>
      <div class="card">
        <span>赴约 / 缺席</span>
        <strong>{{ stats.attendYes }} / {{ stats.attendNo }}</strong>
      </div>
      <div class="card">
        <span>照片墙</span>
        <strong>{{ stats.wallTotal }}</strong>
      </div>
    </div>

    <div class="charts">
      <section class="panel">
        <h2>赴约比例</h2>
        <div ref="attendChartEl" class="chart"></div>
      </section>
      <section class="panel wide">
        <h2>每日趋势</h2>
        <div ref="trendChartEl" class="chart"></div>
      </section>
      <section class="panel wide">
        <h2>同行人数分布</h2>
        <div ref="partyChartEl" class="chart"></div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 22px;
}
h1 {
  font-size: 26px;
  letter-spacing: 0.16em;
  font-weight: 500;
}
.head p {
  color: var(--brown);
  font-size: 14px;
  margin-top: 4px;
}
.refresh {
  padding: 9px 16px;
  border: 1px solid rgba(45, 74, 54, 0.35);
  background: #fff;
  color: var(--green);
  font: inherit;
  cursor: pointer;
}
.refresh:disabled {
  opacity: 0.6;
}
.error {
  color: #a33;
  margin-bottom: 12px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}
.card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(201, 168, 106, 0.35);
  padding: 16px 18px;
  display: grid;
  gap: 6px;
}
.card span {
  font-size: 13px;
  color: var(--brown);
  letter-spacing: 0.08em;
}
.card strong {
  font-size: 28px;
  font-weight: 500;
  color: var(--green-deep);
}
.charts {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 14px;
}
.panel {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(138, 115, 80, 0.2);
  padding: 16px 16px 8px;
}
.panel.wide {
  grid-column: 1 / -1;
}
.panel h2 {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--green-soft);
  margin-bottom: 4px;
}
.chart {
  width: 100%;
  height: 280px;
}
@media (max-width: 900px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .charts {
    grid-template-columns: 1fr;
  }
}
</style>
