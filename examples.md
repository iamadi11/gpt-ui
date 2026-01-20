# AI-Driven Dynamic UI System - Examples

This document demonstrates how the AI reasoning layer analyzes arbitrary input, generates UI Intent Graphs, and then critiques its own work to suggest improvements.

## Architecture Overview

1. **AI Reasoning Layer**: LLM analyzes raw input and outputs intent graph
2. **Frontend Runtime**: Maps AI goals to components (summarize→TextBlock, compare→DataTable, etc.)
3. **Graceful Degradation**: Low confidence sections show raw data with warnings

## Example Inputs and AI Responses

### Example 1: Sales Metrics Text

**Input:**
```
Q3 Sales Report: Revenue increased 15% to $2.5M, up from $2.1M last quarter. Customer acquisition grew 8% to 1,247 new users. Churn rate decreased 3% to 4.2%.
```

**Expected AI Intent Graph:**
```json
{
  "intentGraph": {
    "overview": {
      "goal": "summarize",
      "confidence": 0.95,
      "description": "High-level summary of key business metrics"
    },
    "metrics": {
      "goal": "aggregate",
      "confidence": 0.88,
      "description": "Extract and display key performance indicators"
    },
    "trends": {
      "goal": "detect_trend",
      "confidence": 0.82,
      "description": "Identify growth patterns over time"
    }
  }
}
```

**Rendered UI:**
- TextBlock (overview) - Summary text
- StatCard (metrics) - Revenue: $2.5M, Growth: 15%, etc.
- Chart (trends) - Line chart showing quarterly changes

**AI Critique Process:**
```
Assessment: GOOD
Critique: The original design covers key metrics well, but the trend section has low confidence (0.65). Consider boosting confidence or removing if not essential.
Changes Made:
- Improved confidence score for trends section from 0.65 to 0.75
- Added raw data exploration section for completeness
```

---

### Example 1b: Critique Improves Design

**Input:**
```json
[
  {"name": "Section A", "value": 100, "details": "..."},
  {"name": "Section B", "value": 150, "details": "..."},
  {"name": "Section C", "value": 75, "details": "..."},
  {"name": "Section D", "value": 200, "details": "..."},
  {"name": "Section E", "value": 50, "details": "..."}
]
```

**Initial AI Intent Graph (Junior Designer):**
```json
{
  "overview": { "goal": "summarize", "confidence": 0.8 },
  "comparison": { "goal": "compare", "confidence": 0.7 },
  "list": { "goal": "list", "confidence": 0.9 },
  "chart": { "goal": "visualize", "confidence": 0.6 },
  "details": { "goal": "explore_raw", "confidence": 0.5 }
}
```

**AI Critique (Senior Designer):**
```
Assessment: NEEDS_WORK
Critique: Too many sections (5 total) may overwhelm users. The chart section has low confidence (0.6) and details section (0.5) may not add value. Consider consolidating and removing low-value sections.
Changes Made:
- Removed low-confidence chart section (0.6 confidence)
- Removed redundant details section (0.5 confidence)
- Combined comparison and list into single data view
- Improved section naming for clarity
```

**Improved Intent Graph:**
```json
{
  "summary": { "goal": "summarize", "confidence": 0.85 },
  "data_view": { "goal": "list", "confidence": 0.9 },
  "raw_data": { "goal": "explore_raw", "confidence": 0.7 }
}
```

**Result:** Simplified from 5 sections to 3, removed low-value sections, clearer naming.

---

### Example 2: JSON User Activity Data

**Input:**
```json
[
  {"user": "alice", "logins": 45, "purchases": 12, "last_active": "2024-01-15"},
  {"user": "bob", "logins": 23, "purchases": 8, "last_active": "2024-01-10"},
  {"user": "charlie", "logins": 67, "purchases": 15, "last_active": "2024-01-16"}
]
```

**Expected AI Intent Graph:**
```json
{
  "intentGraph": {
    "user_comparison": {
      "goal": "compare",
      "confidence": 0.90,
      "description": "Compare user engagement metrics across different users"
    },
    "activity_summary": {
      "goal": "aggregate",
      "confidence": 0.85,
      "description": "Show total metrics across all users"
    },
    "raw_data": {
      "goal": "explore_raw",
      "confidence": 0.70,
      "description": "Allow detailed examination of user records"
    }
  }
}
```

**Rendered UI:**
- DataTable (user_comparison) - Side-by-side user comparison
- StatCard (activity_summary) - Total logins: 135, Total purchases: 35, etc.
- TextBlock (raw_data) - JSON viewer with syntax highlighting

---

### Example 3: Complex Nested JSON Configuration

**Input:**
```json
{
  "app": {
    "version": "2.1.0",
    "features": ["auth", "dashboard", "reports"],
    "config": {
      "database": {"host": "db.example.com", "port": 5432},
      "cache": {"ttl": 3600, "size": "1GB"}
    }
  },
  "metrics": {
    "uptime": 99.7,
    "response_time": 245,
    "error_rate": 0.02
  }
}
```

**Expected AI Intent Graph:**
```json
{
  "intentGraph": {
    "configuration": {
      "goal": "list",
      "confidence": 0.75,
      "description": "Display application configuration settings"
    },
    "performance": {
      "goal": "highlight",
      "confidence": 0.88,
      "description": "Emphasize key performance metrics"
    },
    "structure": {
      "goal": "explore_raw",
      "confidence": 0.60,
      "description": "Show full configuration structure"
    }
  }
}
```

**Rendered UI:**
- DataTable (configuration) - Flattened config key-value pairs
- StatCard (performance) - Uptime: 99.7%, Response Time: 245ms, etc.
- TextBlock (structure) - Pretty-printed JSON

---

### Example 4: Low Confidence Scenario

**Input:**
```
xyz123 abc789 def456 ghi012 jkl345 mno678 pqr901 stu234 vwx567 yza890
```

**Expected AI Intent Graph:**
```json
{
  "intentGraph": {
    "content": {
      "goal": "explore_raw",
      "confidence": 0.15,
      "description": "Unable to determine meaningful structure, showing raw input"
    }
  }
}
```

**Rendered UI:**
- LowConfidenceFallback - Shows warning and raw text since confidence < 40%

---

### Example 5: Mixed Content Analysis

**Input:**
```
Project Status: Alpha release delayed by 2 weeks due to testing issues.
Budget: $450K allocated, $380K spent (84% utilization).
Team: 12 developers, 3 designers, 2 QA engineers.
Risks: High - dependency on third-party API that has 15% downtime.
Timeline: Launch now targeted for Q2 2024.
```

**Expected AI Intent Graph:**
```json
{
  "intentGraph": {
    "status_summary": {
      "goal": "summarize",
      "confidence": 0.92,
      "description": "Project status overview and key takeaways"
    },
    "financials": {
      "goal": "aggregate",
      "confidence": 0.88,
      "description": "Budget and spending metrics"
    },
    "team_breakdown": {
      "goal": "visualize",
      "confidence": 0.78,
      "description": "Team composition visualization"
    },
    "risk_assessment": {
      "goal": "highlight",
      "confidence": 0.85,
      "description": "Critical risk factors requiring attention"
    }
  }
}
```

**Rendered UI:**
- TextBlock (status_summary) - Narrative summary
- StatCard (financials) - Budget metrics
- Chart (team_breakdown) - Pie chart of team roles
- TextBlock (risk_assessment) - Highlighted risk information

## Component Capability Mapping

| AI Goal | Component | Purpose |
|---------|-----------|---------|
| `summarize` | TextBlock | High-level overview text |
| `compare` | DataTable | Side-by-side comparisons |
| `detect_trend` | Chart | Time-series visualizations |
| `explore_raw` | TextBlock | Raw data inspection |
| `aggregate` | StatCard | Metric aggregation |
| `visualize` | Chart | General data visualization |
| `list` | DataTable | Structured list display |
| `highlight` | StatCard | Emphasize key values |

## Confidence Thresholds & Visual Effects

- **High (≥80%)**: Full opacity, green styling, prominent display, expanded by default
- **Medium (60-79%)**: Slightly faded, yellow styling, collapsible sections
- **Low (<40%)**: More faded, red styling, auto-collapsed, LowConfidenceFallback component
- **Very Low (<40%)**: Significantly faded, red styling, collapsed by default

### Visual Confidence Indicators

- **Opacity Scaling**: Sections fade based on confidence (high = 100%, low = 60%)
- **Size Scaling**: Lower confidence sections appear slightly smaller
- **Color Coding**: Green (high), Yellow (medium), Red (low) border backgrounds
- **Animated Badges**: Confidence percentages with visual progress indicators
- **Collapsible Sections**: Medium/low confidence sections auto-collapse
- **Global Toggle**: "Show All Sections" button to expand all low-confidence content
- **Attention Animation**: Low confidence sections pulse gently to draw attention
- **Filter Effects**: Brightness and saturation adjustments for visual hierarchy

## Follow-Up Query Examples

After initial UI generation, users can refine the interface with natural language queries:

### Content Filtering
- **"show only metrics"** → Removes all sections except numerical data
- **"show only summary"** → Keeps only overview/summary sections
- **"hide charts"** → Removes all visualization sections
- **"hide details"** → Removes raw data exploration sections

### Content Addition
- **"add summary"** → Adds a high-level overview section
- **"add trends"** → Adds pattern detection over time
- **"add chart"** → Adds data visualization

### Interface Simplification
- **"simplify"** → Removes low-confidence sections, limits to 3 sections max
- **"make more detailed"** → Adds raw exploration, boosts confidence

### Example Conversation Flow

1. **User Input**: Complex sales JSON data
2. **Initial AI**: Creates 5 sections (summary, metrics, charts, trends, raw data)
3. **User Query**: "simplify"
4. **AI Modification**: Removes low-confidence sections, keeps top 3
5. **User Query**: "show only metrics"
6. **AI Modification**: Filters to show only numerical data sections

This creates a conversational interface where users can iteratively refine the UI based on their specific needs.

## Key Design Principles Demonstrated

1. **AI-First**: No hardcoded rules - AI decides UI structure
2. **Schema-Light**: AI can create any section structure it finds appropriate
3. **Capability-Based**: Components selected by what they can do, not data shape
4. **Graceful Degradation**: System works even with poor AI outputs
5. **Explainability**: AI reasoning is logged and confidence is visible
6. **Flexibility**: Handles any input type (text, JSON, mixed)
7. **Conversational Refinement**: Users can iteratively modify UI with natural language