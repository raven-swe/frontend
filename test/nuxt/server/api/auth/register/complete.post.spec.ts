import { describe, expect, vi, it, beforeEach } from 'vitest';
import completePostEventHandler from '~~/server/api/auth/register/complete.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import * as jwt from 'jsonwebtoken';

const h3 = useH3TestUtils();

const mockServerApiFetchRaw = vi.fn();
vi.stubGlobal('serverApiFetch', () => ({
  raw: mockServerApiFetchRaw,
}));

describe('server/api/auth/register/complete.post', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid requests', async () => {
    const token = jwt.sign({}, 'secret');
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'Registration completed successfully',
        data: {
          accessToken: token,
        },
      },
      headers: {
        getSetCookie: () => ['mock-cookie=mock-value; Path=/; HttpOnly'],
      },
    });
    const event = createMockH3Event({
      method: 'POST',
    });
    const response = await completePostEventHandler(event);
    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'mock-cookie=mock-value; Path=/; HttpOnly',
    );
    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      `access_token=${token}; Max-Age=300; Path=/; SameSite=Lax`,
    );
    expect(response).toEqual({
      success: true,
      message: 'Registration completed successfully',
      data: {
        accessToken: token,
      },
    });
  });

  it('handle not recieving accessToken in response', async () => {
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'Registration completed successfully',
        data: {
          // accessToken is missing
        },
      },
      headers: {
        getSetCookie: () => ['mock-cookie=mock-value; Path=/; HttpOnly'],
      },
    });
    const event = createMockH3Event({
      method: 'POST',
    });
    const response = await completePostEventHandler(event);
    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'mock-cookie=mock-value; Path=/; HttpOnly',
    );
    expect(response).toEqual({
      success: true,
      message: 'Registration completed successfully',
      data: {},
    });
  });

  it('handle accessToken with exp field', async () => {
    const token = jwt.sign({}, 'secret', {
      expiresIn: '10s',
    });
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'Registration completed successfully',
        data: {
          accessToken: token, // Token with exp
        },
      },
      headers: {
        getSetCookie: () => ['mock-cookie=mock-value; Path=/; HttpOnly'],
      },
    });
    const event = createMockH3Event({
      method: 'POST',
    });
    const response = await completePostEventHandler(event);
    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'mock-cookie=mock-value; Path=/; HttpOnly',
    );
    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'access_token=' + token + '; Max-Age=10; Path=/; SameSite=Lax',
    );
    expect(response).toEqual({
      success: true,
      message: 'Registration completed successfully',
      data: {
        accessToken: token,
      },
    });
  });
});
