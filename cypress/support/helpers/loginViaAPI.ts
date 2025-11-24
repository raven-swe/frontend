/**
 * Login via API request (fastest approach)
 * This bypasses the UI entirely and sets auth tokens directly
 */
export function loginViaAPI(email: string, password: string) {
  return cy
    .request({
      method: 'POST',
      url: `${Cypress.env('API_URL')}/auth/login`,
      body: {
        email,
        password,
      },
    })
    .then((response) => {
      // Store auth token in localStorage/cookies as your app expects
      window.localStorage.setItem('auth-token', response.body.token);
      // Or set cookies if your app uses cookies
      // cy.setCookie('auth-token', response.body.token);
    });
}
