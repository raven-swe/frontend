export interface OAuthCallbackRequest {
  code: string;
}

export interface OAuthTokenRequest {
  creationToken: string;
  birthDate: string;
}

export interface OAuthCallbackResponse {
  success: boolean;
  message: string;
  data: {
    creationToken?: string;
    accessToken?: string;
    refreshToken?: string;
  };
}
