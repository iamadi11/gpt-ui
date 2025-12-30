/**
 * Download utilities for exporting data (pins, etc.)
 * Uses in-page blob downloads (no server)
 */

/**
 * Download text as a file
 */
export function downloadText(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export pins to JSON
 */
export function exportPinsToJSON(pins: Array<{ id: string; url: string; title: string; domain: string; tags: string[]; pinnedAt: number; note?: string }>): void {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    pins: pins.map(pin => ({
      url: pin.url,
      title: pin.title,
      domain: pin.domain,
      tags: pin.tags,
      pinnedAt: new Date(pin.pinnedAt).toISOString(),
      note: pin.note,
    })),
  };
  
  downloadText(JSON.stringify(data, null, 2), `gpt-ui-pins-${Date.now()}.json`, 'application/json');
}

/**
 * Export pins to Markdown
 */
export function exportPinsToMarkdown(pins: Array<{ url: string; title: string; domain: string; tags: string[]; pinnedAt: number; note?: string }>): void {
  const lines: string[] = [
    '# GPT-UI Pinned Results',
    '',
    `Exported: ${new Date().toISOString()}`,
    `Total: ${pins.length} pins`,
    '',
    '---',
    '',
  ];
  
  pins.forEach((pin, index) => {
    lines.push(`## ${index + 1}. ${pin.title}`);
    lines.push('');
    lines.push(`- **URL**: ${pin.url}`);
    lines.push(`- **Domain**: ${pin.domain}`);
    if (pin.tags.length > 0) {
      lines.push(`- **Tags**: ${pin.tags.join(', ')}`);
    }
    if (pin.note) {
      lines.push(`- **Note**: ${pin.note}`);
    }
    lines.push(`- **Pinned**: ${new Date(pin.pinnedAt).toISOString()}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  });
  
  downloadText(lines.join('\n'), `gpt-ui-pins-${Date.now()}.md`, 'text/markdown');
}

