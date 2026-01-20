// Component registry - maps AI goals to React components via capabilities
import { TextBlock } from './TextBlock'
import { StatCard } from './StatCard'
import { DataTable } from './DataTable'
import { Chart } from './Chart'
import { LowConfidenceFallback } from './LowConfidenceFallback'
import { GOAL_TO_CAPABILITY, type GoalType, type CapabilityType } from '@/types/intent-graph'

// Map capabilities to specific components
export const CAPABILITY_TO_COMPONENT = {
  text: TextBlock,        // For summarize goals
  comparison: DataTable,  // For compare goals
  trend: Chart,          // For detect_trend goals
  raw: TextBlock,        // For explore_raw goals (could be enhanced JSON viewer)
  metrics: StatCard,     // For aggregate/highlight goals
  chart: Chart,          // For visualize goals
  table: DataTable,      // For list goals
  metric: StatCard       // For highlight goals
} as const

// Convert AI goal to React component
export function getComponentForGoal(goal: GoalType) {
  const capability = GOAL_TO_CAPABILITY[goal]
  return CAPABILITY_TO_COMPONENT[capability] || TextBlock // Fallback to TextBlock
}

// Legacy types for backward compatibility during transition
export type ComponentType = 'text' | 'metric' | 'collection' | 'visual'

export const componentRegistry = {
  text: TextBlock,
  metric: StatCard,
  collection: DataTable,
  visual: Chart,
} as const

export type IntentNode = {
  type: ComponentType
  content: any
  affordance: string
}

// New AI-driven node type
export interface AINode {
  sectionName: string
  goal: GoalType
  content: any // The raw input data
  confidence: number
  description?: string
}