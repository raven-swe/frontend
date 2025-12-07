import { handlers as tweetHandlers } from './handlers/tweet';
import { handlers as oauthHandlers } from './handlers/oauth';
import { handlers as registerHandlers } from './handlers/register';
import { handlers as loginHandlers } from './handlers/login';
import { handlers as passwordHandlers } from './handlers/password';
import { handlers as profileHandlers } from './handlers/update-profile';
import { handlers as authHandlers } from './handlers/auth';
import { handlers as onboardingHandlers } from './handlers/onboarding';
import { handlers as otherUserHandlers } from './handlers/other-user';
import { handlers as dmHandlers } from './handlers/dm';
import { handlers as profileInteractionsHandlers } from './handlers/profile-interactions';
import { handlers as notificationHandlers } from './handlers/notifications';

export const handlers = [
  ...registerHandlers,
  ...loginHandlers,
  ...tweetHandlers,
  ...oauthHandlers,
  ...passwordHandlers,
  ...authHandlers,
  ...profileHandlers,
  ...otherUserHandlers,
  ...onboardingHandlers,
  ...dmHandlers,
  ...profileInteractionsHandlers,
  ...notificationHandlers,
];
