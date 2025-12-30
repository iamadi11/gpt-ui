import { describe, it, expect } from 'vitest';
import { deriveTags } from '../tags';

describe('deriveTags', () => {
  it('should tag news domains', () => {
    expect(deriveTags('bbc.com', 'https://bbc.com/article')).toContain('news');
    expect(deriveTags('cnn.com', 'https://cnn.com/article')).toContain('news');
    expect(deriveTags('reuters.com', 'https://reuters.com/article')).toContain('news');
  });

  it('should tag documentation domains', () => {
    expect(deriveTags('docs.google.com', 'https://docs.google.com/doc')).toContain('doc');
    expect(deriveTags('developer.mozilla.org', 'https://developer.mozilla.org/docs')).toContain('doc');
    expect(deriveTags('wikipedia.org', 'https://wikipedia.org/wiki')).toContain('doc');
  });

  it('should tag video domains', () => {
    expect(deriveTags('youtube.com', 'https://youtube.com/watch')).toContain('video');
    expect(deriveTags('youtu.be', 'https://youtu.be/video')).toContain('video');
    expect(deriveTags('vimeo.com', 'https://vimeo.com/video')).toContain('video');
  });

  it('should tag forum domains', () => {
    expect(deriveTags('reddit.com', 'https://reddit.com/post')).toContain('forum');
    expect(deriveTags('stackexchange.com', 'https://stackexchange.com/question')).toContain('forum');
  });

  it('should tag video from URL pattern', () => {
    expect(deriveTags('example.com', 'https://example.com/video/123')).toContain('video');
    expect(deriveTags('example.com', 'https://example.com/watch?v=123')).toContain('video');
  });

  it('should tag doc from URL pattern', () => {
    expect(deriveTags('example.com', 'https://example.com/docs/page')).toContain('doc');
    expect(deriveTags('example.com', 'https://example.com/wiki/page')).toContain('doc');
    expect(deriveTags('example.com', 'https://example.com/documentation/page')).toContain('doc');
  });

  it('should default to citation tag if no specific tag matches', () => {
    const tags = deriveTags('example.com', 'https://example.com/page');
    expect(tags).toContain('citation');
  });

  it('should not add duplicate tags', () => {
    const tags = deriveTags('youtube.com', 'https://youtube.com/watch?v=123');
    const videoCount = tags.filter(t => t === 'video').length;
    expect(videoCount).toBe(1);
  });
});

