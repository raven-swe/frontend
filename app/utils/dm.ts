import type { DmMessage } from '#shared/types/dm';

export type DmSegment = { type: 'text' | 'mention' | 'hashtag'; value: string };

export function renderSegments(message: DmMessage): DmSegment[] {
  if (!message.content) return [];
  const mentions = message.entities.mentions.map((x) => '@' + x.username);
  const hashtags = message.entities.hashtags.map((x) => '#' + x.hashtag);
  if (!mentions.length && !hashtags.length) return [{ type: 'text', value: message.content }];
  const tokens = message.content.split(/(\s+)/);
  return tokens.map((token) => {
    if (token.trim() === '') return { type: 'text', value: token };
    if (mentions.includes(token)) return { type: 'mention', value: token.substring(1) };
    if (hashtags.includes(token)) return { type: 'hashtag', value: token.substring(1) };
    return { type: 'text', value: token };
  });
}

export function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
