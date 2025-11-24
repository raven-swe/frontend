export const validHomeTabs = ['following', 'for-you'] as const;
export type HomeTab = (typeof validHomeTabs)[number];
