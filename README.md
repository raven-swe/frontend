<div align="center">
  <img src="../cp/assets/images/light-raven.png" alt="Raven Logo" width="150" height="150">

# Raven Web App

**Caw Your Thoughts**

A modern, responsive web application for the Raven social media platform built with Nuxt 4 and Vue 3.

[![Nuxt](https://img.shields.io/badge/Nuxt-4.1-00DC82?logo=nuxtdotjs)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

</div>

## Features

### Authentication & Security

- **Email/Password Authentication** - Secure sign-up and sign-in with form validation
- **OAuth Integration** - Google and GitHub OAuth 2.0 authentication
- **Password Recovery** - Forgot password flow with email-based reset
- **Session Persistence** - Automatic token refresh and session management
- **reCAPTCHA Protection** - Bot prevention on authentication forms

### Timeline & Feed

- **Home Timeline** - Personalized feed with posts from followed users
- **Real-time Updates** - Live feed updates via Server-Sent Events (SSE)
- **Infinite Scrolling** - Smooth cursor-based pagination
- **Pull-to-Refresh** - Mobile-friendly feed refresh

### Tweets/Posts

- **Tweet Composer** - Rich text editor with:
  - Hashtag highlighting and auto-linking
  - User mention highlighting and auto-linking
  - Native emoji picker integration
  - GIF picker via Tenor API
  - Media attachments (up to 4 images/videos per tweet)
  - Character count with visual indicator
- **Quote Tweets** - Retweet with your own commentary
- **Reply Threads** - Nested conversation threads
- **Tweet Actions** - Like, retweet, quote, reply, and bookmark
- **Media Grid** - Responsive media display for images and videos
- **Video Playback** - Video.js player with full controls

### Direct Messaging

- **Real-time Chat** - Instant messaging with Socket.IO
- **Message Reactions** - React to messages with emojis
- **Image Sharing** - Send and view images in conversations
- **Message Deletion** - Delete sent messages
- **Conversation List** - View all active conversations with unread indicators
- **Sound Notifications** - Audio alerts for new messages

### Explore & Discovery

- **For You** - Algorithmic content discovery based on interests
- **Trending Topics** - Popular hashtags and keywords
- **Category Sections** - Browse by category (News, Sports, Entertainment)
- **User Discovery** - Discover new users to follow

### Search

- **Unified Search** - Search users, tweets, and hashtags
- **Tabbed Results** - Filtered view by content type
- **Recent Searches** - Quick access to search history
- **Real-time Suggestions** - Instant search suggestions

### Profile Management

- **Profile Customization** - Edit display name, bio, location, website
- **Profile Picture** - Upload and crop profile images
- **Header Image** - Custom profile banner
- **Following/Followers** - View and manage connections
- **Profile Tabs** - View tweets, replies, media, and likes
- **User Actions** - Follow, block, mute users

### Bookmarks

- **Save Tweets** - Bookmark tweets for later viewing
- **Bookmark Feed** - Dedicated page for saved tweets

### Notifications

- **Notification Feed** - Real-time notification updates
- **Notification Types** - Likes, retweets, mentions, follows, replies, quotes
- **Read/Unread Status** - Track notification status
- **Filter Options** - Filter by notification type

### Settings & Privacy

- **Appearance** - Theme customization (light/dark mode)
- **Account Settings** - Manage account information and email preferences
- **Privacy Controls**:
  - Muted accounts management
  - Blocked accounts management
- **Sessions** - View and manage active sessions
- **Interest Preferences** - Customize content recommendations

### User Experience

- **Dark Mode** - Manual theme switching with system preference detection
- **RTL Support** - Right-to-left language support for Arabic
- **Localization** - Multi-language support (English & Arabic)
- **Responsive Design** - Mobile-first responsive layouts
- **Toast Notifications** - Non-intrusive feedback messages
- **Skeleton Loading** - Smooth loading states
- **Virtual Scrolling** - Optimized performance for long lists

## Tech Stack

### Core

- **Nuxt** 4.1 - Vue meta-framework with SSR support
- **Vue** 3.5 - Progressive JavaScript framework
- **TypeScript** 5.9 - Type-safe JavaScript

### State Management

- **Pinia** 3.0 - Intuitive Vue store
- **TanStack Query** (Vue Query) - Server state and caching

### Styling

- **TailwindCSS** 4.1 - Utility-first CSS framework
- **Tailwind Merge** - Merge Tailwind classes intelligently
- **Class Variance Authority** - Variant-based component styling
- **tw-animate-css** - CSS animation utilities

### UI Components

- **Reka UI** - Headless UI components
- **Lucide Icons** - Modern icon set
- **Vue Sonner** - Toast notifications
- **Vue Frimousse** - Emoji picker

### Forms & Validation

- **VeeValidate** - Form handling and validation
- **Yup / Zod** - Schema validation libraries

### Real-time Communication

- **Socket.IO Client** - WebSocket-based real-time messaging
- **Event Source Polyfill** - SSE support for older browsers

### Media

- **Nuxt Image** - Optimized image handling
- **Video.js** - Video player

### Utilities

- **VueUse** - Collection of Vue composition utilities
- **Lodash** - Utility functions
- **Embla Carousel** - Carousel component

### Testing

- **Vitest** - Unit testing framework
- **Vue Test Utils** - Vue component testing
- **Testing Library** - DOM testing utilities
- **Cypress** - End-to-end testing
- **MSW** - API mocking for tests
- **Playwright** - Browser automation

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AhmedAmrNabil/raven-frontend
   cd raven-frontend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration values.

4. Start the development server:

   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`.

## Scripts

| Command              | Description               |
| -------------------- | ------------------------- |
| `pnpm dev`           | Start development server  |
| `pnpm build`         | Build for production      |
| `pnpm start`         | Start production server   |
| `pnpm generate`      | Generate static site      |
| `pnpm preview`       | Preview production build  |
| `pnpm lint`          | Run ESLint with auto-fix  |
| `pnpm lint:check`    | Run ESLint without fix    |
| `pnpm format`        | Format code with Prettier |
| `pnpm format:check`  | Check code formatting     |
| `pnpm test`          | Run unit tests            |
| `pnpm test:cov`      | Run tests with coverage   |
| `pnpm test:e2e`      | Run Cypress E2E tests     |
| `pnpm test:e2e:open` | Open Cypress test runner  |
| `pnpm mock:gen`      | Generate mock data        |

## Docker

Build the Docker image:

```bash
docker build -t raven-frontend .
```

Run with Docker Compose:

```bash
docker-compose up
```

## Configuration

### Environment Variables

Key environment variables (see `.env.example` for full list):

| Variable                          | Description                    |
| --------------------------------- | ------------------------------ |
| `BACKEND_URL`                     | Backend API URL                |
| `NUXT_PUBLIC_USE_MOCKS`           | Enable mock data mode          |
| `NUXT_PUBLIC_GOOGLE_CLIENT_ID`    | Google OAuth client ID         |
| `NUXT_PUBLIC_GITHUB_CLIENT_ID`    | GitHub OAuth client ID         |
| `NUXT_PUBLIC_GITHUB_REDIRECT_URI` | GitHub OAuth callback URL      |
| `NUXT_PUBLIC_GOOGLE_REDIRECT_URI` | Google OAuth callback URL      |
| `NUXT_PUBLIC_RECAPTCHA_SITE_KEY`  | reCAPTCHA site key             |
| `NUXT_PUBLIC_BASE_URL`            | Frontend base URL              |
| `NUXT_PUBLIC_DM_WS_URL`           | Direct messaging WebSocket URL |
| `RAVEN_TENOR_KEY`                 | Tenor API key for GIF picker   |

## Licenses

### Fonts

- **Inter** - The app uses the [Inter font family](https://fonts.google.com/specimen/Inter) by Rasmus Andersson, licensed under the [SIL Open Font License 1.1](https://scripts.sil.org/OFL). Loaded via `@nuxt/fonts` from Google Fonts.

### Icons

- **Lucide Icons** - Licensed under the [ISC License](https://github.com/lucide-icons/lucide/blob/main/LICENSE).
- **Material Design Icons (ic)** - Licensed under the [Apache License 2.0](https://github.com/Templarian/MaterialDesign/blob/master/LICENSE).

### Media

- **Sound Effects** - Notification sound in `public/sounds/`.
- **App Images** - App logo and favicon are original assets created for this project.
- **User-uploaded Content** - Subject to the platform's terms of service.

### Third-Party Libraries

All third-party dependencies are listed in `package.json` with their respective licenses. Key libraries:

- **Video.js** - Licensed under the [Apache License 2.0](https://github.com/videojs/video.js/blob/main/LICENSE).
- **Reka UI** - Licensed under the [MIT License](https://github.com/unovue/reka-ui/blob/main/LICENSE).
- **VueUse** - Licensed under the [MIT License](https://github.com/vueuse/vueuse/blob/main/LICENSE).

## Code Quality

The project enforces code quality with:

- **ESLint** - Linting with Nuxt and TypeScript rules
- **Prettier** - Code formatting with Tailwind plugin
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files
- **TypeScript** - Strict type checking

## License

This project is licensed under the [MIT License](LICENSE).
