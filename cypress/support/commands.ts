/// <reference types="cypress" />

import type { CaptchaParams, ExtendedAUTWindow } from '../types/ExtendedAUTWindow';

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Mock reCAPTCHA for testing
Cypress.Commands.add('mockRecaptcha', () => {
  cy.window().then((win: ExtendedAUTWindow) => {
    win.grecaptcha = {
      render: (container: string | HTMLElement, params: CaptchaParams) => {
        // Simulate successful reCAPTCHA validation
        if (params.callback) {
          // Call the callback immediately with a mock token
          setTimeout(() => params.callback('mock-recaptcha-token'), 100);
        }
        return 'mock-widget-id';
      },
      reset: () => {},
      getResponse: () => 'mock-recaptcha-token',
    };

    // Dispatch the event that the reCAPTCHA script has loaded
    win.dispatchEvent(new Event('recaptcha-script-loaded'));
  });
});

// Get OTP from test endpoint
Cypress.Commands.add(
  'getOTP',
  (identifier: string, type: 'registration' | 'forgotPassword' | 'changeEmail') => {
    return cy
      .request(`${Cypress.env('API_URL')}/test/otp?identifier=${identifier}&type=${type}`)
      .its('body.data.otp');
  },
);

// Create a test user and retrieve its info
Cypress.Commands.add('createTestUser', () => {
  return cy.request('POST', `${Cypress.env('API_URL')}/test/users`).its('body.data');
});

// Visit a page and wait for Nuxt hydration to complete
Cypress.Commands.add('visitAndWaitForHydration', (url: string) => {
  cy.visit(url);
  cy.mockRecaptcha(); // Mock reCAPTCHA before tests
  cy.window({ timeout: 10000 }).should((win: ExtendedAUTWindow) =>
    expect(win.useNuxtApp().isHydrating).to.eq(false),
  );
});

// Login command with session caching
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    [email, password], // unique identifier for this session
    () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/auth/login`,
        body: {
          identifier: email,
          password: password,
        },
        headers: {
          'X-Client-Type': 'web',
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        // set the access token cookie
        cy.setCookie('access_token', response.body.data.accessToken);
      });
    },
    {
      validate() {
        // Validates session is still valid - check for auth cookie
        cy.getCookie('access_token').should('exist');
      },
    },
  );
});

Cypress.Commands.add('loginExternal', (email: string, password: string) => {
  // login via API and return the response
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/login`,
    body: {
      identifier: email,
      password: password,
    },
    headers: {
      'X-Client-Type': 'web',
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    // set the access token cookie
    cy.setCookie('external_access_token', response.body.data.accessToken);
  });
});
// Mute or unmute a user
Cypress.Commands.add('muteUser', (userName: string, mute: boolean = true, useSlave = false) => {
  const action = mute ? 'POST' : 'DELETE';
  const tokenCookie = useSlave ? 'external_access_token' : 'access_token';

  cy.getCookie(tokenCookie).then((cookie) => {
    cy.request({
      method: action,
      url: `${Cypress.env('API_URL')}/me/mutes/${userName}`,
      headers: {
        Authorization: `Bearer ${cookie?.value}`,
      },
    }).as('muteUserRequest');

    cy.get('@muteUserRequest').its('status').should('be.oneOf', [200, 201]);
  });
});

// Block or unblock a user
Cypress.Commands.add('blockUser', (userName: string, block: boolean = true, useSlave = false) => {
  const action = block ? 'POST' : 'DELETE';
  const tokenCookie = useSlave ? 'external_access_token' : 'access_token';
  cy.getCookie(tokenCookie).then((cookie) => {
    cy.request({
      method: action,
      url: `${Cypress.env('API_URL')}/me/blocks/${userName}`,
      headers: {
        Authorization: `Bearer ${cookie?.value}`,
      },
    }).as('blockUserRequest');
    cy.get('@blockUserRequest').its('status').should('be.oneOf', [200, 201]);
  });
});

// Follow or unfollow a user
Cypress.Commands.add('followUser', (userName: string, follow: boolean = true, useSlave = false) => {
  const action = follow ? 'POST' : 'DELETE';
  const tokenCookie = useSlave ? 'external_access_token' : 'access_token';
  cy.getCookie(tokenCookie).then((cookie) => {
    cy.request({
      method: action,
      url: `${Cypress.env('API_URL')}/users/${userName}/following`,
      headers: {
        Authorization: `Bearer ${cookie?.value}`,
      },
    }).as('followUserRequest');
    cy.get('@followUserRequest').its('status').should('be.oneOf', [200, 201]);
  });
});

Cypress.Commands.add(
  'uploadMedia',
  (filePath: string, folder: string = 'tweets', useSlave = false) => {
    const tokenCookie = useSlave ? 'external_access_token' : 'access_token';
    cy.getCookie(tokenCookie).then((cookie) => {
      cy.fixture(filePath, 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then((fileBlob) => {
          const formData = new FormData();
          formData.append('file', fileBlob, filePath);
          formData.append('folder', folder);
          cy.request({
            method: 'POST',
            url: `${Cypress.env('API_URL')}/media/upload/image`,
            headers: {
              Authorization: `Bearer ${cookie?.value}`,
            },
            body: formData,
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);
            const bodyString = Cypress.Blob.arrayBufferToBinaryString(response.body);
            const body = JSON.parse(bodyString);
            expect(body).to.have.property('data');
            const data = body.data;
            return cy.wrap(data);
          });
        });
    });
  },
);

Cypress.Commands.add(
  'postTweet',
  (
    content: string,
    mediaIds: string[] = [],
    replyToTweetId = null,
    quoteToTweetId = null,
    useSlave = false,
  ) => {
    // POST /tweets
    const tokenCookie = useSlave ? 'external_access_token' : 'access_token';
    cy.getCookie(tokenCookie).then((cookie) => {
      const body = {
        content: content,
        media: mediaIds,
        quoteToTweetId: quoteToTweetId,
        replyToTweetId: replyToTweetId,
      };
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/tweets`,
        headers: {
          Authorization: `Bearer ${cookie?.value}`,
        },
        body: body,
      }).as('postTweetRequest');
      cy.get('@postTweetRequest').its('status').should('be.oneOf', [200, 201]);
      cy.get('@postTweetRequest')
        .its('body.data')
        .then((data) => {
          return cy.wrap(data);
        });
    });
  },
);

Cypress.Commands.add(
  'likeTweet',
  (tweetId: string | number, like: boolean = true, useSlave = false) => {
    const action = like ? 'POST' : 'DELETE';
    const tokenCookie = useSlave ? 'external_access_token' : 'access_token';
    cy.getCookie(tokenCookie).then((cookie) => {
      cy.request({
        method: action,
        url: `${Cypress.env('API_URL')}/tweets/${tweetId}/like`,
        headers: {
          Authorization: `Bearer ${cookie?.value}`,
        },
      }).as('likeTweetRequest');
      cy.get('@likeTweetRequest').its('status').should('be.oneOf', [200, 201]);
    });
  },
);

Cypress.Commands.add(
  'retweetTweet',
  (tweetId: string | number, retweet: boolean = true, useSlave = false) => {
    const action = retweet ? 'POST' : 'DELETE';
    const tokenCookie = useSlave ? 'external_access_token' : 'access_token';
    cy.getCookie(tokenCookie).then((cookie) => {
      cy.request({
        method: action,
        url: `${Cypress.env('API_URL')}/tweets/${tweetId}/retweet`,
        headers: {
          Authorization: `Bearer ${cookie?.value}`,
        },
      }).as('retweetRequest');
      cy.get('@retweetRequest').its('status').should('be.oneOf', [200, 201]);
    });
  },
);

Cypress.Commands.add('changeUsername', (newUsername: string, useSlave = false) => {
  const tokenCookie = useSlave ? 'external_access_token' : 'access_token';
  cy.getCookie(tokenCookie).then((cookie) => {
    cy.request({
      method: 'PATCH',
      url: `${Cypress.env('API_URL')}/me/settings/username`,
      headers: {
        Authorization: `Bearer ${cookie?.value}`,
      },
      body: {
        newUsername: newUsername,
      },
    }).as('changeUsernameRequest');
    cy.get('@changeUsernameRequest').its('status').should('be.oneOf', [200, 201]);
  });
});

//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

export {};
