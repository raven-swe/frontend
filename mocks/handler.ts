import { handlers as tweetHandlers } from './handlers/tweet';
import { handlers as oauthHandlers } from './handlers/oauth';
import { handlers as registerHandlers } from './handlers/register';
import { handlers as loginHandlers } from './handlers/login';
import { handlers as passwordHandlers } from './handlers/password';
import { handlers as profileHandlers } from './handlers/update-profile';
import { handlers as authHandlers } from './handlers/auth';
import { handlers as otherUserHandlers } from './handlers/other-user';
// Import more handlers as needed

export const handlers = [
  ...registerHandlers,
  ...loginHandlers,
  ...tweetHandlers,
  ...oauthHandlers,
  ...passwordHandlers,
  ...authHandlers,
  ...profileHandlers,
  ...otherUserHandlers,
  // Add More handlers here
];
