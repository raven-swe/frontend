import { loginHandlers } from './handlers/login';
import { handlers as userHandlers } from './handlers/user';

// Import more handlers as needed

export const handlers = [
  ...userHandlers,
  ...loginHandlers,
  // Add More handlers here
];
