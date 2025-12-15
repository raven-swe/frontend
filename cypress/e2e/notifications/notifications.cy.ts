/*tabs:
        a 'notifications-all-tab'
        a 'notifications-mentions-tab'
        */
/*
        data-cy="notification-item" ->
        data-cy="notification-like" (has a preview of data-cy="quoted-tweet-content")
        data-cy="notification-follow"
        data-cy="notification-retweet" (has a preview of data-cy="quoted-tweet-content")
        data-cy="notification-reply"
        it has a data-cy="tweet" comonent if it's a quoted tweet notification
        */
/* mentions notification has data-cy="tweet"
 */
/*
       notification counter is data-cy="left-sidebar-tab-badge-notifications"
       */
describe('Notification Tab', { testIsolation: false }, function () {
  let masterUser: { username: string; email: string; password: string };
  let slaveUser: { username: string; email: string; password: string };

  before(function () {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.createTestUser().then((mUser) => {
      masterUser = mUser;
      cy.createTestUser().then((sUser) => {
        slaveUser = sUser;
        // Login as master user
        cy.login(mUser.email, mUser.password);
        cy.loginExternal(sUser.email, sUser.password);
        const timestamp = Date.now();
        const shorterUsername = 'notiuser' + String(timestamp).slice(-5);
        cy.changeUsername(shorterUsername);
        masterUser.username = shorterUsername;
        cy.wrap(masterUser).as('masterUser');
        cy.wrap(sUser).as('slaveUser');
      });
    });
    cy.visitAndWaitForHydration('/');
  });
  // Restore aliases before each test
  beforeEach(function () {
    if (masterUser) cy.wrap(masterUser).as('masterUser');
    if (slaveUser) cy.wrap(slaveUser).as('slaveUser');
  });
  // describe('Notification Items', function () {
  //     it('should update notifications counter & tabs', function () {
  //         // Post a tweet as master and like it as slave to generate a notification
  //         cy.postTweet('Notification test tweet from master user.').then((tweet) => {
  //           cy.likeTweet(tweet.id, true, true); // like as slave user
  //           // Check notification badge
  //           cy.get('span[data-cy="left-sidebar-tab-badge-notifications"]').should('exist').and('contain.text', '1');
  //           // Visit notifications page
  //             cy.visitAndWaitForHydration('/notifications');
  //             // Check that "All" tab is active and has the notification
  //             cy.get('a[data-cy="notifications-all-tab"]').should('be.visible')
  //             cy.get('a[data-cy="notifications-mentions-tab"]').should('be.visible')

  //             // Check that the notification item exists
  //             cy.get('div[data-cy="notification-item"]').should('exist').within(() => {
  //               cy.get('[data-cy="notification-like"]').should('exist');
  //               // should be one quoted tweet content
  //               cy.get('[data-cy="quoted-tweet-content"]').its('length').should('eq', 1);
  //               cy.get('[data-cy="quoted-tweet-content"]').should('contain.text', 'Notification test tweet from master user.');
  //               // counter should be gone after viewing
  //                 cy.get('span[data-cy="left-sidebar-tab-badge-notifications"]').should('not.exist');
  //             });
  //         });
  //     });
  // });
  describe('Real-time Notifications', function () {
    before(function () {
      // Ensure we start from notifications page
      cy.visitAndWaitForHydration('/notifications');
    });
    // it('should receive like notifications', function () {
    //     // Post a tweet as master
    //     cy.postTweet('Real-time notification test tweet from master user.').then((tweet) => {
    //       // Like the tweet as slave to trigger notification
    //         cy.likeTweet(tweet.id, true, true); // like as slave user
    //         // Check that the notification item appears in real-time
    //         cy.get('div[data-cy="notification-item"] [data-cy="notification-like"] [data-cy="quoted-tweet-content"]').should('contain.text', 'Real-time notification test tweet from master user.');
    //     });
    // });
    it('should receive follow notifications', function () {
      // Slave user follows master user to trigger notification
      cy.followUser(this.masterUser.username, true, true); // use external token
      // Check that the notification item appears in real-time
      cy.get('div[data-cy="notification-item"] [data-cy="notification-follow"]')
        .should('exist')
        .and('contain.text', this.slaveUser.username);
    });
    it('should receive reply notifications', function () {
      // Post a tweet as master
      cy.postTweet('Real-time reply notification test tweet from master user.').then((tweet) => {
        // Reply to the tweet as slave to trigger notification
        cy.postTweet('This is a reply from slave user.', [], tweet.id, undefined, true); // reply as slave user
        // Check that the notification item appears in real-time
        cy.get(
          'div[data-cy="notification-item"] [data-cy="notification-reply"] [data-cy="quoted-tweet-content"]',
        ).should('contain.text', 'This is a reply from slave user.');
      });
    });
    it('should receive retweet notifications', function () {
      // Post a tweet as master
      cy.postTweet('Real-time retweet notification test tweet from master user.').then((tweet) => {
        // Retweet the tweet as slave to trigger notification
        cy.retweetTweet(tweet.id, true, true); // retweet as slave user
        // Check that the notification item appears in real-time
        cy.get(
          'div[data-cy="notification-item"] [data-cy="notification-retweet"] [data-cy="quoted-tweet-content"]',
        ).should('contain.text', 'Real-time retweet notification test tweet from master user.');
      });
    });
    it('should receive quote retweet notifications', function () {
      // Post a tweet as master
      cy.postTweet('Real-time quote retweet notification test tweet from master user.').then(
        (tweet) => {
          // Quote retweet the tweet as slave to trigger notification
          cy.postTweet('This is a quote retweet from slave user.', [], undefined, tweet.id, true);
          // Check that the notification item appears in real-time
          cy.get('div[data-cy="notification-item"] [data-cy="tweet"]')
            .first()
            .within(() => {
              cy.get('[data-cy="quoted-tweet-content"]').should(
                'contain.text',
                'Real-time quote retweet notification test tweet from master user.',
              );
              cy.get('[data-cy="tweet-content"]').should(
                'contain.text',
                'This is a quote retweet from slave user.',
              );
            });
        },
      );
    });
    it('should receive mention notifications', function () {
      // in both tabs
      // Post a tweet as slave mentioning master to trigger notification
      cy.postTweet(
        `@${this.masterUser.username} This is a mention from slave user.`,
        [],
        undefined,
        undefined,
        true,
      );
      // Check that the notification item appears in real-time in "All" tab
      cy.get('div[data-cy="notification-item"] [data-cy="tweet"] [data-cy="tweet-content"]').should(
        'contain.text',
        `@${this.masterUser.username} This is a mention from slave user.`,
      );
      // Switch to "Mentions" tab
      cy.get('a[data-cy="notifications-mentions-tab"]').click();
      // Check that the notification item appears in "Mentions" tab
      cy.get('[data-cy="tweet"] [data-cy="tweet-content"]').should(
        'contain.text',
        `@${this.masterUser.username} This is a mention from slave user.`,
      );
      // post another mention to check real-time in mentions tab
      cy.postTweet(
        `@${this.masterUser.username} Another mention from slave user.`,
        [],
        undefined,
        undefined,
        true,
      );
      cy.get('[data-cy="tweet"] [data-cy="tweet-content"]').should(
        'contain.text',
        `@${this.masterUser.username} Another mention from slave user.`,
      );
    });
  });
});
