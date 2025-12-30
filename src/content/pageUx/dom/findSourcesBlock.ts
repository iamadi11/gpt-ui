/**
 * V5: Find and identify sources/citations blocks within messages
 * Uses text matching and structural heuristics
 */

/**
 * Find a sources/citations/references block in a message
 * Returns the element containing the sources, or null if not found
 */
export function findSourcesBlock(messageEl: HTMLElement): {
  block: HTMLElement;
  heading?: HTMLElement;
} | null {
  const text = messageEl.textContent?.toLowerCase() || '';
  
  // Look for source-related keywords
  const sourceKeywords = ['sources', 'references', 'citations', 'links'];
  const hasSourceKeyword = sourceKeywords.some(keyword => text.includes(keyword));
  
  if (!hasSourceKeyword) {
    return null;
  }
  
  // Strategy 1: Look for list elements (ul, ol) that contain external links
  const lists = messageEl.querySelectorAll('ul, ol');
  for (const list of lists) {
    if (list instanceof HTMLElement) {
      const listItems = list.querySelectorAll('li');
      
      if (listItems.length >= 2) {
        let externalLinkCount = 0;
        for (const item of listItems) {
          const links = item.querySelectorAll('a[href^="http"]');
          for (const link of links) {
            const href = link.getAttribute('href') || '';
            if (!href.includes('chatgpt.com') && !href.includes('openai.com')) {
              externalLinkCount++;
            }
          }
        }
        
        // If this list has 2+ external links, it's likely a sources section
        if (externalLinkCount >= 2) {
          // Try to find a heading before it
          let heading: HTMLElement | undefined;
          let prevSibling = list.previousElementSibling;
          while (prevSibling && !heading) {
            if (prevSibling instanceof HTMLElement) {
              const text = prevSibling.textContent?.toLowerCase() || '';
              const isHeading = /^(sources?|citations?|references?|links?)[:\s]?$/i.test(text.trim());
              if (isHeading || ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV'].includes(prevSibling.tagName)) {
                heading = prevSibling;
                break;
              }
            }
            prevSibling = prevSibling.previousElementSibling;
          }
          
          return { block: list.parentElement || list, heading };
        }
      }
    }
  }
  
  // Strategy 2: Look for divs/sections that start with source keywords
  const divs = messageEl.querySelectorAll('div, section');
  for (const div of divs) {
    if (div instanceof HTMLElement) {
      const divText = div.textContent?.toLowerCase() || '';
      
      // Check if this div starts with a source keyword
      const startsWithKeyword = sourceKeywords.some(keyword => {
        const pattern = new RegExp(`^${keyword}[\\s:]`, 'i');
        return pattern.test(divText.trim());
      });
      
      if (startsWithKeyword) {
        // Check if it has external links
        const links = div.querySelectorAll('a[href^="http"]');
        let externalLinkCount = 0;
        for (const link of links) {
          const href = link.getAttribute('href') || '';
          if (!href.includes('chatgpt.com') && !href.includes('openai.com')) {
            externalLinkCount++;
          }
        }
        
        if (externalLinkCount >= 2) {
          // Try to find a heading within
          const heading = div.querySelector('h1, h2, h3, h4, h5, h6, p, div') as HTMLElement | null;
          return { block: div, heading: heading || undefined };
        }
      }
    }
  }
  
  return null;
}

/**
 * Check if a sources block is already wrapped by our wrapper
 */
export function isSourcesBlockWrapped(block: HTMLElement): boolean {
  return block.hasAttribute('data-graphgpt-sources-wrapper') ||
         block.parentElement?.hasAttribute('data-graphgpt-sources-wrapper') ||
         false;
}

