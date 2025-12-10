export const validHomeTabs = ['following', 'for-you'] as const;
export type HomeTab = (typeof validHomeTabs)[number];

export const validExploreTabs = ['trending', 'news', 'sports', 'entertainment'] as const;
export type ExploreTab = (typeof validExploreTabs)[number];

export const validSearchTabs = ['top', 'latest', 'media', 'people'] as const;
export type SearchTab = (typeof validSearchTabs)[number];

export const validSearchTweetsTabs = ['top', 'latest', 'media'] as const;
