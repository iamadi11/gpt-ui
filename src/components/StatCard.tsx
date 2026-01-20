interface StatCardProps {
  content: {
    label: string
    value: number
    unit?: string
  }
  affordance: string
}

export function StatCard({ content, affordance }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="text-sm text-gray-600 mb-1">{content.label}</div>
      <div className="text-2xl font-bold text-gray-900">
        {content.value.toLocaleString()}
        {content.unit && <span className="text-sm font-normal ml-1">{content.unit}</span>}
      </div>
    </div>
  )
}