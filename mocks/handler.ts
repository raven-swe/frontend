import { loginHandlers } from './handlers/login';
import { handlers as userHandlers } from './handlers/user';
import { handlers as tweetHandlers } from './handlers/tweet';
import { handlers as profileHandlers } from './handlers/update-profile';
// Import more handlers as needed

export const handlers = [...userHandlers, ...loginHandlers, ...tweetHandlers, ...profileHandlers];
