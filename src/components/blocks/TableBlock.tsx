// TableBlock Component
//
// MAPPING: "table" UI primitive → Structured data table
// PURPOSE: Display tabular data or comparisons
// STYLING: Clean table with headers and data rows

interface TableBlockProps {
  title: string
  data: any[]
  confidence: number
  intent: string
}

export function TableBlock({ title, data, confidence, intent }: TableBlockProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  // Get all unique keys from the data array
  const headers = Array.from(new Set(data.flatMap(item => Object.keys(item))))

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 capitalize">{intent}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              confidence > 0.8 ? 'bg-green-100 text-green-800' :
              confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {headers.map(header => (
                <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {headers.map(header => (
                  <td key={header} className="px-4 py-3 text-sm text-gray-900">
                    {row[header] !== undefined ? String(row[header]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}