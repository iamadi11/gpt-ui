import { componentRegistry, type IntentNode } from './registry'

interface DynamicUIComposerProps {
  intentGraph: IntentNode[]
}

// Step 5: Runtime UI composer that selects components based on affordance
export function DynamicUIComposer({ intentGraph }: DynamicUIComposerProps) {
  if (!intentGraph || intentGraph.length === 0) {
    return <div className="text-gray-500">No UI to render</div>
  }

  return (
    <div className="space-y-6">
      {intentGraph.map((node, index) => {
        const Component = componentRegistry[node.type]

        if (!Component) {
          return (
            <div key={index} className="text-red-500">
              Unknown component type: {node.type}
            </div>
          )
        }

        // Render component based on its type and affordance
        return (
          <div key={index} className="dynamic-component">
            <Component content={node.content} affordance={node.affordance} />
          </div>
        )
      })}
    </div>
  )
}