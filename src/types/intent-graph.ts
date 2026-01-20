// Basic Intent Graph Types for POC
// Simple structure for AI-driven UI sections

export interface IntentSection {
  goal: string // AI decides: 'summarize', 'visualize', 'list', 'explore_raw'
  confidence: number // 0.0 to 1.0 - AI's confidence in this interpretation
  description?: string // Optional AI explanation
}

export interface IntentGraph {
  // AI decides the section names and structure
  [sectionName: string]: IntentSection
}

// Confidence thresholds for simple UI decisions
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4
} as const