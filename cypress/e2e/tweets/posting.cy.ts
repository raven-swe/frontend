describe('Tweeting Flow', function () {
  beforeEach(function () {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.visitAndWaitForHydration('/');
    cy.createTestUser().then((testUser) => {
      cy.wrap(testUser).as('testUser');
      cy.login(testUser.email, testUser.password);
    });
    cy.visitAndWaitForHydration('/home');
  });
  describe('Posting a Tweet', () => {
    it('should open tweet composer, post a tweet, and display it in feed', function () {
      cy.get('textarea[data-cy="tweet-composer-textarea"]').should('exist');
      cy.get('button[data-cy="tweet-composer-post-button"]').should('exist').should('be.disabled');
      const tweetContent = 'This is a test tweet from Cypress!';
      cy.get('textarea[data-cy="tweet-composer-textarea"]').type(tweetContent);
      cy.get('button[data-cy="tweet-composer-post-button"]').should('not.be.disabled').click();
      cy.get('[data-cy="tweet-content"]').first().should('contain.text', tweetContent);
      cy.contains('Tweet posted successfully').should('be.visible');
    });

    it('should open tweet composer from sidebar button', function () {
      cy.get('button[data-cy="open-post-tweet-dialog-btn"]').click();
      cy.get('div[data-cy="dialog-content-body"]')
        .should('be.visible')
        .within(() => {
          cy.get('textarea[data-cy="tweet-composer-textarea"]').should('exist');
          const tweetContent = 'This is a test tweet from sidebar button!';
          cy.get('textarea[data-cy="tweet-composer-textarea"]').type(tweetContent);
          cy.get('button[data-cy="tweet-composer-post-button"]').should('not.be.disabled').click();
        });
      cy.get('[data-cy="tweet-content"]')
        .first()
        .should('contain.text', 'This is a test tweet from sidebar button!');
      cy.contains('Tweet posted successfully').should('be.visible');
    });

    it('should post a tweet with hashtags and mentions', function () {
      const tweetContent = 'Hello @gelgel! Check out #ThisTweet';
      cy.get('textarea[data-cy="tweet-composer-textarea"]').clear().type(tweetContent);
      cy.get('button[data-cy="tweet-composer-post-button"]').should('not.be.disabled').click();
      cy.get('[data-cy="tweet-content"]').first().should('contain.text', tweetContent);
      cy.get('[data-cy="tweet-content"]')
        .first()
        .within(() => {
          cy.get('a').first().should('have.attr', 'href').and('include', '/profile/gelgel');
          cy.get('a')
            .last()
            .should('have.attr', 'href')
            .and('include', '/search/top?q=%23ThisTweet');
        });
      cy.contains('Tweet posted successfully').should('be.visible');
    });
    it('should allow posting a tweet with an image', function () {
      const tweetContent = 'Tweet with an image!';
      const imagePath = 'cypress/fixtures/profile/banner.jpg';
      cy.get('textarea[data-cy="tweet-composer-textarea"]').clear().type(tweetContent);
      cy.get('input[data-cy="tweet-composer-media-input"]').selectFile(imagePath, { force: true });
      cy.get('button[data-cy="tweet-composer-post-button"]').should('not.be.disabled').click();
      cy.get('[data-cy="tweet"]')
        .first()
        .within(() => {
          cy.get('[data-cy="tweet-content"]').should('contain.text', tweetContent);
          cy.get('[data-cy="tweet-media-image"]').should('be.visible');
        });
      cy.contains('Tweet posted successfully').should('be.visible');
    });
    it('should allow posting a tweet with an image and empty text', function () {
      const imagePath = 'cypress/fixtures/profile/banner.jpg';
      cy.get('textarea[data-cy="tweet-composer-textarea"]').clear();
      cy.get('input[data-cy="tweet-composer-media-input"]').selectFile(imagePath, { force: true });
      cy.get('button[data-cy="tweet-composer-post-button"]').should('not.be.disabled').click();
      cy.get('[data-cy="tweet"]')
        .first()
        .within(() => {
          cy.get('[data-cy="tweet-content"]').should('be.empty');
          cy.get('[data-cy="tweet-media-image"]').should('be.visible');
        });
      cy.contains('Tweet posted successfully').should('be.visible');
    });
    it('should prevent posting an empty tweet', function () {
      cy.get('textarea[data-cy="tweet-composer-textarea"]').clear().type('   ');
      cy.get('button[data-cy="tweet-composer-post-button"]').should('be.disabled');
    });
    it('should be able to open tweet viewer from posted tweet', function () {
      const tweetContent = 'Tweet to open viewer!';
      const image1Path = 'cypress/fixtures/profile/banner.jpg';
      const image2Path = 'cypress/fixtures/profile/avatar.png';
      cy.get('textarea[data-cy="tweet-composer-textarea"]').clear().type(tweetContent);
      cy.get('input[data-cy="tweet-composer-media-input"]').selectFile([image1Path, image2Path], {
        force: true,
      });
      cy.get('button[data-cy="tweet-composer-post-button"]').should('not.be.disabled').click();
      cy.get('[data-cy="tweet"]')
        .first()
        .within(() => {
          cy.get('[data-cy="tweet-content"]').should('contain.text', tweetContent);
          cy.get('[data-cy="tweet-media-image"]').should('have.length', 2);
          // Open tweet viewer
          cy.get('[data-cy="tweet-content"]').click();
        });
      // Verify tweet viewer opened
      cy.url().should('include', '/status/');
      cy.get('[data-cy="tweet-view-content"]').should('have.length', 1);
      cy.get('[data-cy="tweet-media-image"]').should('have.length', 2);
    });
    it('should be able to open media viewer by clicking on media', function () {
      const tweetContent = 'Tweet to open media viewer!';
      const image1Path = 'cypress/fixtures/profile/banner.jpg';
      const image2Path = 'cypress/fixtures/profile/avatar.png';
      cy.get('textarea[data-cy="tweet-composer-textarea"]').clear().type(tweetContent);
      cy.get('input[data-cy="tweet-composer-media-input"]').selectFile([image1Path, image2Path], {
        force: true,
      });
      cy.get('button[data-cy="tweet-composer-post-button"]').should('not.be.disabled').click();
      cy.get('[data-cy="tweet"]')
        .first()
        .within(() => {
          cy.get('[data-cy="tweet-content"]').should('contain.text', tweetContent);
          cy.get('[data-cy="tweet-media-image"]').should('have.length', 2);
          // Open media viewer by clicking first image
          cy.get('[data-cy="tweet-media-image"]').first().click();
        });
      // Verify media viewer opened
      cy.get('img[data-cy="tweet-media-viewer-image"]').should('exist').and('have.length', 2);
      // Close media viewer
      cy.get('button[data-cy="media-viewer-back-button"]').click();
      cy.get('img[data-cy="tweet-media-viewer-image"]').should('not.exist');
    });
  });
  describe('Replying to a Tweet', () => {
    beforeEach(function () {
      cy.visitAndWaitForHydration('/home');
      const originalTweetContent = 'This is a tweet to reply to.';
      // Post the original tweet
      cy.get('textarea[data-cy="tweet-composer-textarea"]').clear().type(originalTweetContent);
      cy.get('button[data-cy="tweet-composer-post-button"]').should('not.be.disabled').click();
      cy.get('[data-cy="tweet-content"]').first().should('contain.text', originalTweetContent);
    });
    it('should reply to an existing tweet and display the reply', function () {
      const replyContent = 'This is a reply from the composer!';
      // Click reply button
      cy.get('button[data-cy="tweet-reply-button"]').first().click();
      // Type and post the reply
      cy.get('div[data-cy="dialog-content-body"] textarea[data-cy="tweet-composer-textarea"]')
        .should('exist')
        .type(replyContent);
      cy.get('div[data-cy="dialog-content-body"] button[data-cy="tweet-composer-post-button"]')
        .should('not.be.disabled')
        .click();
      cy.contains('Tweet posted successfully').should('be.visible');
      // Verify the reply appears
      cy.get('[data-cy="tweet-content"]').first().click();
      cy.url().should('include', '/status/');
      cy.get('[data-cy="tweet-replies"]').first().should('contain.text', replyContent);
    });

    it('should reply to a tweet using the inside composer', function () {
      const replyContent = 'This is a reply from inside the tweet!';
      // Open the tweet detail view
      cy.get('[data-cy="tweet-content"]').first().click();
      cy.url().should('include', '/status/');
      // find tweet-composer-textarea
      cy.get('textarea[data-cy="tweet-composer-textarea"]').should('exist').type(replyContent);
      cy.get('button[data-cy="tweet-composer-post-button"]').should('not.be.disabled').click();
      // Verify the reply appears
      cy.get('[data-cy="tweet-replies"]').first().should('contain.text', replyContent);
      cy.contains('Tweet posted successfully').should('be.visible');
    });
    it('should reply to a tweet with mentions, hashtags, and an image', function () {
      const replyContent = 'Hello @gelgel! Check out #ThisReply';
      const imagePath = 'cypress/fixtures/profile/banner.jpg';
      // Open the tweet detail view
      cy.get('[data-cy="tweet-content"]').first().click();
      cy.url().should('include', '/status/');
      // Type the reply with mentions and hashtags
      cy.get('textarea[data-cy="tweet-composer-textarea"]').should('exist').type(replyContent);
      // Attach an image
      cy.get('input[data-cy="tweet-composer-media-input"]').selectFile(imagePath, { force: true });
      // Post the reply
      cy.get('button[data-cy="tweet-composer-post-button"]').should('not.be.disabled').click();
      // Verify the reply appears with correct content and media
      cy.get('[data-cy="tweet-replies"] [data-cy="tweet"]')
        .first()
        .within(() => {
          cy.get('[data-cy="tweet-content"]')
            .should('contain.text', replyContent)
            .within(() => {
              cy.get('a').first().should('have.attr', 'href').and('include', '/profile/gelgel');
              cy.get('a')
                .last()
                .should('have.attr', 'href')
                .and('include', '/search/top?q=%23ThisReply');
            });
          cy.get('[data-cy="tweet-media-image"]').should('be.visible');
        });
      cy.contains('Tweet posted successfully').should('be.visible');
    });
    it('should prevent posting an empty reply', function () {
      // Open the tweet detail view
      cy.get('[data-cy="tweet-content"]').first().click();
      cy.url().should('include', '/status/');
      // Attempt to post an empty reply
      cy.get('textarea[data-cy="tweet-composer-textarea"]').should('exist').clear().type('   ');
      cy.get('button[data-cy="tweet-composer-post-button"]').should('be.disabled');
    });
  });
});
