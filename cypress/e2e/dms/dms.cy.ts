describe('Direct Messages Flow', { testIsolation: false }, function () {
  let masterUser: { username: string; email: string; password: string };
  let slaveUser: { username: string; email: string; password: string };

  before(function () {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    // Create two test users: slave user and master user
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
    cy.visitAndWaitForHydration('/messages');
  });
  // Restore aliases before each test
  beforeEach(function () {
    if (masterUser) cy.wrap(masterUser).as('masterUser');
    if (slaveUser) cy.wrap(slaveUser).as('slaveUser');
  });
  describe('DM Navigation and Items', function () {
    it('it should show empty state when no conversations', function () {
      cy.get('[data-cy="dm-conversation-item"]').should('not.exist');
      cy.get('[data-cy="empty-new-dm-button"]').should('exist');
      cy.get('[data-cy="new-dm-button"]').should('be.visible'); // from header
    });
    it('should create a new DM conversation', function () {
      // use the empty state new DM button to create a new conversation
      cy.get('[data-cy="empty-new-dm-button"]').click();
      cy.get('div[data-cy="dialog-content-body"]').should('be.visible');
      cy.get('input[data-cy="dm-search-input"]').should('be.visible').type(this.slaveUser.username);
      cy.get('div[data-cy="dm-user-item"]').contains(this.slaveUser.username).click();
      cy.get('button[data-cy="dm-dialog-next-button"]').should('not.be.disabled').click();
      cy.get('span[data-cy="dm-conversation-header-username"]')
        .should('exist')
        .and('have.text', this.slaveUser.username);
      cy.get('a[data-cy="dm-conversation-info-link"]')
        .should('exist')
        .and('be.visible')
        .and('have.attr', 'href')
        .and('include', `/profile/${this.slaveUser.username}`);
      // Check that the message input field is visible
      cy.get('textarea[data-cy="dm-message-textfield"]').should('be.exist');
      // Check that the conversation appears in the conversation list

      cy.get('div[data-cy="dm-conversation-item"]')
        .should('have.length', 1)
        .first()
        .and('contain.text', this.slaveUser.username);
    });
    it('A new DM conversation should appear in the first of conversations list', function () {
      // Create another user and DM to test ordering
      cy.createTestUser().then((anotherUser) => {
        cy.get('[data-cy="new-dm-button"]').click();
        cy.get('div[data-cy="dialog-content-body"]').should('be.visible');
        cy.get('input[data-cy="dm-search-input"]').should('be.visible').type(anotherUser.username);
        cy.get('div[data-cy="dm-user-item"]').contains(anotherUser.username).click();
        cy.get('button[data-cy="dm-dialog-next-button"]').should('not.be.disabled').click();
        cy.get('span[data-cy="dm-conversation-header-username"]')
          .should('exist')
          .and('have.text', anotherUser.username);
        // Check that this new conversation is at the top of the list
        cy.get('div[data-cy="dm-conversation-item"]').should('have.length', 2);
        cy.get('div[data-cy="dm-conversation-item"]')
          .first()
          .should('contain.text', anotherUser.username);
      });
    });
    it('should switch back to the first DM conversation', function () {
      cy.get('div[data-cy="dm-conversation-item"]')
        .contains(this.slaveUser.username)
        .click({ force: true });
      cy.get('span[data-cy="dm-conversation-header-username"]')
        .should('exist')
        .and('have.text', this.slaveUser.username);
      // Wait for the WS connection to establish and messages to load
      cy.wait(500);
    });
  });

  describe('DM Messaging', function () {
    it('should send a text message in the DM conversation (Enter)', function () {
      const testMessage = 'Hello, this is a test message!{enter}';
      // Type and send a message
      cy.get('textarea[data-cy="dm-message-textfield"]').type(testMessage, { force: true });
      // Verify the message appears in the conversation
      cy.get('div[data-cy="dm-message-item-mine"]')
        .first()
        .should('contain.text', 'Hello, this is a test message!');
    });
    it('should send a text message in the DM conversation (Send Button)', function () {
      const testMessage = 'This is another test message.';
      // Type the message
      cy.get('textarea[data-cy="dm-message-textfield"]').type(testMessage, { force: true });
      cy.get('button[data-cy="dm-message-send-button"]').click({ force: true });
      // Verify the message appears in the conversation
      cy.get('div[data-cy="dm-message-item-mine"]')
        .last()
        .should('contain.text', 'This is another test message.');
    });
    it('should send an image attachment in the DM conversation', function () {
      const imagePath = 'cypress/fixtures/profile/banner.jpg';
      cy.get('input[data-cy="dm-message-attachment-input"]').selectFile(imagePath, { force: true });
      // Verify the attachment preview appears
      cy.get('div[data-cy="dm-message-attachment-preview"]').should('be.visible');
      cy.get('button[data-cy="dm-message-attachment-remove-button"]').should('exist');
      // Send the message with attachment
      cy.get('button[data-cy="dm-message-send-button"]').click({ force: true });
      // Verify the message with attachment appears in the conversation
      cy.get('div[data-cy="dm-message-item-mine"]')
        .last()
        .within(() => {
          cy.get('img[data-cy="dm-message-item-image"]').should('be.visible');
        });
    });
    it('should receive a message from another user', function () {
      // login as slave user, send message to master user, verify master user receives it
      cy.login(this.slaveUser.email, this.slaveUser.password);
      cy.visitAndWaitForHydration('/messages');
      cy.get('[data-cy="left-sidebar-tab-badge-messages"]')
        .should('exist')
        .and('contain.text', '1');
      cy.get('div[data-cy="dm-conversation-item"]')
        .contains(this.masterUser.username)
        .click({ force: true });
      const realtimeMessage = 'Hello from the other side!';
      cy.get('textarea[data-cy="dm-message-textfield"]').type(realtimeMessage, { force: true });
      cy.get('button[data-cy="dm-message-send-button"]').click({ force: true });

      // Switch back to master user
      cy.login(this.masterUser.email, this.masterUser.password);
      cy.visitAndWaitForHydration('/messages');
      cy.get('[data-cy="left-sidebar-tab-badge-messages"]')
        .should('exist')
        .and('contain.text', '1');
      cy.get('div[data-cy="dm-conversation-item"]')
        .contains(this.slaveUser.username)
        .click({ force: true });
      // Verify the real-time message is received
      cy.get('div[data-cy="dm-message-item-theirs"]')
        .first()
        .should('contain.text', 'Hello from the other side!');
    });
    it('should add reaction to a message', function () {
      // Find the last message and add a reaction
      cy.get('div[data-cy="dm-message-item-theirs"]')
        .first()
        .within(() => {
          cy.get('button[data-cy="dm-reaction-picker-button"]').click({ force: true });
        });
      // Select a reaction from the reaction picker
      cy.get('[data-cy="dm-reaction-picker-emoji"]').first().click().wait(300);
      // Verify the reaction appears on the message
      cy.get('div[data-cy="dm-message-item-theirs"]')
        .last()
        .within(() => {
          cy.get('[data-cy="dm-reaction-display-button"]').should('exist').click();
          cy.get('[data-cy="dm-reaction-display-button"]').should('not.exist');
        });
    });
    it('should delete my message', function () {
      cy.get('div[data-cy="dm-message-item-mine"]')
        .last()
        .within(() => {
          cy.get('button[data-cy="dm-message-actions-trigger"]').click({ force: true });
        });
      cy.get('div[data-cy="dm-message-delete-button"]').click();
      // Verify the message is deleted
      cy.get('div[data-cy="dm-message-item-mine"]')
        .last()
        .should('not.contain.text', 'This is another test message.');
    });
  });

  describe('DM edge cases', function () {
    it('should not allow messaging a blocked', function () {
      cy.createTestUser().then((blockedUser) => {
        // Block the user via API
        cy.blockUser(blockedUser.username);
        // Open new DM dialog
        cy.get('[data-cy="new-dm-button"]').click();
        cy.get('div[data-cy="dialog-content-body"]').should('be.visible');
        cy.get('input[data-cy="dm-search-input"]').should('be.visible').type(blockedUser.username);
        cy.contains('div[data-cy="dm-user-item"]', blockedUser.username)
          .should('exist')
          .within(() => {
            cy.get('[data-cy="dm-user-item-blocked"]').should('exist');
          });
      });
    });
    it('should not allow messaging yourself', function () {
      // Try searching for self
      cy.get('input[data-cy="dm-search-input"]').clear().type(this.masterUser.username);
      // shouldn't exist
      cy.get('div[data-cy="dm-user-item"]').should('not.contain.text', this.masterUser.username);
      // Close dialog
      cy.get('button[data-cy="dialog-close-button"]').click();
    });
  });
});
