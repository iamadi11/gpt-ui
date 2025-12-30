/**
 * V3.1: Export results to JSON/Markdown
 * Snippets are excluded by default (user must explicitly opt-in)
 */

import type { Result } from '../../shared/types';
import { downloadText } from '../../shared/utils/download';
import { getTopDomains } from './heuristics';

/**
 * Export results to JSON
 */
export function exportResultsToJSON(
  results: Result[],
  includeSnippets: boolean = false
): void {
  const exportData = results.map(result => ({
    url: result.url,
    title: result.title,
    domain: result.domain,
    tags: result.tags || [],
    position: result.position,
    ...(includeSnippets && result.snippet ? { snippet: result.snippet } : {}),
  }));

  const json = JSON.stringify(exportData, null, 2);
  const filename = `gpt-ui-results-${new Date().toISOString().split('T')[0]}.json`;
  
  downloadText(json, filename, 'application/json');
}

/**
 * Export results to Markdown (grouped by domain)
 */
export function exportResultsToMarkdown(
  results: Result[],
  includeSnippets: boolean = false
): void {
  const topDomains = getTopDomains(results, results.length);
  const domainGroups = new Map<string, Result[]>();

  // Group results by domain
  results.forEach(result => {
    if (!domainGroups.has(result.domain)) {
      domainGroups.set(result.domain, []);
    }
    domainGroups.get(result.domain)!.push(result);
  });

  let markdown = `# GPT-UI Results Export\n\n`;
  markdown += `**Export Date:** ${new Date().toLocaleString()}\n`;
  markdown += `**Total Results:** ${results.length}\n\n`;
  markdown += `---\n\n`;

  // Write grouped by domain
  topDomains.forEach(({ domain }) => {
    const domainResults = domainGroups.get(domain) || [];
    if (domainResults.length === 0) return;

    markdown += `## ${domain}\n\n`;

    domainResults.forEach((result, index) => {
      markdown += `${index + 1}. **${result.title}** — ${result.url}\n`;
      
      if (result.tags && result.tags.length > 0) {
        markdown += `   *Tags: ${result.tags.join(', ')}*\n`;
      }
      
      if (includeSnippets && result.snippet) {
        markdown += `   \`\`\`\n   ${result.snippet}\n   \`\`\`\n`;
      }
      
      markdown += `\n`;
    });

    markdown += `\n`;
  });

  const filename = `gpt-ui-results-${new Date().toISOString().split('T')[0]}.md`;
  downloadText(markdown, filename, 'text/markdown');
}

