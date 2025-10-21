import { handlers as userHandlers } from './handlers/user';
import { handlers as tweetHandlers } from './handlers/tweet';
import { handlers as registerHandlers } from './handlers/register';
// Import more handlers as needed

export const handlers = [
  ...userHandlers,
  ...registerHandlers,
  ...tweetHandlers,
  // Add More handlers here
];
