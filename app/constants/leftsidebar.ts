import type { LeftSidebarTab } from '~~/shared/types/leftsidebar';

export const SIDEBAR_TABS: LeftSidebarTab[] = [
  {
    label: 'home',
    icon: 'home',
    route: '/home',
  },
  {
    label: 'explore',
    icon: 'search',
    route: '/explore',
  },
  {
    label: 'notifications',
    icon: 'notifications',
    route: '/notifications',
  },
  {
    label: 'messages',
    icon: 'chat',
    route: '/messages',
  },

  {
    label: 'profile',
    icon: 'person',
    route: '/profile',
  },
  {
    label: 'more',
    icon: 'more-horiz',
    route: '#',
  },
];
