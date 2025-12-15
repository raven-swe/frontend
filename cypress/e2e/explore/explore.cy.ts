describe('Explore Page', { testIsolation: false }, function () {
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
        cy.wrap(mUser).as('masterUser');
        cy.wrap(sUser).as('slaveUser');
        // Login as master user
        cy.login(mUser.email, mUser.password);
        cy.loginExternal(sUser.email, sUser.password);
      });
    });
  });
  // Restore aliases before each test
  beforeEach(function () {
    if (masterUser) cy.wrap(masterUser).as('masterUser');
    if (slaveUser) cy.wrap(slaveUser).as('slaveUser');
    cy.visitAndWaitForHydration('/explore');
  });
  describe('Navigation and Items', function () {
    it('it should show tabs', function () {
      cy.get('a[data-cy="explore-for-you-tab"]').should('exist');
      cy.get('a[data-cy="explore-trending-tab"]').should('exist');
      cy.get('a[data-cy="explore-news-tab"]').should('exist');
      cy.get('a[data-cy="explore-sports-tab"]').should('exist');
      cy.get('a[data-cy="explore-entertainment-tab"]').should('exist');
    });
    it('should show who to follow card with functionality', function () {
      cy.get('div[data-cy="who-to-follow-card"]').should('exist');
      cy.get('div[data-cy="who-to-follow-card"]')
        .find('[data-cy="user-row"]')
        .its('length')
        .should('be.gte', 1);
      // Check that follow buttons exist
      cy.get('div[data-cy="who-to-follow-card"]').within(() => {
        cy.get('button[data-cy="profile-follow-button"]').first().should('exist').click();
        cy.get('button[data-cy="profile-unfollow-button"]').first().should('exist');
      });
    });
    it('should show trending and who to follow cards in home page', function () {
      cy.visitAndWaitForHydration('/');
      cy.get('div[data-cy="whats-happening-card"]').should('exist');
      cy.get('div[data-cy="who-to-follow-card"]').should('exist');
      cy.get('div[data-cy="who-to-follow-card"]')
        .find('[data-cy="user-row"]')
        .its('length')
        .should('be.gte', 1);
      cy.get('div[data-cy="whats-happening-card"]')
        .find('[data-cy="explore-hashtag-item"]')
        .its('length')
        .should('be.gte', 1);
      cy.get('div[data-cy="whats-happening-card"]')
        .find('button[data-cy="show-more-hashtags-button"]')
        .should('exist')
        .click();
      cy.url().should('include', '/explore/');
    });
    it('trending tab should be clickable and show hashtags', function () {
      cy.get('a[data-cy="explore-trending-tab"]').should('exist').click();
      cy.url().should('include', '/explore/trending');
      cy.get('[data-cy="explore-hashtag-item"]').its('length').should('be.gte', 1);
    });
    it('should show for-you tab with hashtags and tweets', function () {
      cy.get('a[data-cy="explore-for-you-tab"]').should('exist').click();
      cy.url().should('include', '/explore/for-you');
      cy.get('[data-cy="explore-hashtag-item"]').its('length').should('be.gte', 1);
      // cy.get('[data-cy="tweet"]').its('length').should('be.gte', 1);
    });
    it('should navigate to Search when clicking on hashtag item', function () {
      cy.get('[data-cy="explore-hashtag-item"]')
        .first()
        .within(() => {
          cy.get('p[data-cy="explore-hashtag-text"]')
            .invoke('text')
            .then((text) => {
              cy.get('p[data-cy="explore-hashtag-text"]').click();
              cy.url().should('include', `/search/top?q=${text}`);
            });
        });
    });
    it('news, sports, entertainment tabs should either show trends or nothing', function () {
      const tabs = [
        { name: 'news', selector: 'a[data-cy="explore-news-tab"]' },
        { name: 'sports', selector: 'a[data-cy="explore-sports-tab"]' },
        { name: 'entertainment', selector: 'a[data-cy="explore-entertainment-tab"]' },
      ];
      tabs.forEach((tab) => {
        cy.get(tab.selector).should('exist').click();
        cy.url().should('include', `/explore/${tab.name}`);
        // either div[data-cy="no-trending-hashtags"] exists or there are hashtag items
        cy.get('[data-cy="explore-hashtag-item"], div[data-cy="no-trending-hashtags"]')
          .its('length')
          .should('be.gte', 1);
      });
    });
  });
  describe('Search Functionality', function () {
    describe('Profile Search Functionality', () => {
      it('should search for profiles correctly', function () {
        cy.get('[data-cy="search-input"]').type(this.slaveUser.username);
        // Check that search results contain the slave user (it might show multiple results)
        cy.get('[data-cy="search-user-result"]').should('contain.text', this.slaveUser.username);
        // Click on the slave user result
        cy.get('[data-cy="search-user-result"]').contains(this.slaveUser.username).click();
        cy.url().should('include', `/profile/${this.slaveUser.username}`);
        cy.get('[data-cy="profile-user-name"]').should('contain.text', this.slaveUser.username);
      });

      it('should show go to profile option for valid usernames', function () {
        cy.get('[data-cy="search-input"]').type('gelgel');
        cy.get('[data-cy="search-go-to-profile"]')
          .should('exist')
          .should('contain.text', 'gelgel')
          .click();
        cy.url().should('include', `/profile/gelgel`);
        cy.get('[data-cy="profile-user-name"]').should('contain.text', 'gelgel');
      });
      it('should allow "Search for [user]" (top and people)', function () {
        cy.get('[data-cy="search-input"]').clear().type(this.slaveUser.username);
        cy.get('a[data-cy="search-search-for-text"]').should('contain.text', `Search For`).click();
        // Check that search results contain the slave user
        cy.get('[data-cy="main-content"]').within(() => {
          cy.get('[data-cy="user-row"]').should('contain.text', this.slaveUser.username);
        });
        // Now click on People tab
        cy.get('a[data-cy="search-people-tab"]').should('exist').click();
        // Check that search results in People tab also contain the slave user
        cy.get('[data-cy="main-content"]').within(() => {
          cy.get('[data-cy="user-row"]').should('contain.text', this.slaveUser.username);
        });
      });
    });
    describe('Tweets Search Functionality', () => {
      it('should search for tweets correctly (top and latest)', function () {
        const timestamp = Date.now();
        const tweetContent = `Unique tweet content for search test ${timestamp}`;
        cy.postTweet(tweetContent, [], null, null, true).then(() => {
          cy.get('[data-cy="search-input"]')
            .clear()
            .type(`Unique tweet content for search test ${timestamp}`);
          cy.get('a[data-cy="search-search-for-text"]')
            .should('contain.text', `Search For`)
            .click();
          // Check that search results contain the tweet content
          cy.get('[data-cy="tweet-content"]').should('contain.text', tweetContent);
          // Now click on Latest tab
          cy.get('a[data-cy="search-latest-tab"]').should('exist').click();
          // Check that search results in Latest tab also contain the tweet content
          cy.get('[data-cy="tweet-content"]').should('contain.text', tweetContent);
        });
      });
      it('should show results from followed users', function () {
        const timestamp = Date.now();
        const tweetContent = `Followed user tweet content ${timestamp}`;
        cy.postTweet(tweetContent, [], null, null, true).then(() => {
          cy.get('[data-cy="search-input"]')
            .clear()
            .type(`Unique tweet content for search test ${timestamp}`);
          cy.get('a[data-cy="search-search-for-text"]')
            .should('contain.text', `Search For`)
            .click();
          cy.get('button[data-cy="search-filter-people-you-follow"]').should('exist').click();
          // Check that search results are empty since master user does not follow slave user yet
          cy.get('[data-cy="tweet-content"]').should('not.exist');
          // Now follow the slave user
          cy.followUser(this.slaveUser.username, true);
          const currentURL = cy.url();
          currentURL.then((url) => {
            cy.visit(url);
            cy.get('button[data-cy="search-filter-people-you-follow"]').should('exist').click();
            // Check that search results now contain the tweet content
            cy.get('[data-cy="tweet-content"]').should('contain.text', tweetContent);
          });
        });
      });
      it('should show results for tweets with media', function () {
        const timestamp = Date.now();
        const tweetContent = `Media tweet content ${timestamp}`;
        cy.uploadMedia('profile/banner.jpg', 'tweets', true).then((media) => {
          cy.postTweet(tweetContent, [media.id], undefined, undefined, true).then(() => {
            cy.get('[data-cy="search-input"]').clear().type(`Media tweet content ${timestamp}`);
            cy.get('a[data-cy="search-search-for-text"]')
              .should('contain.text', `Search For`)
              .click();
            // switch to Media tab
            cy.get('a[data-cy="search-media-tab"]').should('exist').click();
            cy.get('[data-cy="thumbnail-image"]').should('exist');
          });
        });
      });
    });
  });
});
