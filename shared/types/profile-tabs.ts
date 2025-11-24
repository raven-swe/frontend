export const validProfileTabs = ['', 'replies', 'likes'] as const;
export type Tab = (typeof validProfileTabs)[number];
