describe('Profile Page Actions', () => {
  beforeEach(() => {
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
  });
  describe('Profile Data Display', () => {
    it('should display profile information correctly', function () {
      cy.visitAndWaitForHydration(`/profile/${this.masterUser.username}`);
      cy.get('[data-cy="profile-user-name"]').should('contain.text', this.masterUser.username);
      cy.get('[data-cy="profile-display-name"]').should(
        'contain.text',
        this.masterUser.displayName,
      );
      // Additional checks for tweets, likes, replies, media can be added here
    });

    it('should show correct following/followers count', function () {
      cy.visitAndWaitForHydration(`/profile/${this.masterUser.username}`);
      cy.get('[data-cy="profile-following-count"]').should('exist').should('contain.text', '0');
      cy.get('[data-cy="profile-followers-count"]').should('exist').should('contain.text', '0');
      cy.followUser(this.slaveUser.username, true); // follow slave user
      // Reload profile page
      cy.visitAndWaitForHydration(`/profile/${this.masterUser.username}`);
      cy.get('[data-cy="profile-following-count"]').should('exist').should('contain.text', '1');
      cy.get('[data-cy="profile-followers-count"]').should('exist').should('contain.text', '0');
      // Slave user follow master user
      cy.followUser(this.masterUser.username, true, true); // use external token
      // Reload profile page
      cy.visitAndWaitForHydration(`/profile/${this.masterUser.username}`);
      cy.get('[data-cy="profile-followers-count"]').should('exist').should('contain.text', '1');
    });

    it('should display my tweets', function () {
      cy.postTweet('This is a test tweet from master user.');
      cy.visitAndWaitForHydration(`/profile/${this.masterUser.username}`);
      cy.get('[data-cy="profile-posts-tab"]').should('exist').click();
      // get first tweet and check content
      cy.get('[data-cy="tweet-content"]')
        .first()
        .should('contain.text', 'This is a test tweet from master user.');
    });

    it('should display liked tweets', function () {
      cy.postTweet(
        'This is a tweet by slave to be liked by master user.',
        [],
        undefined,
        undefined,
        true,
      ).then((tweet) => {
        cy.likeTweet(tweet.id); // like as master user
        cy.visitAndWaitForHydration(`/profile/${this.masterUser.username}`);
        cy.get('[data-cy="profile-likes-tab"]').should('exist').click();
        // get first tweet and check content
        cy.get('[data-cy="tweet-content"]')
          .first()
          .should('contain.text', 'This is a tweet by slave to be liked by master user.');
        // check like button is active
        cy.get('button[data-cy="tweet-unlike-button"]').first().should('exist', 'active');
        cy.get('span[data-cy="tweet-likes-count"]').first().should('contain.text', '1');
      });
    });

    it('should display replies', function () {
      cy.postTweet(
        'This is a tweet by slave to be replied to by master user.',
        [],
        undefined,
        undefined,
        true,
      ).then((tweet) => {
        cy.postTweet('This is a reply from master user.', [], tweet.id);
        cy.visitAndWaitForHydration(`/profile/${this.masterUser.username}`);
        cy.get('[data-cy="profile-replies-tab"]').should('exist').click();
        // get first tweet and check content
        cy.get('[data-cy="tweet-content"]')
          .first()
          .should('contain.text', 'This is a reply from master user.');
      });
    });

    it('should display media tweets', function () {
      cy.uploadMedia('profile/avatar.png').then((media) => {
        cy.postTweet('This is a media tweet from master user.', [media.id]).then((tweet) => {
          cy.visitAndWaitForHydration(`/profile/${this.masterUser.username}`);
          cy.get('[data-cy="profile-media-tab"]').should('exist').click();
          // get first tweet and check content
          cy.get('[data-cy="thumbnail-image"]').first().should('exist');
          // click to open tweet & check url is /status/:id
          cy.get('[data-cy="thumbnail-image"]').first().click();
          cy.url().should('include', '/status/' + tweet.id);
        });
      });
    });
  });

  describe('Profile Search Functionality', () => {
    it('should search for profiles correctly', function () {
      cy.visitAndWaitForHydration('/explore/for-you');
      cy.get('[data-cy="search-input"]').type(this.slaveUser.username);
      // Check that search results contain the slave user (it might show multiple results)
      cy.get('[data-cy="search-user-result"]').should('contain.text', this.slaveUser.username);
      // Click on the slave user result
      cy.get('[data-cy="search-user-result"]').contains(this.slaveUser.username).click();
      cy.url().should('include', `/profile/${this.slaveUser.username}`);
      cy.get('[data-cy="profile-user-name"]').should('contain.text', this.slaveUser.username);
    });

    it('should show go to profile option for valid usernames', function () {
      cy.visitAndWaitForHydration('/explore/for-you');
      cy.get('[data-cy="search-input"]').type('gelgel');
      cy.get('[data-cy="search-go-to-profile"]')
        .should('exist')
        .should('contain.text', 'gelgel')
        .click();
      cy.url().should('include', `/profile/gelgel`);
      cy.get('[data-cy="profile-user-name"]').should('contain.text', 'gelgel');
    });
  });
});
