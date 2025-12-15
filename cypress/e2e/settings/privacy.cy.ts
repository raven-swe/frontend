describe('Privacy Settings Actions', function () {
  beforeEach(() => {
    // Create a test user and store it as an alias
    cy.createTestUser().then((user) => {
      cy.wrap(user).as('testUser');
      cy.login(user.email, user.password);
    });

    // Visit settings and wait for hydration
    cy.visitAndWaitForHydration('/settings');
    cy.get('a[data-cy="privacy-settings-btn"]').should('be.visible').click();
    cy.url().should('include', '/settings/privacy');
  });

  describe('Privacy and Safety settings', function () {
    describe('Mutes and Blocks settings', function () {
      beforeEach(() => {
        cy.get('[data-cy="mutes-and-blocks-settings-btn"]').should('be.visible').click();
        cy.url().should('include', '/settings/mute-and-block'); // TODO: should be /settings/privacy/mute-and-block
      });

      describe('Mute settings', function () {
        this.beforeEach(() => {
          cy.get('[data-cy="mutes-settings-btn"]').should('be.visible').click();
          cy.url().should('include', '/settings/muted'); // TODO: should be /settings/privacy/muted
          cy.get('[data-cy="muted-settings-page"]').should('be.visible');
        });

        it('should show no muted users initially', () => {
          cy.get('[data-cy="user-row"]').should('not.exist');
        });
        it('should show muted users', function () {
          cy.fixture('settings/privacy_users.json').then((users: string[]) => {
            users.forEach((userName) => {
              cy.muteUser(userName, true);
            });
            cy.reload();
            cy.get('[data-cy="user-row"]').should('have.length', users.length);
            // Check that each muted user is within the fixture list
            cy.get('[data-cy="user-row-username"]').each(($el) => {
              const usernameText = $el.text().trim().replace('@', '');
              expect(users).to.include(usernameText);
            });
          });
        });

        it('should unmute a user and be able to remute', function () {
          cy.fixture('settings/privacy_users.json').then((users: string[]) => {
            // First mute all users
            users.forEach((userName) => {
              cy.muteUser(userName, true);
            });
            cy.reload();
          });
          // Unmute all users then remute
          cy.get('[data-cy="user-row"]').each(($el) => {
            cy.wrap($el).within(() => {
              cy.get('[data-cy="unmute-button"]').should('be.visible').click();
              cy.get('[data-cy="mute-button"]').should('be.visible').click();
              cy.get('[data-cy="unmute-button"]').should('be.visible');
            });
          });
        });
      });

      describe('Block settings', function () {
        this.beforeEach(() => {
          cy.get('[data-cy="blocks-settings-btn"]').should('be.visible').click();
          cy.url().should('include', '/settings/blocked'); // TODO: should be /settings/privacy/blocked
          cy.get('[data-cy="blocked-settings-page"]').should('be.visible');
        });

        it('should show no blocked users initially', () => {
          cy.get('[data-cy="user-row"]').should('not.exist');
        });
        it('should show blocked users', function () {
          cy.fixture('settings/privacy_users.json').then((users: string[]) => {
            users.forEach((userName) => {
              cy.blockUser(userName, true);
            });
            cy.reload();
            cy.get('[data-cy="user-row"]').should('have.length', users.length);
            // Check that each blocked user is within the fixture list
            cy.get('[data-cy="user-row-username"]').each(($el) => {
              const usernameText = $el.text().trim().replace('@', '');
              expect(users).to.include(usernameText);
            });
          });
        });

        it('should unblock a user and be able to reblock', function () {
          cy.fixture('settings/privacy_users.json').then((users: string[]) => {
            // First block all users
            users.forEach((userName) => {
              cy.blockUser(userName, true);
            });
            cy.reload();
          });
          // Unblock all users then reblock
          cy.get('[data-cy="user-row"]').each(($el) => {
            cy.wrap($el).within(() => {
              cy.get('[data-cy="unblock-button"]').should('be.visible').click();
              cy.get('[data-cy="block-button"]').should('be.visible').click();
              cy.get('[data-cy="unblock-button"]').should('be.visible');
            });
          });
        });
      });
    });

    describe('Safety settings', function () {
      beforeEach(() => {
        cy.get('[data-cy="content-you-see-settings-btn"]').should('be.visible').click();
        cy.url().should('include', '/settings/content-you-see');
        // data-cy="interests-settings-btn"
        cy.get('[data-cy="interests-settings-btn"]').should('be.visible').click();
        cy.url().should('include', '/settings/interests');
      });
      it('should show interest entries', function () {
        cy.get('[data-cy="interest-entry"]').should('have.length.greaterThan', 0);
      });

      it('should toggle an interest entry', function () {
        cy.get('[data-cy="interest-entry"]')
          .first()
          .within(() => {
            // data-state="checked"
            cy.get('[data-cy="interest-checkbox"]').then(($checkbox) => {
              const isChecked = $checkbox.attr('data-state') === 'checked';
              cy.get('[data-cy="interest-checkbox"]').click();
              cy.get('[data-cy="interest-checkbox"]').should(($cb) => {
                const newIsChecked = $cb.attr('data-state') === 'checked';
                expect(newIsChecked).to.eq(!isChecked);
              });
            });
          });
      });
      it('should toggle multiple interest entries and save', function () {
        cy.get('[data-cy="interest-entry"]').each(($el, index) => {
          if (index < 3) {
            cy.wrap($el).within(() => {
              cy.get('[data-cy="interest-checkbox"]').then(($checkbox) => {
                const isChecked = $checkbox.attr('data-state') === 'checked';
                cy.get('[data-cy="interest-checkbox"]').click();
                cy.get('[data-cy="interest-checkbox"]').should(($cb) => {
                  const newIsChecked = $cb.attr('data-state') === 'checked';
                  expect(newIsChecked).to.eq(!isChecked);
                });
              });
            });
          }
        });
        // Click save button
        cy.get('button[data-cy="save-interests-button"]').should('not.be.disabled').click();
        cy.get('button[data-cy="save-interests-button"]').should('be.disabled');
      });
    });
  });
});
