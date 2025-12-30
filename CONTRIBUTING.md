# Contributing to SourceLens

Thank you for your interest in contributing to SourceLens! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Use the bug report template
3. Include all relevant information (see [SUPPORT.md](./SUPPORT.md))

### Suggesting Features

1. Check if the feature has been requested
2. Use the feature request template
3. Explain the use case and benefits
4. Consider privacy implications

### Contributing Code

1. **Fork the repository**
2. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes:**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed
4. **Test your changes:**
   ```bash
   npm test
   npm run build
   ```
5. **Commit your changes:**
   ```bash
   git commit -m "Add: brief description of changes"
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request:**
   - Describe your changes
   - Link related issues
   - Request review

## Development Setup

1. **Clone your fork:**
   ```bash
   git clone https://github.com/iamadi11/gpt-ui.git
   cd gpt-ui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate icons:**
   ```bash
   npm run generate-icons
   ```

4. **Build:**
   ```bash
   npm run build
   ```

5. **Load in Chrome:**
   - `chrome://extensions/` → Load unpacked → Select `dist/` folder

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper types
- Add JSDoc comments for public functions

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks

### Privacy First

- **No external API calls** - All processing must be local
- **No data collection** - Don't add analytics or telemetry
- **No chat text storage** - Never persist conversation content
- **Minimal permissions** - Don't request unnecessary permissions

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings (unless double quotes are needed)
- Use meaningful variable and function names
- Add comments for complex logic

### Testing

- Add unit tests for new utilities
- Test edge cases
- Ensure tests pass before submitting PR

## Pull Request Process

1. **Update documentation** if you've changed functionality
2. **Update CHANGELOG.md** with your changes
3. **Ensure all tests pass**
4. **Ensure the build succeeds**
5. **Request review** from maintainers

## What to Contribute

### High Priority

- Bug fixes
- Performance improvements
- Accessibility improvements
- Documentation improvements
- Test coverage

### Medium Priority

- Feature enhancements (privacy-first)
- UI/UX improvements
- Code refactoring
- Error handling improvements

### Low Priority

- Code style improvements
- Comment improvements
- Minor optimizations

## Questions?

If you have questions about contributing:

1. Check existing issues and PRs
2. Read the documentation
3. Open a discussion issue

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SourceLens! 🎉

