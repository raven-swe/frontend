import { handlers as userHandlers } from './handlers/user';
import { handlers as registerHandlers } from './handlers/register';
// Import more handlers as needed

export const handlers = [
  ...userHandlers,
  ...registerHandlers,
  // Add More handlers here
];
