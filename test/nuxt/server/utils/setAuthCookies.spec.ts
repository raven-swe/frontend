import { describe, it, expect } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import {
  setAuthCookies,
  isOAuthResponseWithAccessToken,
} from '~~/server/utils/auth/setAuthCookies';
import type { FetchResponse } from 'ofetch';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import type { ApiSuccessResponse } from '#imports';

useH3TestUtils();

describe('setAuthCookies', () => {
  it('sets auth and refresh token normally', () => {
    const event = createMockH3Event({});
    const mockResponse = {
      _data: {
        success: true,
        message: 'Test',
        data: {
          accessToken: 'mock-access-token',
        },
      },
      headers: {
        getSetCookie: () => ['refreshToken=mock-refresh-token; Path=/; HttpOnly; Max-Age=3600'],
      },
    } as FetchResponse<
      ApiSuccessResponse<{
        accessToken: string;
      }>
    >;

    setAuthCookies(event, mockResponse);
    const cookies = event.headers.getSetCookie();
    expect(cookies).toBeDefined();
    expect(cookies?.some((cookie) => cookie.startsWith('refreshToken=mock-refresh-token'))).toBe(
      true,
    );
    expect(cookies?.some((cookie) => cookie.startsWith('access_token=mock-access-token'))).toBe(
      true,
    );
  });

  it('does not set cookie if refreshToken is not in headers', () => {
    const event = createMockH3Event({});
    const mockResponse = {
      _data: {
        success: true,
        message: 'Test',
        data: {
          accessToken: 'mock-access-token',
        },
      },
      headers: {
        getSetCookie: () => [] as string[],
      },
    } as FetchResponse<
      ApiSuccessResponse<{
        accessToken: string;
      }>
    >;

    setAuthCookies(event, mockResponse);

    const cookies = event.headers.getSetCookie();
    expect(cookies?.some((cookie) => cookie.startsWith('refreshToken=mock-refresh-token'))).toBe(
      false,
    );
    expect(cookies?.some((cookie) => cookie.startsWith('access_token=mock-access-token'))).toBe(
      true,
    );
  });

  it('handle undefined _data in response', () => {
    const event = createMockH3Event({});
    const mockResponse = {
      _data: undefined,
      headers: {
        getSetCookie: () => ['refreshToken=mock-refresh-token; Path=/; HttpOnly; Max-Age=3600'],
      },
    } as FetchResponse<
      ApiSuccessResponse<{
        accessToken: string;
      }>
    >;

    setAuthCookies(event, mockResponse);

    const cookies = event.headers.getSetCookie();
    expect(cookies).toBeDefined();
    expect(cookies.some((cookie) => cookie.startsWith('access_token=mock-access-token'))).toBe(
      false,
    );

    expect(cookies.some((cookie) => cookie.startsWith('refreshToken=mock-refresh-token'))).toBe(
      true,
    );
  });
});

describe('isOAuthResponseWithAccessToken', () => {
  it('returns true for response with accessToken', () => {
    const mockResponse = {
      _data: {
        success: true,
        message: 'Test',
        data: {
          accessToken: 'mock-access-token',
        },
      },
      headers: {
        getSetCookie: () => [] as string[],
      },
    } as FetchResponse<
      ApiSuccessResponse<{
        accessToken: string;
      }>
    >;

    expect(isOAuthResponseWithAccessToken(mockResponse)).toBe(true);
  });

  it('returns false for response without accessToken', () => {
    const mockResponse = {
      _data: {
        success: true,
        message: 'Test',
        data: {
          creationToken: 'mock-creation-token',
        },
      },
      headers: {
        getSetCookie: () => [] as string[],
      },
    } as FetchResponse<
      ApiSuccessResponse<{
        creationToken: string;
      }>
    >;

    expect(isOAuthResponseWithAccessToken(mockResponse)).toBe(false);
  });

  it('returns false undefined/null', () => {
    expect(isOAuthResponseWithAccessToken(undefined)).toBe(false);
    expect(isOAuthResponseWithAccessToken(null)).toBe(false);
  });
});
