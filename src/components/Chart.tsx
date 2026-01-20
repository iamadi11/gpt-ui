interface ChartProps {
  content: any
  affordance: string
}

export function Chart({ content, affordance }: ChartProps) {
  // Mock chart component - in production, this would use a charting library
  return (
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="text-gray-600 mb-2">📊 Chart Component</div>
      <div className="text-sm text-gray-500">
        Mock chart visualization for: {JSON.stringify(content).substring(0, 100)}...
      </div>
      <div className="mt-4 text-xs text-gray-400">
        (Would render actual chart here with a library like Chart.js or D3)
      </div>
    </div>
  )
}