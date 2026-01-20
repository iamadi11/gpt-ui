interface StatCardProps {
  content: any
  goal: string
}

export function StatCard({ content, goal }: StatCardProps) {
  // Extract metrics from raw content based on goal
  const metrics = extractMetrics(content)

  if (metrics.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No metrics found for aggregation
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.slice(0, 6).map((metric, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
          <div className="text-2xl font-bold text-gray-900">
            {metric.value.toLocaleString()}
            {metric.unit && <span className="text-sm font-normal ml-1">{metric.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function extractMetrics(data: any): Array<{ label: string; value: number; unit?: string }> {
  const metrics: Array<{ label: string; value: number; unit?: string }> = []

  function traverse(obj: any, path: string[] = []) {
    if (typeof obj === 'number' && obj > 0) {
      metrics.push({
        label: path.join(' ') || 'Value',
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

  // Try parsing as JSON first, then as text
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    traverse(parsed)
  } catch {
    // If not JSON, try extracting numbers from text
    const text = typeof data === 'string' ? data : JSON.stringify(data)
    const numberRegex = /(\d+(?:,\d{3})*(?:\.\d+)?)/g
    let match

    while ((match = numberRegex.exec(text)) !== null) {
      const value = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(value) && value > 0) {
        const index = match.index
        const start = Math.max(0, index - 15)
        const end = Math.min(text.length, index + match[1].length + 15)
        const context = text.slice(start, end).replace(match[1], '').trim()

        metrics.push({
          label: context || `Metric ${metrics.length + 1}`,
          value
        })
      }
    }
  }

  return metrics.slice(0, 6)
}