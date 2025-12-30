# Changelog

All notable changes to SourceLens will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2024-XX-XX

### Added
- Knowledge Panel: Local-only search results summary with query context, top domains, source quality signals
- Intent Chips: Filter results by category (Docs, News, Video, Forums, Shopping, Research)
- Result Set Switcher: Switch between results from different assistant messages
- Keyword highlighting: Highlights search terms in result snippets
- Result export: Export visible results to JSON/Markdown (snippets excluded by default)
- Privacy controls: "Never show query context" setting and granular data clearing options
- Sitelinks-style quick actions on result cards

## [3.0.0] - 2024-XX-XX

### Added
- Preview mode: Split-panel preview with sandboxed iframe (X-Frame-Options detection)
- Pinboard: Save results to collections with folders, search, and bulk actions
- Session History: Privacy-preserving session tracking (domains, counts, hashed IDs only)
- Command Palette: Cmd/Ctrl+K for quick actions
- Smart ranking: Local-only scoring for top results (domain diversity, quality signals)
- Export: Export pins to JSON/Markdown

### Changed
- Refactored storage layer with schema migrations (v1 → v2 → v3)

## [2.0.0] - 2024-XX-XX

### Added
- Enhanced result detection with improved heuristics
- Tag filtering (News, Docs, Video, Forums)
- Grouped view by domain
- Theme auto-detection (light/dark)
- Keyboard shortcuts
- Settings modal

### Changed
- Improved URL normalization and deduplication
- Better snippet extraction

## [1.0.0] - 2024-XX-XX

### Added
- Initial release
- Basic result extraction and display
- Panel overlay UI

