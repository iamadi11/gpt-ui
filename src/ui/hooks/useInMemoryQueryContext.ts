/**
 * V3.1: Extract query context from last user prompt (in-memory only, never persisted)
 */

import { useEffect, useState, useRef } from 'react';

/**
 * Extract the last user prompt text from ChatGPT DOM
 * This is best-effort and never persisted
 */
function extractLastUserPrompt(): string | null {
  try {
    // Strategy 1: Look for user message containers
    const userSelectors = [
      '[data-message-author-role="user"]',
      '[role="user"]',
      'div[class*="user"]',
      'div[class*="message"][class*="user"]',
    ];

    let userMessages: HTMLElement[] = [];
    for (const selector of userSelectors) {
      const elements = document.querySelectorAll<HTMLElement>(selector);
      if (elements.length > 0) {
        userMessages = Array.from(elements);
        break;
      }
    }

    // Get the last user message
    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      
      // Try to find text content (exclude buttons, icons, etc.)
      const textContent = lastMessage.textContent?.trim() || '';
      
      // Filter out very short messages (likely UI elements)
      if (textContent.length > 10 && textContent.length < 1000) {
        return textContent;
      }
    }

    // Strategy 2: Look for textarea input value (if message is being composed)
    const textarea = document.querySelector('textarea[placeholder*="message"], textarea[id*="prompt"]');
    if (textarea && (textarea as HTMLTextAreaElement).value) {
      const value = (textarea as HTMLTextAreaElement).value.trim();
      if (value.length > 10 && value.length < 1000) {
        return value;
      }
    }
  } catch (error) {
    // Silently fail - extraction is best-effort
    console.debug('[GPT-UI] Query context extraction failed:', error);
  }

  return null;
}

/**
 * Hook to get the last user prompt (in-memory only)
 * Updates when DOM changes (via polling or mutation observer)
 */
export function useInMemoryQueryContext(
  enabled: boolean = true,
  pollInterval: number = 2000
): string | null {
  const [queryContext, setQueryContext] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setQueryContext(null);
      return;
    }

    // Initial extraction
    const initialContext = extractLastUserPrompt();
    setQueryContext(initialContext);

    // Poll for updates (since user messages might not trigger our observer)
    intervalRef.current = window.setInterval(() => {
      const context = extractLastUserPrompt();
      if (context !== queryContext) {
        setQueryContext(context);
      }
    }, pollInterval);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollInterval]);

  return queryContext;
}

