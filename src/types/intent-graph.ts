// AI-Generated Intent Graph Types
// Schema-light structure allowing AI to decide sections, goals, and confidence

export interface IntentSection {
  goal: string // AI decides: 'summarize', 'compare', 'detect_trend', 'explore_raw', etc.
  confidence: number // 0.0 to 1.0 - AI's confidence in this interpretation
  description?: string // Optional AI explanation of why this section makes sense
}

export interface IntentGraph {
  // AI decides the section names and structure
  // Can be nested objects, arrays, or any structure the AI finds appropriate
  [sectionName: string]: IntentSection | IntentSection[]
}

// Component capability mapping
// Maps AI goals to component capabilities
export const GOAL_TO_CAPABILITY = {
  summarize: 'text',
  compare: 'comparison',
  detect_trend: 'trend',
  explore_raw: 'raw',
  aggregate: 'metrics',
  visualize: 'chart',
  list: 'table',
  highlight: 'metric'
} as const

export type GoalType = keyof typeof GOAL_TO_CAPABILITY
export type CapabilityType = typeof GOAL_TO_CAPABILITY[GoalType]

// AI Critique Response
export interface AICritiqueResponse {
  critique: string
  improvedIntentGraph: IntentGraph
  changesMade: string[]
  overallAssessment: 'excellent' | 'good' | 'needs_work' | 'poor'
}

// Intent Graph Modification Request
export interface IntentGraphModification {
  query: string // User's natural language query
  currentIntentGraph: IntentGraph // The existing intent graph to modify
  originalInput: string // The original raw input for context
}

// AI Response wrapper
export interface AIIntentResponse {
  intentGraph: IntentGraph
  rawInput: string
  processingTime: number
  modelUsed: string
  fallbackUsed?: boolean // True if we fell back due to AI failure
  critique?: AICritiqueResponse // Optional critique from second AI call
  isModification?: boolean // True if this is a modification of existing intent graph
  modificationQuery?: string // The query that triggered this modification
}

// Confidence thresholds for UI decisions
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4
} as const