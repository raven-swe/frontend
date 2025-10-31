import { handlers as userHandlers } from './handlers/user';
import { handlers as tweetHandlers } from './handlers/tweet';
import { handlers as oauthHandlers } from './handlers/oauth';
import { handlers as registerHandlers } from './handlers/register';
import { handlers as loginHandlers } from './handlers/login';
import { handlers as passwordHandlers } from './handlers/password';
import { handlers as profileHandlers } from './handlers/update-profile';
import { handlers as authHandlers } from './handlers/auth';
import { userProfileHandlers } from './handlers/userProfile';
// Import more handlers as needed

export const handlers = [
  ...userHandlers,
  ...registerHandlers,
  ...loginHandlers,
  ...tweetHandlers,
  ...oauthHandlers,
  ...passwordHandlers,
  ...authHandlers,
  ...profileHandlers,
  ...userProfileHandlers,
  // Add More handlers here
];
