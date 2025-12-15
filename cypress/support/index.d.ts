/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to mock reCAPTCHA functionality in tests
     * @example cy.mockRecaptcha()
     */
    mockRecaptcha(): Chainable<void>;

    /**
     * Custom command to get OTP from test endpoint
     * @param identifier - Email or phone number
     * @param type - Type of OTP (registration or password-reset)
     * @example cy.getOTP('user@example.com', 'registration')
     */
    getOTP(
      identifier: string,
      type: 'registration' | 'forgotPassword' | 'changeEmail',
    ): Chainable<string>;

    /**
     * Custom command to create a test user and retrieve its info
     * @example cy.createTestUser()
     */
    createTestUser(): Chainable<{
      id: string;
      email: string;
      username: string;
      password: string;
      passwordHash: string;
      birthdate: string;
      createdAt: string;
    }>;
    /**
     * Custom command to visit a page and wait for Nuxt hydration
     * @param url - URL to visit
     * @example cy.visitAndWaitForHydration('/home')
     */
    visitAndWaitForHydration(url: string): Chainable<void>;

    /**
     * Custom command to log in with session caching
     * @param email - User email
     * @param password - User password
     * @example cy.login('user@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>;

    /**
     * Custom command to login with external access token
     * @param email - User email
     * @param password - User password
     * @example cy.loginExternal('user@example.com', 'password123')
     */
    loginExternal(email: string, password: string): Chainable<void>;

    /**
     * Custom command to mute or unmute a user
     * @param userName - Username of the user to mute/unmute
     * @param mute - true to mute, false to unmute (default: true)
     * @example cy.muteUser('someuser', true) // Mute user
     * @example cy.muteUser('someuser', false) // Unmute user
     */
    muteUser(userName: string, mute?: boolean, useSlave?: boolean): Chainable<void>;

    /**
     * Custom command to block or unblock a user
     * @param userName - Username of the user to block/unblock
     * @param block - true to block, false to unblock (default: true)
     * @example cy.blockUser('someuser', true) // Block user
     * @example cy.blockUser('someuser', false) // Unblock user
     */
    blockUser(userName: string, block?: boolean, useSlave?: boolean): Chainable<void>;

    /**
     * Custom command to follow or unfollow a user
     * @param userName - Username of the user to follow/unfollow
     * @param follow - true to follow, false to unfollow (default: true)
     * @example cy.followUser('someuser', true) // Follow user
     * @example cy.followUser('someuser', false) // Unfollow user
     */
    followUser(userName: string, follow?: boolean, useSlave?: boolean): Chainable<void>;

    /**
     * Custom command to upload media files
     * @param filePath - Path to the media file
     * @param folder - Destination folder (default: 'tweets')
     * @param useSlave - Whether to use external access token (default: false)
     * @example cy.uploadMedia('path/to/image.jpg', 'tweets', false)
     */
    uploadMedia(
      filePath: string,
      folder?: string,
      useSlave?: boolean,
    ): Chainable<Record<string, unknown>>;
    /**
     * Custom command to post a tweet
     * @param content - Content of the tweet
     * @param mediaIds - Array of media IDs to attach (default: [])
     * @param useSlave - Whether to use external access token (default: false)
     * @example cy.postTweet('Hello world!', [], false)
     */
    postTweet(
      content: string,
      mediaIds?: string[],
      replyToTweetId?: string | number,
      quoteToTweetId?: string | number,
      useSlave?: boolean,
    ): Chainable<Record<string, unknown>>;

    /**
     * Custom command to like or unlike a tweet
     * @param tweetId - ID of the tweet to like/unlike
     * @param like - true to like, false to unlike (default: true)
     * @param useSlave - Whether to use external access token (default: false)
     * @example cy.likeTweet(12345, true, false) // Like tweet
     * @example cy.likeTweet(12345, false, false) // Unlike tweet
     */
    likeTweet(tweetId: string | number, like?: boolean, useSlave?: boolean): Chainable<void>;

    /**
     * Custom command to retweet or unretweet a tweet
     * @param tweetId - ID of the tweet to retweet/unretweet
     * @param retweet - true to retweet, false to unretweet (default: true)
     * @param useSlave - Whether to use external access token (default: false)
     * @example cy.retweetTweet(12345, true, false) // Retweet tweet
     * @example cy.retweetTweet(12345, false, false) // Unretweet tweet
     */
    retweetTweet(tweetId: string | number, retweet?: boolean, useSlave?: boolean): Chainable<void>;

    /**
     * Custom command to change username
     * @param newUsername - New username to set
     * @param useSlave - Whether to use external access token (default: false)
     * @example cy.changeUsername('newusername', false)
     */
    changeUsername(newUsername: string, useSlave?: boolean): Chainable<void>;
  }
}
