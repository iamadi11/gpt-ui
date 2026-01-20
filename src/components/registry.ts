// Component registry - maps affordance types to React components
import { TextBlock } from './TextBlock'
import { StatCard } from './StatCard'
import { DataTable } from './DataTable'
import { Chart } from './Chart'

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