// CardBlock Component
//
// MAPPING: "card" UI primitive → Highlighted card display
// PURPOSE: Emphasize important information or key metrics
// STYLING: Prominent card with centered content

interface CardBlockProps {
  title: string
  content: string
  confidence: number
  intent: string
}

export function CardBlock({ title, content, confidence, intent }: CardBlockProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 shadow-sm">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="text-3xl font-bold text-blue-600 mb-3">{content}</div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600 capitalize">{intent}</span>
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
  )
}