import { handlers as loginHandlers } from './handlers/login';
import { handlers as userHandlers } from './handlers/user';
import { handlers as tweetHandlers } from './handlers/tweet';
import { handlers as passwordHandlers } from './handlers/password';
// Import more handlers as needed

export const handlers = [...userHandlers, ...loginHandlers, ...tweetHandlers, ...passwordHandlers];
