// Test the simplified extractMetricsFromText function
const input = "The company achieved $2.3 billion in revenue this quarter, with 15% growth and 45,000 active customers."

function extractMetricsFromText(text) {
  const metrics = []

  // Simple approach: find numbers and extract context manually
  const numberRegex = /(\d+(?:,\d{3})*(?:\.\d+)?)/g
  let match

  // Process the entire text for numbers
  while ((match = numberRegex.exec(text)) !== null) {
    const numberStr = match[1]
    const value = parseFloat(numberStr.replace(/,/g, ''))

    if (!isNaN(value) && value > 0) {
      // Get position in text
      const index = match.index

      // Extract context (20 chars before and after)
      const start = Math.max(0, index - 20)
      const end = Math.min(text.length, index + numberStr.length + 20)
      const context = text.slice(start, end)

      // Clean context and create label
      let label = context
        .replace(numberStr, '') // Remove the number itself
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 1)
        .slice(0, 3)
        .join(' ')

      // Determine unit
      let unit
      const lowerContext = context.toLowerCase()

      if (lowerContext.includes('$') || lowerContext.includes('dollar') || lowerContext.includes('revenue')) {
        unit = 'USD'
      } else if (lowerContext.includes('%') || lowerContext.includes('percent') || lowerContext.includes('growth')) {
        unit = '%'
      }

      // Handle multipliers (million, billion, etc.)
      let multiplier = 1
      if (lowerContext.includes('billion')) {
        multiplier = 1000000000
      } else if (lowerContext.includes('million')) {
        multiplier = 1000000
      } else if (lowerContext.includes('thousand')) {
        multiplier = 1000
      }

      const finalValue = value * multiplier

      // Only add if we haven't seen this value before
      if (!metrics.find(m => m.value === finalValue)) {
        metrics.push({
          label: label || `Metric ${metrics.length + 1}`,
          value: finalValue,
          unit
        })
      }
    }
  }

  return metrics.slice(0, 6)
}

console.log('Input:', input)
console.log('Extracted metrics:', extractMetricsFromText(input))