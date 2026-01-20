interface ChartProps {
  content: any
  goal: string
}

export function Chart({ content, goal }: ChartProps) {
  // Extract data for visualization based on goal
  let chartData: any = null
  let chartType = 'bar'

  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content

    if (goal === 'visualize') {
      // Extract numeric data for visualization
      const metrics = extractNumericData(parsed)
      if (metrics.length > 0) {
        chartData = {
          labels: metrics.map(m => m.label),
          values: metrics.map(m => m.value)
        }
      }
    } else if (goal === 'detect_trend') {
      // For trends, look for time-series data
      chartType = 'line'
      const timeData = extractTimeSeriesData(parsed)
      if (timeData.length > 0) {
        chartData = {
          labels: timeData.map(d => d.label),
          values: timeData.map(d => d.value)
        }
      }
    }
  } catch {
    // Parsing failed, show basic chart placeholder
  }

  return (
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="text-gray-600 mb-2">
        📊 {goal === 'detect_trend' ? 'Trend' : 'Chart'} Visualization
      </div>
      {chartData ? (
        <div className="text-sm text-gray-500">
          <div className="mb-4">
            <strong>Chart Type:</strong> {chartType}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {chartData.labels.map((label: string, index: number) => (
              <div key={index} className="bg-white p-2 rounded">
                <div className="font-medium">{label}</div>
                <div className="text-gray-600">{chartData.values[index]}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          No suitable data found for {goal} visualization
        </div>
      )}
      <div className="mt-4 text-xs text-gray-400">
        (Mock chart - would render actual visualization with Chart.js/D3)
      </div>
    </div>
  )
}

function extractNumericData(data: any): Array<{ label: string; value: number }> {
  const metrics: Array<{ label: string; value: number }> = []

  function traverse(obj: any, path: string[] = []) {
    if (typeof obj === 'number' && obj > 0) {
      metrics.push({
        label: path.join('.') || 'Value',
        value: obj
      })
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => traverse(item, [...path, `[${index}]`]))
    } else if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        traverse(value, [...path, key])
      })
    }
  }

  traverse(data)
  return metrics.slice(0, 8)
}

function extractTimeSeriesData(data: any): Array<{ label: string; value: number }> {
  // Simple heuristic: look for objects with date/time and numeric fields
  const timeData: Array<{ label: string; value: number }> = []

  function traverse(obj: any) {
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        if (typeof item === 'object' && item) {
          const entries = Object.entries(item)
          const dateEntry = entries.find(([key, value]) =>
            /date|time|period|quarter|month|year/i.test(key)
          )
          const valueEntry = entries.find(([key, value]) =>
            typeof value === 'number' && value > 0
          )

          if (dateEntry && valueEntry) {
            timeData.push({
              label: String(dateEntry[1]),
              value: valueEntry[1] as number
            })
          }
        }
      })
    }
  }

  traverse(data)
  return timeData.slice(0, 10)
}