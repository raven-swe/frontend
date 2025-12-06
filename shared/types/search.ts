import type { PaginationParams } from '~~/shared/types/pagination';
import type { validSearchTweetsTabs } from '~~/shared/types/timeline';

export enum PeopleFilter {
  anyone = 'anyone',
  following = 'following',
}

export interface SearchQuery {
  pagination: PaginationParams;
  query: string;
  peopleFilter: PeopleFilter;
  excludeMutedAndBlocked: boolean;
}

export interface TweetsSearchQuery extends SearchQuery {
  tab: (typeof validSearchTweetsTabs)[number];
}
