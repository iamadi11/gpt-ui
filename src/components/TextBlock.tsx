interface TextBlockProps {
  content: any
  goal: string
}

export function TextBlock({ content, goal }: TextBlockProps) {
  // Handle different content types based on goal
  let displayContent = content

  if (goal === 'explore_raw') {
    // For raw exploration, try to pretty-print JSON if possible
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content
      displayContent = JSON.stringify(parsed, null, 2)
    } catch {
      displayContent = content
    }
  } else if (goal === 'summarize') {
    // For summarization, extract key points (simple implementation)
    displayContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
  }

  return (
    <div className="prose prose-sm max-w-none">
      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-mono text-sm">
        {displayContent}
      </div>
    </div>
  )
}