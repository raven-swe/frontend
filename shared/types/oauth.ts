export interface OAuthCallbackRequest {
  code: string;
}

export interface OAuthTokenRequest {
  creationToken: string;
  birthDate: string;
}

export type OAuthCallbackResponse =
  | {
      accessToken: string;
    }
  | {
      creationToken: string;
    };
