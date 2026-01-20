interface TextBlockProps {
  content: string
  affordance: string
}

export function TextBlock({ content, affordance }: TextBlockProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
        {content}
      </div>
    </div>
  )
}