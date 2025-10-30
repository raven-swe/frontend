import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { serverApiFetch } from '~~/server/utils/api';

const API_URL = process.env.BACKEND_URL || 'https://example.com';

describe('serverApiFetch', () => {
  beforeEach(() => {
    // Make sure no stray network calls
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('appends X-Client-Type header and hits correct baseURL', async () => {
    const scope = nock(API_URL, {
      reqheaders: { 'x-client-type': 'web' },
    })
      .get('/test')
      .reply(200, { success: true });

    const res = await serverApiFetch('/test');

    expect(res).toEqual({ success: true });
    scope.done();
  });

  it('throws h3 error with error key', async () => {
    const scope = nock(API_URL)
      .get('/fail')
      .reply(400, { error: { message: 'Invalid input' } });

    await expect(serverApiFetch('/fail')).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: { message: 'Invalid input' },
    });

    scope.done();
  });
  it('throws h3 error with message key', async () => {
    const scope = nock(API_URL).get('/fail').reply(400, { message: 'Invalid input' });

    await expect(serverApiFetch('/fail')).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: { message: 'Invalid input' },
    });

    scope.done();
  });

  it('falls back to "Server Error" when no message fields exist', async () => {
    const scope = nock(API_URL).get('/fail').reply(500, {});

    await expect(serverApiFetch('/fail')).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Server Error',
      data: {},
    });

    scope.done();
  });
});
