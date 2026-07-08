import ReactECharts from 'echarts-for-react'
import type { ScoreboardDetailEntry } from '../types/scoreboard'

interface Props {
  data: Record<string, ScoreboardDetailEntry>
}

function buildOption(data: Record<string, ScoreboardDetailEntry>) {
  const entries = Object.values(data)

  const allDates = new Set<string>()
  for (const entry of entries) {
    for (const solve of entry.solves) {
      allDates.add(solve.date)
    }
  }
  const sortedDates = Array.from(allDates).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  )

  const colors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666',
    '#73c0de', '#3ba272', '#fc8452', '#9a60b4',
    '#ea7ccc', '#c23531', '#61a0a8', '#d48265',
  ]

  const series = entries.map((entry, i) => {
    const solves = [...entry.solves].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    let cumulative = 0
    let solveIdx = 0
    const points = sortedDates.map((date) => {
      while (solveIdx < solves.length && solves[solveIdx].date <= date) {
        cumulative += solves[solveIdx].value
        solveIdx++
      }
      return cumulative
    })

    return {
      name: entry.name,
      type: 'line' as const,
      smooth: true,
      data: points,
      itemStyle: { color: colors[i % colors.length] },
      lineStyle: { width: 2 },
      symbol: 'none',
    }
  })

  return {
    tooltip: {
      trigger: 'axis' as const,
    },
    legend: {
      show: series.length > 1,
      bottom: 0,
      type: 'scroll' as const,
    },
    grid: {
      left: 50,
      right: 20,
      bottom: series.length > 1 ? 50 : 30,
      top: 20,
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      data: sortedDates,
      axisLabel: {
        rotate: 45,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value' as const,
      name: 'Score',
    },
    series,
  }
}

export function ScoreboardGraph({ data }: Props) {
  const entries = Object.values(data)

  if (entries.length === 0 || entries.every((e) => e.solves.length === 0)) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No scoreboard data available
      </div>
    )
  }

  return (
    <ReactECharts
      option={buildOption(data)}
      style={{ height: 400 }}
      notMerge
    />
  )
}
