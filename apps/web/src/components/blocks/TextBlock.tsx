// TextBlock Component
//
// MAPPING: "text" UI primitive → Text display
// PURPOSE: Display formatted text content from AI
// STYLING: Clean, readable text with basic formatting

interface TextBlockProps {
  title: string
  content: string
  confidence: number
  intent: string
}

export function TextBlock({ title, content, confidence, intent }: TextBlockProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
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
      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  )
}