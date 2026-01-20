import { NextRequest, NextResponse } from 'next/server'

interface Intent {
  userIntent: string
  dataNature: string
  density: 'sparse' | 'medium' | 'dense'
  suggestedViews: string[]
}

// Mock LLM inference - in production, this would call OpenAI/Anthropic/etc
async function inferIntent(input: string): Promise<Intent> {
  // Step 2: Analyze input to determine intent
  // This simulates what an LLM would do based on the input content

  let dataNature = 'text'
  let density: 'sparse' | 'medium' | 'dense' = 'sparse'
  let suggestedViews: string[] = ['text']

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(input)

    // Analyze JSON structure
    if (Array.isArray(parsed)) {
      dataNature = 'collection'
      density = parsed.length > 10 ? 'dense' : 'medium'
      suggestedViews = ['table', 'cards']
    } else if (typeof parsed === 'object') {
      const keys = Object.keys(parsed)
      const numericValues = Object.values(parsed).filter(v => typeof v === 'number')

      if (numericValues.length > keys.length * 0.5) {
        dataNature = 'metrics'
        suggestedViews = ['stats', 'chart']
      } else if (keys.length > 5) {
        dataNature = 'collection'
        suggestedViews = ['table', 'cards']
      } else {
        dataNature = 'text'
        suggestedViews = ['text']
      }
    }
  } catch {
    // Not JSON, treat as text
    const wordCount = input.split(/\s+/).length
    density = wordCount > 100 ? 'dense' : wordCount > 20 ? 'medium' : 'sparse'

    // Look for patterns in text
    const numberMatches = input.match(/\d+\.?\d*/g)
    console.log('API input:', input)
    console.log('Number matches:', numberMatches)
    console.log('Match count:', numberMatches?.length || 0)

    if (/\d+\.?\d*/g.test(input) && numberMatches && numberMatches.length > 3) {
      dataNature = 'metrics'
      suggestedViews = ['stats']
      console.log('Classified as metrics')
    } else {
      console.log('Classified as text')
    }
  }

  // Determine user intent based on content patterns
  let userIntent = 'Display information'
  if (dataNature === 'metrics') {
    userIntent = 'Show key metrics and statistics'
  } else if (dataNature === 'collection') {
    userIntent = 'Display structured data collection'
  } else if (density === 'dense') {
    userIntent = 'Present detailed information'
  }

  return {
    userIntent,
    dataNature,
    density,
    suggestedViews
  }
}

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input must be a non-empty string' },
        { status: 400 }
      )
    }

    // Step 1: Call "LLM" (mocked)
    const intent = await inferIntent(input)

    return NextResponse.json(intent)
  } catch (error) {
    console.error('Intent inference error:', error)
    return NextResponse.json(
      { error: 'Failed to process input' },
      { status: 500 }
    )
  }
}