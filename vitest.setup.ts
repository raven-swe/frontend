// @vitest-environment node
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/node.ts';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
