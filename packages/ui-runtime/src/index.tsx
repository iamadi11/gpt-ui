import React from 'react'
import type {
  UIDescription,
  UISection,
  UIPrimitive,
  UIRenderContext,
  UITheme,
  UIAccessibility
} from '@gpt-ui/schema'

// Generic UI Runtime Engine
//
// FEATURES:
// - No hardcoded UI logic - purely schema-driven
// - Pluggable component registry
// - Theme and accessibility support
// - Error boundaries and fallbacks
// - Performance optimizations
//
// ARCHITECTURE:
// - Component registry maps primitives to React components
// - Render pipeline validates and transforms schema
// - Context provides theme/accessibility/device info

export interface UIRuntimeOptions {
  theme?: UITheme
  accessibility?: UIAccessibility
  density?: 'compact' | 'normal' | 'comfortable'
  componentRegistry?: ComponentRegistry
  enableValidation?: boolean
  enableSandbox?: boolean
}

export interface ComponentRegistry {
  [key: string]: React.ComponentType<any>
}

// Default component implementations
const DefaultComponents = {
  text: ({ content, className, ...props }: any) => (
    <div className={`text-gray-700 whitespace-pre-wrap leading-relaxed ${className || ''}`} {...props}>
      {content}
    </div>
  ),

  card: ({ title, content, confidence, intent, className, children, ...props }: any) => (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className || ''}`} {...props}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 capitalize">{intent}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              confidence > 0.8 ? 'bg-green-100 text-green-800' :
              confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      )}
      {content && (
        <div className="text-gray-700">
          {content}
        </div>
      )}
      {children}
    </div>
  ),

  table: ({ title, data, confidence, intent, className, ...props }: any) => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className || ''}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500">No data available</p>
        </div>
      )
    }

    const headers = Object.keys(data[0])
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className || ''}`} {...props}>
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 capitalize">{intent}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                confidence > 0.8 ? 'bg-green-100 text-green-800' :
                confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index}>
                  {headers.map(header => (
                    <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {String(row[header] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  },

  chart: ({ title, data, confidence, intent, className, ...props }: any) => (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className || ''}`} {...props}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 capitalize">{intent}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              confidence > 0.8 ? 'bg-green-100 text-green-800' :
              confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded">
        <p className="text-gray-500">Chart visualization not yet implemented</p>
      </div>
      {data && (
        <pre className="mt-4 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  ),

}


export class UIRuntime {
  constructor(private options: UIRuntimeOptions = {}) {}

  // Render UI description to React elements
  render(uiDescription: UIDescription | null, context?: UIRenderContext): React.ReactElement {
    if (!uiDescription) {
      return this.renderError('No UI description provided')
    }

    if (!this.validateUIDescription(uiDescription)) {
      return this.renderError('Invalid UI description structure')
    }

    try {
      const sections = uiDescription.sections.map(section =>
        this.renderSection(section, context)
      )

      const layoutClass = this.getLayoutClass(uiDescription.layout)

      return (
        <div className={`ui-runtime ${layoutClass}`}>
          {/* Overall confidence indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>AI Confidence:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              uiDescription.confidence > 0.8 ? 'bg-green-100 text-green-800' :
              uiDescription.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {Math.round(uiDescription.confidence * 100)}%
            </span>
          </div>

          {/* Render sections */}
          {sections}
        </div>
      )
    } catch (error) {
      return this.renderError(`Render error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Render individual section
  private renderSection(section: UISection, context?: UIRenderContext): React.ReactElement {
    const Component = this.getComponent(section.ui)
    if (!Component) {
      return (
        <div key={section.id} className="bg-white border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-500">⚠️</span>
            <h3 className="text-lg font-semibold text-yellow-900">Unknown Component</h3>
          </div>
          <p className="text-yellow-700">
            Unknown UI primitive: "{section.ui}"
          </p>
          <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {JSON.stringify(section, null, 2)}
          </pre>
        </div>
      )
    }

    return (
      <Component
        key={section.id}
        {...section}
        className={this.getSectionClassName(section, context)}
      />
    )
  }

  // Get component from registry
  private getComponent(primitive: UIPrimitive): React.ComponentType<any> | null {
    const registry = this.options.componentRegistry || DefaultComponents
    return registry[primitive] || null
  }

  // Get layout CSS class
  private getLayoutClass(layout: string): string {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap gap-4'
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      case 'vertical':
      default:
        return 'space-y-6'
    }
  }

  // Get section-specific CSS class
  private getSectionClassName(section: UISection, context?: UIRenderContext): string {
    const classes = []

    // Density classes
    if (this.options.density === 'compact') {
      classes.push('p-2')
    } else if (this.options.density === 'comfortable') {
      classes.push('p-6')
    }

    // Theme classes
    if (this.options.theme?.mode === 'dark') {
      classes.push('dark')
    }

    // Accessibility classes
    if (this.options.accessibility?.highContrast) {
      classes.push('high-contrast')
    }

    return classes.join(' ')
  }

  // Render error state
  private renderError(message: string): React.ReactElement {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-red-500">⚠️</span>
          <h3 className="text-lg font-semibold text-red-900">UI Render Error</h3>
        </div>
        <p className="text-red-700">{message}</p>
      </div>
    )
  }

  // Validate UI description structure
  private validateUIDescription(uiDescription: UIDescription): boolean {
    if (!this.options.enableValidation) return true

    return (
      typeof uiDescription === 'object' &&
      typeof uiDescription.confidence === 'number' &&
      typeof uiDescription.layout === 'string' &&
      Array.isArray(uiDescription.sections) &&
      uiDescription.sections.every(section =>
        typeof section === 'object' &&
        typeof section.id === 'string' &&
        typeof section.title === 'string' &&
        typeof section.intent === 'string' &&
        typeof section.ui === 'string' &&
        typeof section.confidence === 'number'
      )
    )
  }

  // Register custom component
  registerComponent(primitive: UIPrimitive, component: React.ComponentType<any>): void {
    if (!this.options.componentRegistry) {
      this.options.componentRegistry = { ...DefaultComponents }
    }
    this.options.componentRegistry[primitive] = component
  }

  // Update runtime options
  updateOptions(newOptions: Partial<UIRuntimeOptions>): void {
    this.options = { ...this.options, ...newOptions }
  }
}

// React hook for using UI runtime
export function useUIRuntime(options?: UIRuntimeOptions) {
  return React.useMemo(() => new UIRuntime(options), [options])
}

// React component wrapper
export const UIRenderer: React.FC<{
  uiDescription: UIDescription | null
  context?: UIRenderContext
  runtime?: UIRuntime
  className?: string
}> = ({ uiDescription, context, runtime, className }) => {
  const defaultRuntime = useUIRuntime()
  const activeRuntime = runtime || defaultRuntime

  return (
    <div className={className}>
      {activeRuntime.render(uiDescription, context)}
    </div>
  )
}

// Export default components for customization
export { DefaultComponents }