import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { serverApiFetch } from '~~/server/utils/api';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

const API_URL = process.env.BACKEND_URL || 'https://example.com';

useH3TestUtils();

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

    const event = createMockH3Event({}, {});
    const fetcher = serverApiFetch(event);
    const res = await fetcher('/test');

    expect(res).toEqual({ success: true });
    scope.done();
  });

  it('throws h3 error with error key', async () => {
    const scope = nock(API_URL)
      .get('/fail')
      .reply(400, { error: { message: 'Invalid input' } });

    const event = createMockH3Event({}, {});
    const fetcher = serverApiFetch(event);
    await expect(fetcher('/fail')).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: { error: { message: 'Invalid input' } },
    });

    scope.done();
  });

  it('throws h3 error with message key', async () => {
    const scope = nock(API_URL).get('/fail').reply(400, { message: 'Invalid input' });

    const event = createMockH3Event({}, {});
    const fetcher = serverApiFetch(event);
    await expect(fetcher('/fail')).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: { message: 'Invalid input' },
    });

    scope.done();
  });

  it('falls back to "Server Error" when no message fields exist', async () => {
    const scope = nock(API_URL).get('/fail').reply(500, {});

    const event = createMockH3Event({}, {});
    const fetcher = serverApiFetch(event);
    await expect(fetcher('/fail')).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Server Error',
      data: {},
    });

    scope.done();
  });

  it('forwards client ip from h3 event to backend', async () => {
    const scope = nock(API_URL, {
      reqheaders: { 'x-client-ip': '123.456.789.111' },
    })
      .get('/ip-test')
      .reply(200, { success: true });

    const event = createMockH3Event(
      {},
      {
        'x-forwarded-for': '123.456.789.111',
      },
    );
    const fetcher = serverApiFetch(event);
    const res = await fetcher('/ip-test');

    expect(res).toEqual({ success: true });
    scope.done();
  });

  it('forwards authorization header from h3 event to backend', async () => {
    const scope = nock(API_URL, {
      reqheaders: { authorization: 'Bearer mock-token' },
    })
      .get('/auth-test')
      .reply(200, { success: true });

    const event = createMockH3Event(
      {},
      {
        Authorization: 'Bearer mock-token',
      },
    );
    const fetcher = serverApiFetch(event);
    const res = await fetcher('/auth-test');

    expect(res).toEqual({ success: true });
    scope.done();
  });
});
