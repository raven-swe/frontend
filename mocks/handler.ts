import { loginHandlers } from './handlers/login';
import { handlers as userHandlers } from './handlers/user';
import { handlers as tweetHandlers } from './handlers/tweet';
import { handlers as oauthHandlers } from './handlers/oauth';
import { handlers as profileHandlers } from './handlers/update-profile';
import { handlers as registerHandlers } from './handlers/register';
// Import more handlers as needed

export const handlers = [
  ...userHandlers,
  ...registerHandlers,
  ...loginHandlers,
  ...tweetHandlers,
  ...oauthHandlers,
  ...profileHandlers,
  // Add More handlers here
];
