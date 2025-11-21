import { describe, expect, it, vi } from 'vitest';
import startPostEventHander from '~~/server/api/auth/register/start.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('server/api/auth/register/start.post', () => {
  it('should return 200 for valid requests', async () => {
    const mockResponse = {
      status: 200,
      data: {
        success: true,
        message: 'Registration started',
        data: {
          creationToken: 'mock-creation-token',
        },
      },
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);
    const event = createMockH3Event({
      method: 'POST',
      body: { name: 'John Doe', email: 'john@example.com', birthDate: '2000-01-01' },
    });
    const response = await startPostEventHander(event);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      success: true,
      message: 'Registration started',
      data: {
        creationToken: 'mock-creation-token',
      },
    });
  });
});
