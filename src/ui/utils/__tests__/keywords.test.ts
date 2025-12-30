import { describe, it, expect } from 'vitest';
import { extractKeywords, highlightKeywords, containsKeywords } from '../keywords';

describe('extractKeywords', () => {
  it('should extract keywords from text', () => {
    const text = 'This is a test about machine learning and artificial intelligence';
    const keywords = extractKeywords(text);
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords).toContain('test');
    expect(keywords).toContain('machine');
    expect(keywords).toContain('learning');
    expect(keywords).toContain('artificial');
    expect(keywords).toContain('intelligence');
  });

  it('should filter out stopwords', () => {
    const text = 'the quick brown fox jumps over the lazy dog';
    const keywords = extractKeywords(text);
    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('over');
    expect(keywords).not.toContain('a');
    expect(keywords).toContain('quick');
    expect(keywords).toContain('brown');
  });

  it('should handle empty text', () => {
    expect(extractKeywords('')).toEqual([]);
    expect(extractKeywords('   ')).toEqual([]);
  });

  it('should filter short words (< 3 chars)', () => {
    const text = 'a be to we ai ml';
    const keywords = extractKeywords(text);
    expect(keywords.length).toBe(0);
  });

  it('should limit to 20 keywords', () => {
    const longText = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one twenty-two';
    const keywords = extractKeywords(longText);
    expect(keywords.length).toBeLessThanOrEqual(20);
  });
});

describe('highlightKeywords', () => {
  it('should highlight keywords in text', () => {
    const text = 'This is about machine learning';
    const keywords = ['machine', 'learning'];
    const highlighted = highlightKeywords(text, keywords);
    expect(highlighted).toContain('<mark>');
    expect(highlighted).toContain('machine');
    expect(highlighted).toContain('learning');
  });

  it('should be case-insensitive', () => {
    const text = 'This is about Machine Learning';
    const keywords = ['machine', 'learning'];
    const highlighted = highlightKeywords(text, keywords);
    expect(highlighted).toContain('<mark>');
  });

  it('should escape HTML in text', () => {
    const text = 'This is about <script>alert("xss")</script>';
    const keywords = ['about'];
    const highlighted = highlightKeywords(text, keywords);
    expect(highlighted).not.toContain('<script>');
  });

  it('should return original text if no keywords', () => {
    const text = 'This is a test';
    const keywords: string[] = [];
    const highlighted = highlightKeywords(text, keywords);
    expect(highlighted).toBe(text);
  });

  it('should handle empty text', () => {
    expect(highlightKeywords('', ['test'])).toBe('');
  });
});

describe('containsKeywords', () => {
  it('should detect keywords in text', () => {
    expect(containsKeywords('This is about machine learning', ['machine'])).toBe(true);
    expect(containsKeywords('This is about machine learning', ['learning'])).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(containsKeywords('This is about Machine Learning', ['machine'])).toBe(true);
    expect(containsKeywords('This is about machine learning', ['MACHINE'])).toBe(true);
  });

  it('should return false if no keywords match', () => {
    expect(containsKeywords('This is a test', ['xyz'])).toBe(false);
  });

  it('should return false for empty text', () => {
    expect(containsKeywords('', ['test'])).toBe(false);
  });

  it('should return false for empty keywords', () => {
    expect(containsKeywords('test text', [])).toBe(false);
  });
});

