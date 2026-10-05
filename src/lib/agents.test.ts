import { describe, it, expect, vi, beforeEach } from 'vitest';

const generateText = vi.fn();
vi.mock('ai', () => ({ generateText: (...args: unknown[]) => generateText(...args) }));
vi.mock('./ai', () => ({ getModel: () => 'model', MODELS: { generate: 'model' } }));

import { generateAllPosts } from './agents';

describe('generateAllPosts', () => {
  beforeEach(() => {
    generateText.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('returns a post for every persona when all succeed', async () => {
    generateText.mockResolvedValue({ text: 'a post' });
    const posts = await generateAllPosts('topic');
    expect(posts).toHaveLength(6);
  });

  it('keeps the other posts when one persona fails', async () => {
    let call = 0;
    generateText.mockImplementation(async () => {
      call++;
      if (call === 2) throw new Error('timeout');
      return { text: 'a post' };
    });
    const posts = await generateAllPosts('topic');
    expect(posts).toHaveLength(5);
    expect(posts.map((p) => p.pattern)).not.toContain('tryhard');
  });

  it('throws when every persona fails', async () => {
    generateText.mockRejectedValue(new Error('no api key'));
    await expect(generateAllPosts('topic')).rejects.toThrow('no api key');
  });
});
