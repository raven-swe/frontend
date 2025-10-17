import type { LeftSidebarTab } from '~/types/leftsidebar';

export const SIDEBAR_TABS: LeftSidebarTab[] = [
  {
    label: 'home',
    icon: 'home',
    route: '/home',
  },
  {
    label: 'explore',
    icon: 'magnifying-glass',
    route: '/explore',
  },
  {
    label: 'notifications',
    icon: 'bell',
    route: '/notifications',
  },
  {
    label: 'messages',
    icon: 'envelope',
    route: '/messages',
  },
  {
    label: 'bookmarks',
    icon: 'bookmark',
    route: '/bookmarks',
  },
  {
    label: 'profile',
    icon: 'user',
    route: '/profile',
  },
  {
    label: 'more',
    icon: 'ellipsis-horizontal-circle',
    route: '#',
  },
];
