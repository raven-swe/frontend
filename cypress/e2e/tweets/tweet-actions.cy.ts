describe('Tweeting Flow', { testIsolation: false }, function () {
  before(function () {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.visitAndWaitForHydration('/');
    // Create two test users: slave user and master user
    cy.createTestUser().then((masterUser) => {
      cy.createTestUser().then((slaveUser) => {
        cy.wrap(masterUser).as('masterUser');
        cy.wrap(slaveUser).as('slaveUser');
        // Login as master user
        cy.login(masterUser.email, masterUser.password);
        cy.loginExternal(slaveUser.email, slaveUser.password);
      });
    });
    cy.postTweet('This is a tweet to test tweet actions (master)').then((tweet) => {
      cy.wrap(tweet).as('masterTweet');
    });
    cy.postTweet(
      'This is a tweet to test tweet actions (slave)',
      [],
      undefined,
      undefined,
      true,
    ).then((tweet) => {
      cy.wrap(tweet).as('slaveTweet');
    });
  });
  describe('Tweet Actions', function () {
    it('should be able to like/unlike a tweet', function () {
      const tweet = this.slaveTweet;
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}/status/${tweet.id}`);
      // check likes count is 0
      cy.get('span[data-cy="tweet-likes-count"]').should('have.text', '0');
      cy.get('[data-cy="tweet-like-button"]').click().wait(500); // wait for the animation
      // check likes count is 1
      cy.get('span[data-cy="tweet-likes-count"]').should('have.text', '1');
      cy.get('[data-cy="tweet-unlike-button"]').should('exist').click().wait(500);
      cy.get('[data-cy="tweet-like-button"]').should('exist');
      // check likes count is 0
      cy.get('span[data-cy="tweet-likes-count"]').should('have.text', '0');
    });
    it('should be able to retweet/unretweet a tweet', function () {
      const tweet = this.slaveTweet;
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}/status/${tweet.id}`);
      // check retweets count is 0
      cy.get('span[data-cy="tweet-retweet-count"]').should('have.text', '0');
      cy.get('[data-cy="tweet-retweet-button"]').click();
      cy.get('[data-cy="tweet-retweet-action"]')
        .should('exist')
        .and('contain.text', 'Repost')
        .click();
      // check retweets count is 1
      cy.get('span[data-cy="tweet-retweet-count"]').should('have.text', '1');
      cy.get('[data-cy="tweet-retweet-button"]').click();
      cy.get('[data-cy="tweet-retweet-action"]')
        .should('exist')
        .and('contain.text', 'Undo repost')
        .click();
      // check retweets count is 0
      cy.get('span[data-cy="tweet-retweet-count"]').should('have.text', '0');
    });
    it('should be able to quote a tweet', function () {
      const tweet = this.slaveTweet;
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}/status/${tweet.id}`);
      cy.get('[data-cy="tweet-retweet-button"]').click();
      cy.get('[data-cy="tweet-quote-action"]').should('exist').click();
      cy.get('[data-cy="dialog-content-body"]')
        .should('exist')
        .within(() => {
          cy.get('textarea[placeholder="Add a comment"]')
            .should('exist')
            .type('This is a quote tweet');
          cy.get('[data-cy="tweet-composer-post-button"]')
            .should('exist')
            .and('not.be.disabled')
            .click();
        });
      cy.contains('Tweet posted successfully').should('be.visible');
      cy.wait(300);
      // Shouldn't affect original tweet's retweet count
      cy.get('span[data-cy="tweet-retweet-count"]').should('have.text', '0');
    });
    it('should be able to delete a tweet', function () {
      const tweet = this.masterTweet;
      cy.visitAndWaitForHydration(`/profile/${this.masterUser.username}/status/${tweet.id}`);
      cy.get('[data-cy="tweet-view-dropdown-trigger"]').click();
      cy.get('[data-cy="tweet-dropdown-delete-item"]').should('exist').click();
      cy.get('[data-cy="tweet-delete-cancel-button"]').should('exist');
      cy.get('[data-cy="tweet-delete-confirm-button"]').should('exist').click();
      // Verify tweet is deleted by checking for "Sorry, this tweet doesn't exist" message
      cy.contains("Sorry, this tweet doesn't exist").should('exist');
    });
    it("shouldn't show delete option for other user's tweet", function () {
      const tweet = this.slaveTweet;
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}/status/${tweet.id}`);
      cy.get('[data-cy="tweet-view-dropdown-trigger"]').click();
      cy.get('[data-cy="tweet-dropdown-delete-item"]').should('not.exist');
    });
    it('should be able to get AI summary of a tweet', function () {
      const tweet = this.slaveTweet;
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}/status/${tweet.id}`);
      cy.get('[data-cy="tweet-view-ai-summary-button"]').click();
      cy.get('[data-cy="tweet-ai-summary-container"]').should('exist');
      cy.get('[data-cy="tweet-ai-summary-close-button"]').should('exist');
    });
  });

  describe('List of Retweeters and Likers', function () {
    beforeEach(function () {
      cy.postTweet(
        'This is a tweet to test retweeters and likers (master)',
        [],
        undefined,
        undefined,
        true,
      ).then((tweet) => {
        cy.likeTweet(tweet.id, true);
        cy.likeTweet(tweet.id, true, true); // like from slave user
        cy.retweetTweet(tweet.id, true, true); // retweet from slave user
        cy.postTweet('quote tweet to test quotes list', [], undefined, tweet.id, true); // quote from slave user
        cy.wrap(tweet).as('masterTweetForLists');
      });
    });
    it('should display list of likers', function () {
      const tweet = this.masterTweetForLists;
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}/status/${tweet.id}`);
      cy.get('[data-cy="tweet-view-dropdown-trigger"]').click();
      cy.get('[data-cy="tweet-dropdown-likes-link"]').should('exist').click();
      cy.url().should('include', `/status/${tweet.id}/likes`);
      // Check that both users are in the likers list
      cy.get('[data-cy="main-content"]').within(() => {
        cy.get('[data-cy="user-row"]').should('have.length', 2);
        cy.get('[data-cy="user-row"]').contains(this.masterUser.username).should('exist');
        cy.get('[data-cy="user-row"]').contains(this.slaveUser.username).should('exist');
      });
    });
    it('should display list of retweeters', function () {
      const tweet = this.masterTweetForLists;
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}/status/${tweet.id}`);
      cy.get('[data-cy="tweet-view-dropdown-trigger"]').click();
      cy.get('[data-cy="tweet-dropdown-likes-link"]').should('exist').click();
      cy.url().should('include', `/status/${tweet.id}/likes`);
      cy.get('[data-cy="tweet-engagement-reposts-tab"]').should('exist').click();
      cy.url().should('include', `/status/${tweet.id}/reposts`);
      // Check that slave user is in the retweeters list
      cy.get('[data-cy="main-content"]').within(() => {
        cy.get('[data-cy="user-row"]').should('have.length', 1);
        cy.get('[data-cy="user-row"]').contains(this.slaveUser.username).should('exist');
      });
    });
    it('should display list of quoters', function () {
      const tweet = this.masterTweetForLists;
      cy.visitAndWaitForHydration(`/profile/${this.slaveUser.username}/status/${tweet.id}`);
      cy.get('[data-cy="tweet-view-dropdown-trigger"]').click();
      cy.get('[data-cy="tweet-dropdown-likes-link"]').should('exist').click();
      cy.url().should('include', `/status/${tweet.id}/likes`);
      cy.get('[data-cy="tweet-engagement-quotes-tab"]').should('exist').click();
      cy.url().should('include', `/status/${tweet.id}/quotes`);
      cy.get('[data-cy="main-content"]').within(() => {
        cy.get('[data-cy="tweet-content"]').should('have.length', 1);
        cy.get('[data-cy="tweet-content"]')
          .contains('quote tweet to test quotes list')
          .should('exist');
        cy.get('[data-cy="quoted-tweet-content"]')
          .contains('This is a tweet to test retweeters and likers (master)')
          .should('exist');
      });
    });
  });
});
