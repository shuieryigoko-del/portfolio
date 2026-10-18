import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import {
  adjacentWorks,
  formatDate,
  formatIndexDate,
  isPublished,
  readingTime,
  sortWorks,
  workPath,
} from '../src/lib/works';

function entry(slug: string, date: string, draft = false) {
  return {
    id: slug,
    body: '',
    data: { title: slug, slug, date: new Date(date), summary: '', tags: [], draft },
  };
}

describe('isPublished', () => {
  it('keeps published entries and hides drafts', () => {
    expect(isPublished(entry('a', '2026-01-01'))).toBe(true);
    expect(isPublished(entry('b', '2026-01-01', true))).toBe(false);
  });
});

describe('sortWorks', () => {
  it('sorts newest first without mutating the input', () => {
    const input = [entry('old', '2026-01-01'), entry('new', '2026-09-01')];
    const sorted = sortWorks(input);
    expect(sorted.map((item) => item.data.slug)).toEqual(['new', 'old']);
    expect(input.map((item) => item.data.slug)).toEqual(['old', 'new']);
  });
});

describe('workPath', () => {
  it('builds a trailing-slash path', () => {
    expect(workPath('three-cups')).toBe('/works/three-cups/');
  });

  it('encodes non-ASCII slugs', () => {
    expect(workPath('中文')).toBe('/works/%E4%B8%AD%E6%96%87/');
  });
});

describe('formatDate', () => {
  it('formats a date in Chinese', () => {
    expect(formatDate(new Date('2026-10-18T00:00:00Z'))).toBe('2026年10月18日');
  });
});

describe('formatIndexDate', () => {
  it('formats a compact magazine-style date', () => {
    expect(formatIndexDate(new Date('2026-10-18T00:00:00Z'))).toBe('2026.10.18');
  });
});

describe('readingTime', () => {
  it('returns at least one minute for empty text', () => {
    expect(readingTime('')).toBe(1);
  });

  it('estimates Chinese text at 400 characters per minute', () => {
    expect(readingTime('字'.repeat(800))).toBe(2);
  });

  it('estimates Latin text at 200 words per minute', () => {
    expect(readingTime(Array.from({ length: 400 }, () => 'word').join(' '))).toBe(2);
  });
});

describe('adjacentWorks', () => {
  it('returns the newer and older neighbours', () => {
    const entries = [
      entry('newest', '2026-09-01'),
      entry('middle', '2026-08-01'),
      entry('oldest', '2026-07-01'),
    ];
    const { prev, next } = adjacentWorks(entries, 'middle');
    expect(prev?.data.slug).toBe('newest');
    expect(next?.data.slug).toBe('oldest');
  });

  it('returns nothing for an unknown slug', () => {
    expect(adjacentWorks([entry('only', '2026-01-01')], 'missing')).toEqual({});
  });
});

const worksDir = 'src/content/works';
const workFiles = readdirSync(worksDir).filter((file) => file.endsWith('.md'));

function frontmatter(file: string): Record<string, unknown> {
  const raw = readFileSync(file, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`缺少 frontmatter：${file}`);
  return parse(match[1]) as Record<string, unknown>;
}

describe('content files', () => {
  it('has at least one work to build', () => {
    expect(workFiles.length).toBeGreaterThan(0);
  });

  it('gives every work the fields the site expects', () => {
    for (const file of workFiles) {
      const data = frontmatter(join(worksDir, file));
      expect(data.title, file).toBeTypeOf('string');
      expect(data.slug, file).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(data.date, file).toBeDefined();
      expect(data.summary, file).toBeTypeOf('string');
      expect(Array.isArray(data.tags), file).toBe(true);
      expect(typeof data.draft, file).toBe('boolean');
    }
  });

  it('uses unique slugs', () => {
    const slugs = workFiles.map((file) => frontmatter(join(worksDir, file)).slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('points covers at files that exist', () => {
    for (const file of workFiles) {
      const data = frontmatter(join(worksDir, file));
      if (typeof data.cover === 'string') {
        const coverPath = join('public', data.cover.replace(/^\//, ''));
        expect(existsSync(coverPath), data.cover).toBe(true);
      }
    }
  });

  it('keeps the Pages CMS form in sync with the content schema', () => {
    const config = parse(readFileSync('.pages.yml', 'utf8')) as {
      content: { name: string; fields: { name: string }[] }[];
    };
    const works = config.content.find((entry) => entry.name === 'works');
    const fields = new Set(works?.fields.map((field) => field.name));
    for (const key of ['title', 'slug', 'date', 'summary', 'cover', 'coverAlt', 'tags', 'draft', 'body']) {
      expect(fields, key).toContain(key);
    }
  });

  it('has the about page', () => {
    expect(existsSync('src/content/pages/about.md')).toBe(true);
  });
});
