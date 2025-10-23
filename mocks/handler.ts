import { handlers as userHandlers } from './handlers/user';
import { handlers as tweetHandlers } from './handlers/tweet';
import { handlers as oauthHandlers } from './handlers/oauth';
// Import more handlers as needed

export const handlers = [
  ...userHandlers,
  ...tweetHandlers,
  ...oauthHandlers,
  // Add More handlers here
];
