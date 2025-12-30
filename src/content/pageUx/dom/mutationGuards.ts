/**
 * V5: Mutation observer guards to prevent infinite loops
 * Checks if a mutation was caused by our injected nodes
 */

/**
 * Check if a mutation was caused by our injected elements
 * We ignore mutations from nodes with data-graphgpt-* attributes
 */
export function isOurMutation(mutation: MutationRecord): boolean {
  // Check if the target or any added/removed nodes have our data attributes
  const target = mutation.target;
  if (target instanceof Element) {
    if (target.hasAttribute('data-graphgpt-inline') ||
        target.hasAttribute('data-graphgpt-header') ||
        target.hasAttribute('data-graphgpt-sources-strip') ||
        target.hasAttribute('data-graphgpt-knowledge') ||
        target.hasAttribute('data-graphgpt-sources-wrapper') ||
        target.closest('[data-graphgpt-inline], [data-graphgpt-header], [data-graphgpt-sources-strip], [data-graphgpt-knowledge]') !== null) {
      return true;
    }
  }
  
  // Check added nodes
  if (mutation.addedNodes) {
    for (const node of Array.from(mutation.addedNodes)) {
      if (node instanceof Element) {
        if (node.hasAttribute('data-graphgpt-inline') ||
            node.hasAttribute('data-graphgpt-header') ||
            node.hasAttribute('data-graphgpt-sources-strip') ||
            node.hasAttribute('data-graphgpt-knowledge') ||
            node.hasAttribute('data-graphgpt-sources-wrapper') ||
            node.querySelector('[data-graphgpt-inline], [data-graphgpt-header], [data-graphgpt-sources-strip], [data-graphgpt-knowledge]') !== null) {
          return true;
        }
      }
    }
  }
  
  // Check removed nodes (for cleanup tracking, not to ignore)
  // We don't ignore removals even if they're ours
  
  return false;
}

/**
 * Check if a node or any of its ancestors is one of our injected nodes
 */
export function isOurNode(node: Node): boolean {
  if (!(node instanceof Element)) {
    return false;
  }
  
  return node.hasAttribute('data-graphgpt-inline') ||
         node.hasAttribute('data-graphgpt-header') ||
         node.hasAttribute('data-graphgpt-sources-strip') ||
         node.hasAttribute('data-graphgpt-knowledge') ||
         node.hasAttribute('data-graphgpt-sources-wrapper') ||
         node.closest('[data-graphgpt-inline], [data-graphgpt-header], [data-graphgpt-sources-strip], [data-graphgpt-knowledge], [data-graphgpt-sources-wrapper]') !== null;
}

