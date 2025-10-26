import { handlers as userHandlers } from './handlers/user';
import { handlers as registerHandlers } from './handlers/register';
import { handlers as loginHandlers } from './handlers/login';
import { handlers as tweetHandlers } from './handlers/tweet';
import { handlers as passwordHandlers } from './handlers/password';
import { handlers as profileHandlers } from './handlers/update-profile';
// Import more handlers as needed

export const handlers = [
  ...userHandlers,
  ...registerHandlers,
  ...loginHandlers,
  ...tweetHandlers,
  ...passwordHandlers,
  ...profileHandlers,
  // Add More handlers here
];
