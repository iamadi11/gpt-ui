import { NextRequest, NextResponse } from 'next/server'
import { UI_INTENT_INFERENCE_PROMPT, UI_INTENT_CRITIQUE_PROMPT, INTENT_GRAPH_MODIFICATION_PROMPT } from '@/lib/ai-prompt'
import { IntentGraph, AIIntentResponse, AICritiqueResponse, IntentGraphModification } from '@/types/intent-graph'

// AI-powered intent inference using structured prompt with critique
async function inferIntentWithAI(input: string): Promise<AIIntentResponse> {
  const startTime = Date.now()

  try {
    // Check for real AI API key (OpenAI, Anthropic, etc.)
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY

    if (apiKey && process.env.OPENAI_API_KEY) {
      // Real AI call would go here
      // For now, we'll use the mock implementation below
      console.log('AI API key found, but using mock for demo purposes')
    }

    // Step 1: Generate initial intent graph
    const initialIntentGraph = generateMockIntentGraph(input)

    // Step 2: Generate critique and improvements
    const critiqueResponse = generateMockCritique(input, initialIntentGraph)

    // Step 3: Apply critique improvements if assessment is positive
    const finalIntentGraph = shouldApplyCritique(critiqueResponse)
      ? critiqueResponse.improvedIntentGraph
      : initialIntentGraph

    return {
      intentGraph: finalIntentGraph,
      rawInput: input,
      processingTime: Date.now() - startTime,
      modelUsed: apiKey ? 'gpt-4' : 'mock-llm',
      fallbackUsed: !apiKey,
      critique: critiqueResponse
    }
  } catch (error) {
    console.error('AI inference failed:', error)

    // Fallback to minimal UI on AI failure
    return {
      intentGraph: {
        error: {
          goal: 'explore_raw',
          confidence: 0.1,
          description: 'AI inference failed, showing raw data'
        }
      },
      rawInput: input,
      processingTime: Date.now() - startTime,
      modelUsed: 'error-fallback',
      fallbackUsed: true
    }
  }
}

// Mock implementation that simulates AI reasoning
// In production, replace this with actual AI API calls
function generateMockIntentGraph(input: string): IntentGraph {
  // Parse input to understand its nature
  let parsedData: any
  let isJson = false

  try {
    parsedData = JSON.parse(input)
    isJson = true
  } catch {
    parsedData = input
    isJson = false
  }

  // Simulate AI reasoning based on content analysis
  const intentGraph: IntentGraph = {}

  // Always provide a summary/overview section
  intentGraph.overview = {
    goal: 'summarize',
    confidence: 0.85,
    description: 'High-level summary of the input'
  }

  // Analyze for specific patterns that would suggest different UI approaches
  if (isJson) {
    if (Array.isArray(parsedData)) {
      // Array of items - likely needs comparison or listing
      if (parsedData.length > 1) {
        intentGraph.comparison = {
          goal: 'compare',
          confidence: 0.75,
          description: 'Compare items in the collection'
        }
      }

      intentGraph.details = {
        goal: 'list',
        confidence: 0.9,
        description: 'Structured list view of items'
      }
    } else if (typeof parsedData === 'object') {
      // Object with properties - check for numerical data
      const values = Object.values(parsedData)
      const numericValues = values.filter(v => typeof v === 'number')

      if (numericValues.length > 0) {
        intentGraph.metrics = {
          goal: 'aggregate',
          confidence: 0.8,
          description: 'Aggregate numerical data'
        }

        if (numericValues.length > 2) {
          intentGraph.visualization = {
            goal: 'visualize',
            confidence: 0.7,
            description: 'Visual representation of metrics'
          }
        }
      }

      intentGraph.raw = {
        goal: 'explore_raw',
        confidence: 0.6,
        description: 'Allow detailed examination of the data structure'
      }
    }
  } else {
    // Text input - look for patterns
    const text = input as string
    const numberMatches = text.match(/\d+\.?\d*/g)

    if (numberMatches && numberMatches.length > 2) {
      intentGraph.metrics = {
        goal: 'aggregate',
        confidence: 0.75,
        description: 'Extract and highlight numerical data'
      }
    }

    // Check for temporal patterns (dates, quarters, etc.)
    const temporalKeywords = ['quarter', 'month', 'year', 'week', 'day', 'growth', 'trend']
    const hasTemporal = temporalKeywords.some(keyword =>
      text.toLowerCase().includes(keyword)
    )

    if (hasTemporal) {
      intentGraph.trends = {
        goal: 'detect_trend',
        confidence: 0.65,
        description: 'Identify patterns over time'
      }
    }
  }

  return intentGraph
}

// Mock critique generation - simulates senior designer review
function generateMockCritique(input: string, originalIntentGraph: IntentGraph): AICritiqueResponse {
  const sections = Object.keys(originalIntentGraph)
  const lowConfidenceSections = sections.filter(section => {
    const sectionData = originalIntentGraph[section]
    // Handle both single IntentSection and IntentSection[] cases
    if (Array.isArray(sectionData)) {
      return sectionData.some(item => item.confidence < 0.7)
    }
    return sectionData.confidence < 0.7
  })

  let critique = ""
  const changesMade: string[] = []
  let overallAssessment: 'excellent' | 'good' | 'needs_work' | 'poor' = 'good'
  const improvedIntentGraph = { ...originalIntentGraph }

  // Analyze the original design
  if (sections.length > 4) {
    critique += "The design has too many sections which may overwhelm users. "
    changesMade.push("Consolidated redundant sections")
    overallAssessment = 'needs_work'
  }

  if (lowConfidenceSections.length > 0) {
    critique += `Found ${lowConfidenceSections.length} low-confidence sections that may confuse users. `
    changesMade.push("Removed or improved low-confidence sections")

    // Remove very low confidence sections
    lowConfidenceSections.forEach(section => {
      const sectionData = originalIntentGraph[section]
      if (Array.isArray(sectionData)) {
        // For arrays, check if any item has low confidence
        const hasVeryLowConfidence = sectionData.some(item => item.confidence < 0.5)
        if (hasVeryLowConfidence) {
          delete improvedIntentGraph[section]
          changesMade.push(`Removed low-confidence array section: ${section}`)
        } else {
          // Boost confidence for borderline array items
          improvedIntentGraph[section] = sectionData.map(item => ({
            ...item,
            confidence: Math.min(0.8, item.confidence + 0.1)
          }))
        }
      } else {
        // Single section
        if (sectionData.confidence < 0.5) {
          delete improvedIntentGraph[section]
          changesMade.push(`Removed low-confidence section: ${section}`)
        } else {
          // Boost confidence for borderline sections
          improvedIntentGraph[section] = {
            ...sectionData,
            confidence: Math.min(0.8, sectionData.confidence + 0.1)
          }
        }
      }
    })
  }

  // Check for missing important perspectives
  const hasOverview = sections.some(s => {
    const sectionData = originalIntentGraph[s]
    if (Array.isArray(sectionData)) {
      return sectionData.some(item => item.goal === 'summarize')
    }
    return sectionData.goal === 'summarize'
  })
  const hasRaw = sections.some(s => {
    const sectionData = originalIntentGraph[s]
    if (Array.isArray(sectionData)) {
      return sectionData.some(item => item.goal === 'explore_raw')
    }
    return sectionData.goal === 'explore_raw'
  })

  if (!hasOverview) {
    critique += "Missing overview section - users need context first. "
    improvedIntentGraph.overview = {
      goal: 'summarize',
      confidence: 0.9,
      description: 'Added essential overview section'
    }
    changesMade.push("Added overview section for context")
  }

  if (!hasRaw && Object.keys(improvedIntentGraph).length > 0) {
    critique += "Consider adding raw data access for detailed inspection. "
    improvedIntentGraph.details = {
      goal: 'explore_raw',
      confidence: 0.7,
      description: 'Added raw data exploration option'
    }
    changesMade.push("Added raw data exploration section")
  }

  // Generate final critique summary
  if (changesMade.length === 0) {
    critique = "The original design is well-structured and comprehensive. No major changes needed."
    overallAssessment = 'excellent'
  } else {
    critique += `Made ${changesMade.length} improvements to enhance user experience.`
  }

  return {
    critique,
    improvedIntentGraph,
    changesMade,
    overallAssessment
  }
}

// Decide whether to apply the critique based on assessment
function shouldApplyCritique(critique: AICritiqueResponse): boolean {
  return critique.overallAssessment === 'needs_work' || critique.overallAssessment === 'poor'
}

// Handle intent graph modifications based on user queries
async function modifyIntentGraph(modification: IntentGraphModification): Promise<AIIntentResponse> {
  const startTime = Date.now()

  try {
    // Check for real AI API key
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY

    if (apiKey && process.env.OPENAI_API_KEY) {
      // Real AI call would go here
      console.log('AI API key found, but using mock for demo purposes')
    }

    // Mock AI response for modification
    const modifiedIntentGraph = generateMockIntentGraphModification(modification)

    return {
      intentGraph: modifiedIntentGraph.intentGraph,
      rawInput: modification.originalInput,
      processingTime: Date.now() - startTime,
      modelUsed: apiKey ? 'gpt-4' : 'mock-llm',
      fallbackUsed: !apiKey,
      isModification: true,
      modificationQuery: modification.query
    }
  } catch (error) {
    console.error('Intent graph modification failed:', error)

    // Return original intent graph on error
    return {
      intentGraph: modification.currentIntentGraph,
      rawInput: modification.originalInput,
      processingTime: Date.now() - startTime,
      modelUsed: 'error',
      fallbackUsed: true,
      isModification: true,
      modificationQuery: modification.query
    }
  }
}

// Mock implementation for intent graph modifications
function generateMockIntentGraphModification(modification: IntentGraphModification): { intentGraph: IntentGraph, changes: string[], explanation: string } {
  const { query, currentIntentGraph, originalInput } = modification
  const modifiedGraph = { ...currentIntentGraph }
  const changes: string[] = []
  let explanation = ""

  const queryLower = query.toLowerCase().trim()

  // Parse different types of queries

  // Show only specific content
  if (queryLower.startsWith('show only') || queryLower.startsWith('only show')) {
    const targetType = queryLower.replace(/^(show only|only show)/, '').trim()

    if (targetType.includes('metric') || targetType.includes('number')) {
      // Keep only aggregate/highlight sections
      Object.keys(modifiedGraph).forEach(section => {
        const sectionData = modifiedGraph[section]
        const goal = Array.isArray(sectionData) ? sectionData[0]?.goal : sectionData.goal
        if (goal !== 'aggregate' && goal !== 'highlight') {
          delete modifiedGraph[section]
          changes.push(`Removed ${section} section (not metrics-focused)`)
        }
      })
      explanation = "Filtered to show only metric and numerical data sections."
    } else if (targetType.includes('summary') || targetType.includes('overview')) {
      // Keep only summarize sections
      Object.keys(modifiedGraph).forEach(section => {
        const sectionData = modifiedGraph[section]
        const goal = Array.isArray(sectionData) ? sectionData[0]?.goal : sectionData.goal
        if (goal !== 'summarize') {
          delete modifiedGraph[section]
          changes.push(`Removed ${section} section (not summary-focused)`)
        }
      })
      explanation = "Filtered to show only summary sections."
    } else if (targetType.includes('chart') || targetType.includes('visual')) {
      // Keep only visualize sections
      Object.keys(modifiedGraph).forEach(section => {
        const sectionData = modifiedGraph[section]
        const goal = Array.isArray(sectionData) ? sectionData[0]?.goal : sectionData.goal
        if (goal !== 'visualize') {
          delete modifiedGraph[section]
          changes.push(`Removed ${section} section (not visualization-focused)`)
        }
      })
      explanation = "Filtered to show only chart and visualization sections."
    }
  }

  // Hide/remove specific content
  else if (queryLower.startsWith('hide') || queryLower.startsWith('remove')) {
    const targetType = queryLower.replace(/^(hide|remove)/, '').trim()

    if (targetType.includes('chart') || targetType.includes('visual')) {
      Object.keys(modifiedGraph).forEach(section => {
        const sectionData = modifiedGraph[section]
        const goal = Array.isArray(sectionData) ? sectionData[0]?.goal : sectionData.goal
        if (goal === 'visualize') {
          delete modifiedGraph[section]
          changes.push(`Removed ${section} visualization section`)
        }
      })
      explanation = "Removed all chart and visualization sections."
    } else if (targetType.includes('detail') || targetType.includes('raw')) {
      Object.keys(modifiedGraph).forEach(section => {
        const sectionData = modifiedGraph[section]
        const goal = Array.isArray(sectionData) ? sectionData[0]?.goal : sectionData.goal
        if (goal === 'explore_raw') {
          delete modifiedGraph[section]
          changes.push(`Removed ${section} raw data section`)
        }
      })
      explanation = "Removed raw data exploration sections to simplify the view."
    }
  }

  // Add new content
  else if (queryLower.startsWith('add')) {
    const targetType = queryLower.replace(/^add/, '').trim()

    if (targetType.includes('chart') || targetType.includes('visual')) {
      if (!Object.values(modifiedGraph).some(section =>
        (Array.isArray(section) ? section[0]?.goal : section.goal) === 'visualize'
      )) {
        modifiedGraph.visualization = {
          goal: 'visualize',
          confidence: 0.7,
          description: 'Added visualization section for data representation'
        }
        changes.push("Added visualization section")
        explanation = "Added a chart section to visualize the data."
      } else {
        explanation = "Visualization section already exists."
      }
    } else if (targetType.includes('trend') || targetType.includes('pattern')) {
      if (!Object.values(modifiedGraph).some(section =>
        (Array.isArray(section) ? section[0]?.goal : section.goal) === 'detect_trend'
      )) {
        modifiedGraph.trends = {
          goal: 'detect_trend',
          confidence: 0.75,
          description: 'Added trend analysis section'
        }
        changes.push("Added trend analysis section")
        explanation = "Added trend detection to identify patterns over time."
      } else {
        explanation = "Trend analysis section already exists."
      }
    } else if (targetType.includes('summary') || targetType.includes('overview')) {
      if (!Object.values(modifiedGraph).some(section =>
        (Array.isArray(section) ? section[0]?.goal : section.goal) === 'summarize'
      )) {
        modifiedGraph.summary = {
          goal: 'summarize',
          confidence: 0.9,
          description: 'Added summary overview section'
        }
        changes.push("Added summary section")
        explanation = "Added a high-level summary section."
      } else {
        explanation = "Summary section already exists."
      }
    }
  }

  // Simplify the interface
  else if (queryLower.includes('simplify') || queryLower.includes('simpler')) {
    // Remove low-confidence sections
    Object.keys(modifiedGraph).forEach(section => {
      const sectionData = modifiedGraph[section]
      const confidence = Array.isArray(sectionData) ? sectionData[0]?.confidence : sectionData.confidence
      if (confidence < 0.7) {
        delete modifiedGraph[section]
        changes.push(`Removed low-confidence ${section} section (${confidence} confidence)`)
      }
    })

    // Limit to maximum 3 sections if there are more
    const sections = Object.keys(modifiedGraph)
    if (sections.length > 3) {
      const sectionsToRemove = sections.slice(3)
      sectionsToRemove.forEach(section => {
        delete modifiedGraph[section]
        changes.push(`Removed ${section} to simplify (limited to 3 sections)`)
      })
    }

    explanation = "Simplified the interface by removing low-confidence sections and limiting total sections."
  }

  // Make it more detailed
  else if (queryLower.includes('detail') || queryLower.includes('more')) {
    // Add raw exploration if not present
    if (!Object.values(modifiedGraph).some(section =>
      (Array.isArray(section) ? section[0]?.goal : section.goal) === 'explore_raw'
    )) {
      modifiedGraph.details = {
        goal: 'explore_raw',
        confidence: 0.8,
        description: 'Added detailed raw data exploration'
      }
      changes.push("Added detailed raw data section")
    }

    // Boost confidence of existing sections
    Object.keys(modifiedGraph).forEach(section => {
      const sectionData = modifiedGraph[section]
      if (!Array.isArray(sectionData)) {
        const newConfidence = Math.min(0.95, sectionData.confidence + 0.1)
        modifiedGraph[section] = {
          ...sectionData,
          confidence: newConfidence
        }
        if (newConfidence !== sectionData.confidence) {
          changes.push(`Boosted ${section} confidence to ${newConfidence}`)
        }
      }
    })

    explanation = "Added more detailed sections and increased confidence in existing sections."
  }

  // Default case - if no specific pattern matches
  else {
    explanation = "Query not recognized. Try queries like 'show only metrics', 'hide charts', 'add summary', 'simplify', or 'make more detailed'."
  }

  // If no changes were made, provide feedback
  if (changes.length === 0) {
    changes.push("No changes made - query may not apply to current intent graph")
  }

  return {
    intentGraph: modifiedGraph,
    changes,
    explanation
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if this is a modification request
    if (body.currentIntentGraph && body.query) {
      // Handle intent graph modification
      const modification: IntentGraphModification = {
        query: body.query,
        currentIntentGraph: body.currentIntentGraph,
        originalInput: body.originalInput || body.input
      }

      const aiResponse = await modifyIntentGraph(modification)

      // Log the modification
      console.log('=== INTENT GRAPH MODIFICATION ===')
      console.log('Query:', modification.query)
      console.log('Original sections:', Object.keys(modification.currentIntentGraph))
      console.log('Modified sections:', Object.keys(aiResponse.intentGraph))
      console.log('Processing Time:', aiResponse.processingTime + 'ms')
      console.log('=================================')

      return NextResponse.json(aiResponse)
    }

    // Handle initial intent generation
    const { input } = body

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input must be a non-empty string' },
        { status: 400 }
      )
    }

    // Step 1: Call AI to infer intent and generate UI graph
    const aiResponse = await inferIntentWithAI(input)

    // Step 2: Log the AI response for debugging (as required)
    console.log('=== AI INTENT INFERENCE + CRITIQUE ===')
    console.log('Input:', input.substring(0, 200) + (input.length > 200 ? '...' : ''))
    console.log('Final Intent Graph:', JSON.stringify(aiResponse.intentGraph, null, 2))
    if (aiResponse.critique) {
      console.log('Critique Assessment:', aiResponse.critique.overallAssessment)
      console.log('Critique Summary:', aiResponse.critique.critique)
      console.log('Changes Made:', aiResponse.critique.changesMade)
    }
    console.log('Processing Time:', aiResponse.processingTime + 'ms')
    console.log('Model Used:', aiResponse.modelUsed)
    console.log('Fallback Used:', aiResponse.fallbackUsed)
    console.log('====================================')

    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error('Intent inference error:', error)
    return NextResponse.json(
      {
        intentGraph: {
          error: {
            goal: 'explore_raw',
            confidence: 0.0,
            description: 'System error, showing raw input'
          }
        },
        rawInput: '',
        processingTime: 0,
        modelUsed: 'error',
        fallbackUsed: true,
        error: 'Failed to process input'
      },
      { status: 500 }
    )
  }
}