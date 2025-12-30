import { describe, it, expect } from 'vitest';
import { normalizeUrl, normalizeUrlForDisplay, getDomain } from '../url';

describe('normalizeUrl', () => {
  it('should remove trailing slash', () => {
    expect(normalizeUrl('https://example.com/path/')).toBe('https://example.com/path');
  });

  it('should keep root path slash', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com/');
  });

  it('should remove UTM parameters', () => {
    const url = 'https://example.com/page?utm_source=test&utm_medium=email&foo=bar';
    const normalized = normalizeUrl(url);
    expect(normalized).toContain('foo=bar');
    expect(normalized).not.toContain('utm_source');
    expect(normalized).not.toContain('utm_medium');
  });

  it('should collapse http to https for deduplication', () => {
    expect(normalizeUrl('http://example.com')).toBe('https://example.com');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('should handle URLs without protocol', () => {
    const normalized = normalizeUrl('example.com/path');
    expect(normalized).toContain('https://');
  });

  it('should remove other tracking parameters', () => {
    const url = 'https://example.com?ref=test&source=foo&fbclid=123&gclid=456';
    const normalized = normalizeUrl(url);
    expect(normalized).not.toContain('ref=test');
    expect(normalized).not.toContain('source=foo');
    expect(normalized).not.toContain('fbclid');
    expect(normalized).not.toContain('gclid');
  });
});

describe('normalizeUrlForDisplay', () => {
  it('should preserve http protocol', () => {
    expect(normalizeUrlForDisplay('http://example.com')).toBe('http://example.com');
    expect(normalizeUrlForDisplay('https://example.com')).toBe('https://example.com');
  });

  it('should still remove tracking parameters', () => {
    const url = 'https://example.com?utm_source=test';
    const normalized = normalizeUrlForDisplay(url);
    expect(normalized).not.toContain('utm_source');
  });
});

describe('getDomain', () => {
  it('should extract domain from URL', () => {
    expect(getDomain('https://example.com/path')).toBe('example.com');
  });

  it('should remove www prefix', () => {
    expect(getDomain('https://www.example.com')).toBe('example.com');
  });

  it('should handle URLs without protocol', () => {
    expect(getDomain('example.com/path')).toBe('');
  });

  it('should return empty string for invalid URLs', () => {
    expect(getDomain('not-a-url')).toBe('');
  });
});

