interface DataTableProps {
  content: any
  goal: string
}

export function DataTable({ content, goal }: DataTableProps) {
  // Parse content and prepare data based on goal
  let data: any[] = []
  let headers: string[] = []

  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content

    if (goal === 'compare') {
      // For comparison, expect array of comparable items
      if (Array.isArray(parsed)) {
        data = parsed
        if (data.length > 0 && typeof data[0] === 'object') {
          headers = Object.keys(data[0])
        }
      }
    } else if (goal === 'list') {
      // For listing, show data in tabular format
      if (Array.isArray(parsed)) {
        data = parsed
        if (data.length > 0 && typeof data[0] === 'object') {
          headers = Object.keys(data[0])
        }
      } else if (typeof parsed === 'object') {
        // Convert object to array for tabular display
        data = Object.entries(parsed).map(([key, value]) => ({ key, value }))
        headers = ['Property', 'Value']
      }
    }
  } catch {
    // If parsing fails, show as simple table
    data = [{ content: content }]
    headers = ['Content']
  }

  if (data.length === 0) {
    return <div className="text-gray-500">No tabular data to display</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.slice(0, 20).map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {headers.map((header, colIndex) => (
                <td key={colIndex} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 last:border-r-0">
                  {typeof row[header] === 'object'
                    ? JSON.stringify(row[header])
                    : String(row[header] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 20 && (
        <div className="text-sm text-gray-500 mt-2">
          Showing first 20 of {data.length} items
        </div>
      )}
    </div>
  )
}