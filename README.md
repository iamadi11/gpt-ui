# Dynamic UI System

A minimal proof-of-concept for true dynamic UI generation that accepts ANY text or JSON input and generates appropriate UI components based on inferred intent.

## Architecture

### Pipeline Flow

1. **Input Reception** → User pastes any text/JSON
2. **LLM Intent Inference** → Single API call analyzes content
3. **Intent Object** → Describes user intent, data nature, density, suggested views
4. **Intent Graph** → Array of nodes with type, content, affordance
5. **Component Selection** → Runtime composer picks components by affordance
6. **UI Rendering** → Dynamic components render the content

### Key Components

- **TextBlock**: Displays plain text content
- **StatCard**: Shows numeric metrics with labels
- **DataTable**: Renders tabular data collections
- **Chart**: Mock visualization component

### Intent Inference Logic

The system analyzes input to determine:
- **Data Nature**: `text`, `metrics`, `collection`, `visual`
- **Density**: `sparse`, `medium`, `dense`
- **Suggested Views**: Based on content patterns

## Usage

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Paste any text or JSON in the input box
4. Click "Generate Dynamic UI" to see the result

## Example Inputs

### Text Input
```
The company reported Q4 revenue of $2.3 billion, up 15% from last year.
```

### JSON Metrics
```json
{
  "revenue": 2300000000,
  "growth": 0.15,
  "customers": 45000,
  "churn_rate": 0.03
}
```

### JSON Collection
```json
[
  {"name": "Alice", "age": 30, "city": "NYC"},
  {"name": "Bob", "age": 25, "city": "LA"}
]
```

## Technical Details

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **No schemas**: Completely dynamic, no predefined field structures
- **Capability-based**: Components selected by affordance, not structure