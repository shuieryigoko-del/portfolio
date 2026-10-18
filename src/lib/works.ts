export interface WorkData {
  title: string;
  slug: string;
  date: Date;
  summary: string;
  cover?: string;
  coverAlt?: string;
  tags: string[];
  draft: boolean;
}

export interface WorkEntry {
  id: string;
  body?: string;
  data: WorkData;
}

/** 草稿不进入公开列表，也不会生成页面。 */
export function isPublished<T extends { data: { draft: boolean } }>(entry: T): boolean {
  return !entry.data.draft;
}

/** 按日期倒序（新的在前），不修改原数组。 */
export function sortWorks<T extends { data: { date: Date } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** 作品详情页路径。中文 slug 会被编码，链接仍然可用。 */
export function workPath(slug: string): string {
  return `/works/${encodeURIComponent(slug)}/`;
}

/** 例：2026年10月18日 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(date);
}

/** 例：2026.10.18，用于杂志式索引。 */
export function formatIndexDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}.${value('month')}.${value('day')}`;
}

/** 中文按 400 字/分钟、西文按 200 词/分钟估算，最少 1 分钟。 */
export function readingTime(text = ''): number {
  const cjk = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 400 + latin / 200));
}

/** 在按日期倒序的列表里，找当前作品的上一篇（更新）和下一篇（更旧）。 */
export function adjacentWorks<T extends { data: { slug: string; date: Date } }>(
  entries: T[],
  slug: string,
): { prev?: T; next?: T } {
  const sorted = sortWorks(entries);
  const index = sorted.findIndex((entry) => entry.data.slug === slug);
  if (index === -1) return {};
  return { prev: sorted[index - 1], next: sorted[index + 1] };
}
