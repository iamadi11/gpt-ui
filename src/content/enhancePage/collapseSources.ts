/**
 * V4: Collapse raw sources sections in ChatGPT messages
 * Adds a toggle to show/hide raw source lists
 */

/**
 * Heuristically find a "Sources" section in a message
 * Returns the element if found, null otherwise
 */
export function findSourcesSection(messageEl: HTMLElement): HTMLElement | null {
  const text = messageEl.textContent?.toLowerCase() || '';
  
  // Look for common source section indicators
  const sourceKeywords = ['sources', 'references', 'citations', 'links'];
  const hasSourceKeyword = sourceKeywords.some(keyword => text.includes(keyword));
  
  if (!hasSourceKeyword) {
    return null;
  }
  
  // Strategy 1: Look for list elements that might contain sources
  const lists = messageEl.querySelectorAll('ul, ol');
  for (const list of lists) {
    if (list instanceof HTMLElement) {
      const listItems = list.querySelectorAll('li');
      
      // Check if this list looks like a sources list
      // Criteria: has multiple items with links
      if (listItems.length >= 2) {
        let linkCount = 0;
        for (const item of listItems) {
          const links = item.querySelectorAll('a[href^="http"]');
          for (const link of links) {
            const href = link.getAttribute('href') || '';
            if (!href.includes('chatgpt.com') && !href.includes('openai.com')) {
              linkCount++;
            }
          }
        }
        
        // If this list has 2+ external links, it's likely a sources section
        if (linkCount >= 2) {
          return list.parentElement || list;
        }
      }
    }
  }
  
  // Strategy 2: Look for divs that contain "Sources:" or similar headers
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
        // Check if it has links
        const links = div.querySelectorAll('a[href^="http"]');
        let externalLinkCount = 0;
        for (const link of links) {
          const href = link.getAttribute('href') || '';
          if (!href.includes('chatgpt.com') && !href.includes('openai.com')) {
            externalLinkCount++;
          }
        }
        
        if (externalLinkCount >= 2) {
          return div;
        }
      }
    }
  }
  
  return null;
}

/**
 * Collapse a sources section by adding a class and creating a toggle
 */
export function collapseSourcesSection(sourcesEl: HTMLElement): void {
  // Check if already collapsed
  if (sourcesEl.hasAttribute('data-graphgpt-sources-collapsed')) {
    return;
  }
  
  // Mark as collapsed
  sourcesEl.setAttribute('data-graphgpt-sources-collapsed', 'true');
  sourcesEl.classList.add('graphgpt-sources-collapsed');
  
  // Create toggle button
  const toggle = document.createElement('button');
  toggle.className = 'graphgpt-sources-toggle';
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('tabindex', '0');
  toggle.setAttribute('aria-label', 'Show raw sources');
  toggle.textContent = 'Show raw sources';
  
  // Add click handler
  toggle.addEventListener('click', () => {
    toggleSourcesSection(sourcesEl, toggle);
  });
  
  // Add keyboard handler
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSourcesSection(sourcesEl, toggle);
    }
  });
  
  // Insert toggle before the sources section
  sourcesEl.parentElement?.insertBefore(toggle, sourcesEl);
  
  // Store reference to toggle on the element
  (sourcesEl as any).__graphgptToggle = toggle;
}

/**
 * Toggle sources section visibility
 */
function toggleSourcesSection(sourcesEl: HTMLElement, toggle: HTMLButtonElement): void {
  const isCollapsed = sourcesEl.classList.contains('graphgpt-sources-collapsed');
  
  if (isCollapsed) {
    // Expand
    sourcesEl.classList.remove('graphgpt-sources-collapsed');
    toggle.textContent = 'Hide raw sources';
    toggle.setAttribute('aria-label', 'Hide raw sources');
  } else {
    // Collapse
    sourcesEl.classList.add('graphgpt-sources-collapsed');
    toggle.textContent = 'Show raw sources';
    toggle.setAttribute('aria-label', 'Show raw sources');
  }
}

/**
 * Un-collapse all sources sections in a message
 */
export function uncollapseSourcesSection(sourcesEl: HTMLElement): void {
  sourcesEl.removeAttribute('data-graphgpt-sources-collapsed');
  sourcesEl.classList.remove('graphgpt-sources-collapsed');
  
  // Remove toggle button if it exists
  const toggle = (sourcesEl as any).__graphgptToggle;
  if (toggle && toggle.parentElement) {
    toggle.parentElement.removeChild(toggle);
    delete (sourcesEl as any).__graphgptToggle;
  }
}

/**
 * Un-collapse all sources sections in the document
 */
export function uncollapseAllSources(): void {
  const collapsedSections = document.querySelectorAll('[data-graphgpt-sources-collapsed="true"]');
  collapsedSections.forEach((el) => {
    if (el instanceof HTMLElement) {
      uncollapseSourcesSection(el);
    }
  });
}

