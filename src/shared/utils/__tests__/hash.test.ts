import { describe, it, expect } from 'vitest';
import { hashString, hashUrl } from '../hash';

describe('hashString', () => {
  it('should generate consistent hashes for same input', () => {
    const hash1 = hashString('test');
    const hash2 = hashString('test');
    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different inputs', () => {
    const hash1 = hashString('test1');
    const hash2 = hashString('test2');
    expect(hash1).not.toBe(hash2);
  });

  it('should generate positive hex strings', () => {
    const hash = hashString('test');
    expect(hash).toMatch(/^[0-9a-f]+$/);
    expect(parseInt(hash, 16)).toBeGreaterThan(0);
  });
});

describe('hashUrl', () => {
  it('should generate hash for URL', () => {
    const hash = hashUrl('https://example.com');
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');
  });

  it('should generate consistent hashes for same URL', () => {
    const hash1 = hashUrl('https://example.com');
    const hash2 = hashUrl('https://example.com');
    expect(hash1).toBe(hash2);
  });
});

