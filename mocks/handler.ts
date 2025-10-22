import { loginHandlers } from './handlers/login';
import { handlers as userHandlers } from './handlers/user';
import { handlers as tweetHandlers } from './handlers/tweet';
import { handlers as registerHandlers } from './handlers/register';
import { userProfileHandlers } from './handlers/userProfile';
// Import more handlers as needed

export const handlers = [
  ...userHandlers,
  ...registerHandlers,
  ...loginHandlers,
  ...tweetHandlers,
  ...userProfileHandlers,
  // Add More handlers here
];
