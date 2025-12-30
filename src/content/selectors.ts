/**
 * Resilient selectors and heuristics for detecting ChatGPT messages and search results.
 * These avoid fragile classnames and use stable attributes/patterns.
 */

/**
 * Find the main chat container
 */
export function findChatContainer(): HTMLElement | null {
  // Try multiple heuristics to find the chat container
  const selectors = [
    'main',
    '[role="main"]',
    '[data-testid*="conversation"]',
    'div[class*="conversation"]',
    'div[class*="chat"]',
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element instanceof HTMLElement) {
      return element;
    }
  }
  
  return document.body;
}

/**
 * Find all assistant message containers
 */
export function findAssistantMessages(container: HTMLElement = document.body): HTMLElement[] {
  const messages: HTMLElement[] = [];
  
  // Strategy 1: Look for role="assistant" or similar attributes
  const roleSelectors = [
    '[role="assistant"]',
    '[data-role="assistant"]',
    '[aria-label*="assistant"]',
    // ChatGPT specific selectors
    '[data-message-author-role="assistant"]',
    'div[class*="assistant"]',
    'div[class*="message"][class*="assistant"]',
  ];
  
  for (const selector of roleSelectors) {
    const elements = container.querySelectorAll(selector);
    elements.forEach((el) => {
      if (el instanceof HTMLElement && !messages.includes(el)) {
        messages.push(el);
      }
    });
  }
  
  // Strategy 2: Look for message groups by ChatGPT's structure
  // ChatGPT often uses groups with specific patterns
  const messageGroupSelectors = [
    'div[class*="group"]',
    'div[class*="message"]',
    'div[class*="conversation"] > div',
  ];
  
  for (const selector of messageGroupSelectors) {
    const elements = container.querySelectorAll(selector);
    elements.forEach((el) => {
      if (el instanceof HTMLElement && !messages.includes(el)) {
        // Check if this looks like an assistant message
        const text = el.textContent || '';
        const hasExternalLinks = Array.from(el.querySelectorAll('a[href^="http"]')).some(
          (a) => {
            const href = a.getAttribute('href') || '';
            return !href.includes('chatgpt.com') && !href.includes('openai.com');
          }
        );
        
        // Assistant messages typically:
        // - Don't have input fields
        // - Have longer text
        // - May have external links
        const hasInput = el.querySelector('input, textarea, button[type="submit"]') !== null;
        const isLongMessage = text.length > 100;
        
        if (!hasInput && (hasExternalLinks || isLongMessage)) {
          // Additional check: not a user message (user messages often have edit buttons or specific patterns)
          const hasEditButton = el.querySelector('button[aria-label*="edit"], button[aria-label*="Edit"]') !== null;
          if (!hasEditButton) {
            messages.push(el);
          }
        }
      }
    });
  }
  
  // Strategy 3: Heuristic - look for message groups that contain external links
  // and are likely assistant messages (not user messages which typically have input fields)
  if (messages.length === 0) {
    const allDivs = container.querySelectorAll('div');
    allDivs.forEach((div) => {
      if (div instanceof HTMLElement) {
        const hasExternalLinks = Array.from(div.querySelectorAll('a[href^="http"]')).some(
          (a) => {
            const href = a.getAttribute('href') || '';
            return !href.includes('chatgpt.com') && !href.includes('openai.com');
          }
        );
        
        const hasInput = div.querySelector('input, textarea') !== null;
        const hasSources = div.textContent?.toLowerCase().includes('source') || 
                          div.textContent?.toLowerCase().includes('citation') ||
                          div.textContent?.toLowerCase().includes('reference');
        
        if (hasExternalLinks && !hasInput && (hasSources || div.textContent?.length > 200)) {
          if (!messages.includes(div)) {
            messages.push(div);
          }
        }
      }
    });
  }
  
  return messages;
}

/**
 * Check if a message block contains search-like results
 */
export function hasSearchResults(message: HTMLElement): boolean {
  const text = message.textContent?.toLowerCase() || '';
  const hasSources = text.includes('source') || text.includes('citation') || text.includes('reference');
  
  // Try multiple selectors to find links
  const linkSelectors = [
    'a[href^="http"]',
    'a[href]',
    'a',
  ];
  
  let allLinks: HTMLAnchorElement[] = [];
  for (const selector of linkSelectors) {
    const links = message.querySelectorAll(selector);
    links.forEach((link) => {
      if (link instanceof HTMLAnchorElement && !allLinks.includes(link)) {
        allLinks.push(link);
      }
    });
  }
  
  const externalLinks = Array.from(allLinks).filter((a) => {
    const href = a.getAttribute('href') || a.href || '';
    
    if (!href) {
      return false;
    }
    
    // Check if it's an HTTP/HTTPS URL
    if (!href.startsWith('http://') && !href.startsWith('https://')) {
      return false;
    }
    
    // Parse the URL to get the hostname (not just check if string contains chatgpt.com)
    try {
      const url = new URL(href);
      const hostname = url.hostname.toLowerCase();
      
      // Check if the hostname is ChatGPT/OpenAI (not just if the URL contains those strings)
      const isChatGPT = hostname.includes('chatgpt.com') || 
                        hostname.includes('openai.com') ||
                        hostname === 'chat.openai.com';
      
      if (isChatGPT) {
        return false;
      }
      
      return true;
    } catch (e) {
      // If URL parsing fails, skip it
      return false;
    }
  });
  
  // Consider it search results if:
  // 1. Has "Sources" or citations mentioned AND has external links, OR
  // 2. Has 2+ external links (lowered threshold to catch more cases), OR
  // 3. Has at least 1 external link and the message is substantial
  const hasSubstantialText = message.textContent ? message.textContent.length > 300 : false;
  return (hasSources && externalLinks.length > 0) || 
         externalLinks.length >= 2 || 
         (externalLinks.length >= 1 && hasSubstantialText);
}

/**
 * Find all external links in a message
 */
export function findExternalLinks(message: HTMLElement): HTMLAnchorElement[] {
  // Try multiple selectors for links
  const linkSelectors = [
    'a[href]',
    'a[href^="http"]',
    'a[href^="https"]',
    'a', // All anchor tags
    // ChatGPT might use buttons or spans with onclick that contain URLs
    '[data-href]',
    '[data-url]',
    // Look for elements that might contain URLs in text
    '[class*="link"]',
    '[class*="citation"]',
    '[class*="source"]',
  ];
  
  const allLinks: HTMLAnchorElement[] = [];
  const seenUrls = new Set<string>();
  
  for (const selector of linkSelectors) {
    const elements = message.querySelectorAll(selector);
    elements.forEach((el) => {
      if (el instanceof HTMLAnchorElement) {
        const href = el.getAttribute('href') || el.href;
        if (href && !seenUrls.has(href)) {
          seenUrls.add(href);
          allLinks.push(el);
        }
      } else if (el instanceof HTMLElement) {
        // Check for data attributes with URLs
        const dataHref = el.getAttribute('data-href') || el.getAttribute('data-url');
        if (dataHref && (dataHref.startsWith('http://') || dataHref.startsWith('https://')) && !seenUrls.has(dataHref)) {
          seenUrls.add(dataHref);
          // Create a temporary anchor element
          const tempLink = document.createElement('a');
          tempLink.href = dataHref;
          tempLink.textContent = el.textContent || dataHref;
          // Store reference to original element
          (tempLink as any).originalElement = el;
          allLinks.push(tempLink as HTMLAnchorElement);
        }
        
        // Also check if the element's text content looks like a URL
        const text = el.textContent || '';
        const urlMatch = text.match(/https?:\/\/[^\s<>"']+/);
        if (urlMatch && !seenUrls.has(urlMatch[0])) {
          seenUrls.add(urlMatch[0]);
          const tempLink = document.createElement('a');
          tempLink.href = urlMatch[0];
          tempLink.textContent = el.textContent || urlMatch[0];
          (tempLink as any).originalElement = el;
          allLinks.push(tempLink as HTMLAnchorElement);
        }
      }
    });
  }
  
  const externalLinks: HTMLAnchorElement[] = [];
  
  allLinks.forEach((link) => {
    const href = link.getAttribute('href') || link.href;
    if (!href || (!href.startsWith('http://') && !href.startsWith('https://'))) {
      return;
    }
    
    // Parse URL to check hostname (not just string contains)
    try {
      const url = new URL(href);
      const hostname = url.hostname.toLowerCase();
      
      // Check if hostname is ChatGPT/OpenAI
      const isChatGPT = hostname.includes('chatgpt.com') || 
                        hostname.includes('openai.com') ||
                        hostname === 'chat.openai.com';
      
      if (!isChatGPT) {
        externalLinks.push(link);
      }
    } catch (e) {
      // If URL parsing fails, skip it
    }
  });
  
  return externalLinks;
}

/**
 * Extract text snippet near a link
 */
export function extractSnippetForLink(link: HTMLAnchorElement, maxLength: number = 150): string {
  // Strategy 1: Look for parent list item or paragraph
  let container = link.parentElement;
  while (container && container !== document.body) {
    if (container.tagName === 'LI' || container.tagName === 'P' || container.tagName === 'DIV') {
      const text = container.textContent || '';
      if (text.length > link.textContent?.length || 0) {
        // Remove the link text from the snippet
        const linkText = link.textContent || '';
        const snippet = text.replace(linkText, '').trim();
        if (snippet.length > 10) {
          return snippet.slice(0, maxLength) + (snippet.length > maxLength ? '...' : '');
        }
      }
    }
    container = container.parentElement;
  }
  
  // Strategy 2: Look for next sibling text
  let nextSibling = link.nextSibling;
  if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
    const text = nextSibling.textContent?.trim() || '';
    if (text.length > 10) {
      return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
    }
  }
  
  // Strategy 3: Use link's title attribute if available
  const title = link.getAttribute('title');
  if (title && title.length > 10) {
    return title.slice(0, maxLength);
  }
  
  // Fallback: use domain as snippet
  try {
    const url = new URL(link.href);
    return `From ${url.hostname}`;
  } catch {
    return '';
  }
}

/**
 * Extract title for a link
 */
export function extractTitleForLink(link: HTMLAnchorElement): string {
  // Strategy 1: Use link text if meaningful
  const linkText = link.textContent?.trim() || '';
  if (linkText.length > 5 && linkText.length < 200) {
    return linkText;
  }
  
  // Strategy 2: Look for heading before the link
  let element: Element | null = link;
  for (let i = 0; i < 5; i++) {
    element = element?.previousElementSibling || element?.parentElement?.previousElementSibling || null;
    if (element && (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3')) {
      const headingText = element.textContent?.trim();
      if (headingText && headingText.length > 5) {
        return headingText;
      }
    }
  }
  
  // Strategy 3: Use title attribute
  const title = link.getAttribute('title');
  if (title && title.length > 5) {
    return title;
  }
  
  // Fallback: Extract from URL
  try {
    const url = new URL(link.href);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      return lastPart.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '');
    }
    return url.hostname.replace(/^www\./, '');
  } catch {
    return link.href;
  }
}

