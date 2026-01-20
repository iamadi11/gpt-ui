interface DataTableProps {
  content: any
  affordance: string
}

export function DataTable({ content, affordance }: DataTableProps) {
  // Handle different data formats
  let data: any[] = []
  let headers: string[] = []

  if (Array.isArray(content)) {
    data = content
    if (data.length > 0 && typeof data[0] === 'object') {
      headers = Object.keys(data[0])
    }
  } else if (typeof content === 'object') {
    // Convert object to array of key-value pairs
    data = Object.entries(content).map(([key, value]) => ({ key, value }))
    headers = ['key', 'value']
  }

  if (data.length === 0) {
    return <div className="text-gray-500">No data to display</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.slice(0, 10).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof row[header] === 'object'
                    ? JSON.stringify(row[header])
                    : String(row[header] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 10 && (
        <div className="text-sm text-gray-500 mt-2">
          Showing first 10 of {data.length} items
        </div>
      )}
    </div>
  )
}