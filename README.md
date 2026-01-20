# Conversational AI-Driven Dynamic UI System

A proof-of-concept system where AI models understand arbitrary input, generate UI designs, critique their own work for improvements, and allow users to provide follow-up queries for conversational refinement - all without hardcoded heuristics.

## 🎯 Core Philosophy

**"Intelligence over determinism. Explainability over completeness. Graceful degradation over correctness."**

The system behaves like a junior product designer + analyst, making intelligent UI decisions based on content analysis rather than rigid rules.

## 🏗️ Architecture

### 1. AI Reasoning Layer (Multi-Phase)
- **Phase 1 - Initial Analysis**: "Junior designer" LLM analyzes content and creates UI intent graph
- **Phase 2 - Critique & Refinement**: "Senior designer" LLM reviews and automatically improves the design
- **Phase 3 - Conversational Modification**: Users can provide follow-up queries to further refine the UI
- **Input**: Any text or JSON (no schemas, no trusted field names)
- **Output**: Iteratively refined "UI Intent Graph" with sections, goals, and confidence scores

### 2. Intent Graph Structure
```typescript
{
  "intentGraph": {
    "sectionName": {
      "goal": "summarize" | "compare" | "detect_trend" | "explore_raw" | ...,
      "confidence": 0.0-1.0,
      "description": "AI explanation of why this section makes sense"
    }
  }
}
```

### 3. Frontend Runtime Renderer
- **No Data Interpretation**: Frontend never analyzes raw input
- **Goal-to-Component Mapping**:
  - `summarize` → TextBlock (overview text)
  - `compare` → DataTable (side-by-side comparison)
  - `detect_trend` → Chart (time-series visualization)
  - `explore_raw` → TextBlock (JSON/raw viewer)
  - `aggregate` → StatCard (metric aggregation)
  - `visualize` → Chart (general charts)
  - `list` → DataTable (structured lists)
  - `highlight` → StatCard (emphasize values)

### 4. Confidence-Based Visual Rendering
- **High (≥80%)**: Full opacity, green styling, prominent display, expanded sections
- **Medium (60-79%)**: Faded opacity, yellow styling, collapsible sections with toggle
- **Low (<40%)**: Significantly faded, red styling, auto-collapsed with warning
- **Very Low (<40%)**: Minimal opacity, red styling, collapsed by default with fallback UI

#### Visual Effects Include:
- **Progressive Opacity**: Sections fade based on AI confidence levels
- **Size Scaling**: Lower confidence sections appear smaller
- **Color-Coded Borders**: Green/Yellow/Red confidence indicators
- **Animated Badges**: Hover effects and confidence progress bars
- **Collapsible Sections**: Auto-collapse low confidence content
- **Global Controls**: "Show All Sections" toggle for batch expansion
- **Attention Animations**: Subtle pulsing for uncertain sections

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Usage
1. Enter any text or JSON in the input field
2. Click "Generate Dynamic UI"
3. Watch as AI analyzes input and creates appropriate UI sections
4. Review AI reasoning in the debug panel
5. Observe confidence-based styling and fallbacks

## 🎮 Try These Examples

### Sales Metrics (Will trigger critique improvements)
```
Q3 Sales Report: Revenue increased 15% to $2.5M, up from $2.1M last quarter. Customer acquisition grew 8% to 1,247 new users.
```

### Complex JSON (Will be simplified by critique)
```json
[
  {"name": "Section A", "value": 100, "details": "..."},
  {"name": "Section B", "value": 150, "details": "..."},
  {"name": "Section C", "value": 75, "details": "..."},
  {"name": "Section D", "value": 200, "details": "..."},
  {"name": "Section E", "value": 50, "details": "..."}
]
```

### Simple JSON Data
```json
[
  {"user": "alice", "logins": 45, "purchases": 12},
  {"user": "bob", "logins": 23, "purchases": 8}
]
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/infer-intent/route.ts    # AI inference API endpoint
│   ├── page.tsx                     # Main UI with input form
│   └── layout.tsx                   # App layout
├── components/
│   ├── DynamicUIComposer.tsx        # AI intent graph renderer
│   ├── TextBlock.tsx               # Text display component
│   ├── StatCard.tsx                # Metrics/statistics component
│   ├── DataTable.tsx               # Tabular data component
│   ├── Chart.tsx                   # Chart visualization component
│   ├── LowConfidenceFallback.tsx   # Low confidence fallback
│   └── registry.ts                 # Component registry & mappings
├── types/
│   └── intent-graph.ts             # TypeScript type definitions
└── lib/
    └── ai-prompt.ts                # AI reasoning prompt
```

## 🔧 Key Design Decisions

### AI-First Approach
- **No hardcoded rules**: `if (array) → table` logic removed
- **AI decides everything**: Section names, goals, structure
- **Flexible schemas**: Intent graph can be any shape

### Component Capability Mapping
Components are selected by **what they can do**, not **what data looks like**:

```typescript
const GOAL_TO_CAPABILITY = {
  summarize: 'text',      // TextBlock for summaries
  compare: 'comparison',  // DataTable for comparisons
  detect_trend: 'trend',  // Chart for trends
  // ...
}
```

### Graceful Degradation
- Low confidence sections show warnings + raw data
- System works even with AI failures
- User always sees their input, even if AI can't interpret it

### Explainability
- AI intent graph is logged and visible in debug panel
- Confidence scores shown on each section
- AI reasoning descriptions included

## 🔮 Production Integration

### Real AI Integration
Replace mock AI in `src/app/api/infer-intent/route.ts`:

```typescript
// Mock implementation - replace with real AI
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: UI_INTENT_INFERENCE_PROMPT + input }]
  })
})
```

### Environment Variables
```bash
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=alternative_option
```

### Enhanced Components
- Replace mock charts with Chart.js/D3
- Add JSON syntax highlighting
- Implement collapsible sections
- Add export functionality

## 🎯 Design Philosophy

### Favor Intelligence Over Determinism
The system doesn't try to be "correct" for every input. Instead, it intelligently adapts to content, accepting that some interpretations will be imperfect but useful.

### Favor Explainability Over Completeness
Every AI decision is logged and explained. Users understand why they see what they see, even if the AI isn't perfect.

### Favor Graceful Degradation Over Correctness
When AI confidence is low, the system doesn't hide data - it shows the raw input with clear warnings about uncertainty.

### Self-Improving AI Architecture
The multi-phase system allows AI to learn from its own outputs through critique, while enabling users to provide conversational refinements for personalized UI experiences.

### Conversational UI Refinement
Users can iteratively modify the generated UI with natural language queries like "show only metrics", "hide charts", "simplify", or "add summary" - creating a collaborative human-AI design process.

## 📖 Examples & Documentation

See [`examples.md`](examples.md) for detailed input/output examples demonstrating how the AI reasoning works.

## 🤝 Contributing

This is a proof-of-concept demonstrating AI-driven UI generation. Key areas for extension:

1. **Real AI Integration**: Replace mock responses with actual LLM calls
2. **Enhanced Components**: Better charts, JSON viewers, interactive elements
3. **Performance**: Streaming responses, caching, background processing
4. **Testing**: AI output validation, component testing, end-to-end flows

## ⚖️ License

MIT License - feel free to experiment and build upon this concept!