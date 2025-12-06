import type { ContentEntities } from '#shared/types/entity';
type ParsedToken = {
  type: 'text' | 'mention' | 'hashtag' | 'link';
  value: string;
  display?: string;
  key: string;
};

export function parseContentEntities(
  content: string | null,
  contentEntities: ContentEntities | null | undefined,
): ParsedToken[] {
  if (content === null) {
    return [];
  }

  const tokens: ParsedToken[] = [];
  const entities: {
    start: number;
    end: number;
    type: ParsedToken['type'];
    value: string;
    display?: string;
  }[] = [];

  contentEntities?.mentions?.forEach((m) =>
    entities.push({
      start: m.startPosition,
      end: m.startPosition + m.username.length + 1,
      type: 'mention',
      value: m.username,
      display: `@${m.username}`,
    }),
  );
  contentEntities?.hashtags?.forEach((h) =>
    entities.push({
      start: h.startPosition,
      end: h.startPosition + h.hashtag.length + 1,
      type: 'hashtag',
      value: h.hashtag,
      display: `#${h.hashtag}`,
    }),
  );

  const urlRegex = /https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g;

  for (const match of content.matchAll(urlRegex)) {
    let raw = match[0];
    const start = match.index;

    // Trim trailing punctuation
    const trimEnd = raw.search(/[.,!?;:)\]}'"]+$/);
    if (trimEnd !== -1) {
      raw = raw.slice(0, trimEnd);
    }

    if (!raw) continue;

    // Create display: remove protocol and trailing slash
    const display = raw.replace(/^https?:\/\//, '').replace(/\/$/, '');

    entities.push({
      start,
      end: start + raw.length,
      type: 'link',
      value: raw,
      display,
    });
  }

  entities.sort((a, b) => a.start - b.start);

  let cursor = 0;
  let tokenId = 0;

  for (const e of entities) {
    if (cursor < e.start) {
      tokens.push({
        type: 'text',
        value: content.slice(cursor, e.start),
        key: `text-${tokenId++}`,
        display: content.slice(cursor, e.start),
      });
    }

    tokens.push({
      type: e.type,
      value: e.value,
      key: `${e.type}-${tokenId++}`,
      display: e.display,
    });

    cursor = e.end;
  }

  if (cursor < content.length) {
    tokens.push({
      type: 'text',
      value: content.slice(cursor),
      key: `text-${tokenId++}`,
      display: content.slice(cursor),
    });
  }

  return tokens;
}
