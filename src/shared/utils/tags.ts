/**
 * Domain-based heuristics to derive tags for results
 * Tags: citation, sources-section, news, doc, video, forum
 */

const NEWS_DOMAINS = [
  'bbc.com', 'cnn.com', 'reuters.com', 'ap.org', 'theguardian.com',
  'nytimes.com', 'washingtonpost.com', 'wsj.com', 'npr.org',
  'theatlantic.com', 'vox.com', 'axios.com', 'bloomberg.com',
  'economist.com', 'ft.com', 'techcrunch.com', 'theverge.com',
  'arstechnica.com', 'wired.com', 'gizmodo.com', 'engadget.com'
];

const DOC_DOMAINS = [
  'docs.google.com', 'docs.microsoft.com', 'github.com', 'gitlab.com',
  'stackoverflow.com', 'developer.mozilla.org', 'w3.org', 'ietf.org',
  'readthedocs.io', 'npmjs.com', 'pypi.org', 'rust-lang.org',
  'nodejs.org', 'python.org', 'go.dev', 'swift.org', 'kotlinlang.org',
  'wiki.', 'wikipedia.org', 'wikibooks.org', 'wikimedia.org'
];

const VIDEO_DOMAINS = [
  'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com',
  'twitch.tv', 'tiktok.com', 'instagram.com', 'facebook.com/watch'
];

const FORUM_DOMAINS = [
  'reddit.com', 'stackexchange.com', 'discourse.org', 'phpbb.com',
  'vanillaforums.com', 'flarum.org', 'nodebb.org'
];

/**
 * Derive tags from domain and URL
 */
export function deriveTags(domain: string, url: string): string[] {
  const tags: string[] = [];
  const lowerDomain = domain.toLowerCase();
  const lowerUrl = url.toLowerCase();

  // Check for news domains
  if (NEWS_DOMAINS.some(d => lowerDomain.includes(d.toLowerCase()))) {
    tags.push('news');
  }

  // Check for documentation domains
  if (DOC_DOMAINS.some(d => lowerDomain.includes(d.toLowerCase()))) {
    tags.push('doc');
  }

  // Check for video domains
  if (VIDEO_DOMAINS.some(d => lowerDomain.includes(d.toLowerCase()))) {
    tags.push('video');
  }

  // Check for forum domains
  if (FORUM_DOMAINS.some(d => lowerDomain.includes(d.toLowerCase()))) {
    tags.push('forum');
  }

  // Check URL patterns
  if (lowerUrl.includes('/video/') || lowerUrl.includes('/watch') || 
      lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') ||
      lowerUrl.includes('vimeo.com')) {
    if (!tags.includes('video')) {
      tags.push('video');
    }
  }

  if (lowerUrl.includes('/docs/') || lowerUrl.includes('/documentation/') ||
      lowerUrl.includes('/wiki/') || lowerUrl.includes('/manual/')) {
    if (!tags.includes('doc')) {
      tags.push('doc');
    }
  }

  // Default: if no specific tag, it's likely a general citation
  if (tags.length === 0) {
    tags.push('citation');
  }

  return tags;
}

