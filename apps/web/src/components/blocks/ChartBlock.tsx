// ChartBlock Component
//
// MAPPING: "chart" UI primitive → Chart placeholder
// PURPOSE: Reserve space for future chart implementation
// STYLING: Placeholder with chart icon and description

interface ChartBlockProps {
  title: string
  data: any[]
  confidence: number
  intent: string
}

export function ChartBlock({ title, data, confidence, intent }: ChartBlockProps) {
  return (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">
        Chart visualization would be displayed here
      </p>
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-gray-500 capitalize">{intent}</span>
        <span className={`text-xs px-2 py-1 rounded ${
          confidence > 0.8 ? 'bg-green-100 text-green-800' :
          confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {Math.round(confidence * 100)}%
        </span>
      </div>
      {data && data.length > 0 && (
        <div className="mt-4 text-left">
          <p className="text-sm text-gray-500 mb-2">Data preview:</p>
          <pre className="text-xs text-gray-400 bg-gray-50 p-2 rounded overflow-x-auto">
            {JSON.stringify(data.slice(0, 3), null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}