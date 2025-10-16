import { faker } from '@faker-js/faker';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Tweet } from '../../types/tweets';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function makeAuthor(index: number) {
  const username = faker.internet.userName().toLowerCase() + index;
  return {
    username,
    displayName: faker.person.fullName(),
    avatarUrl: `/avatars/${username}.png`,
    isFollowing: faker.datatype.boolean(),
    isFollower: faker.datatype.boolean(),
  };
}

function randomEntities() {
  const mentionsCount = faker.number.int({ min: 0, max: 2 });
  const hashtagsCount = faker.number.int({ min: 0, max: 2 });
  const mentions = Array.from({ length: mentionsCount }, () => ({
    username: faker.internet.userName().toLowerCase(),
    startPosition: faker.number.int({ min: 0, max: 20 }),
  }));
  const hashtags = Array.from({ length: hashtagsCount }, () => ({
    hashtag: faker.hacker.noun().replace(/\s+/g, ''),
    startPosition: faker.number.int({ min: 0, max: 20 }),
  }));
  return { mentions, hashtags };
}

function randomMedia() {
  const shouldHaveMedia = faker.datatype.boolean(0.3);
  if (!shouldHaveMedia) return [] as Tweet['media'];
  const types = ['IMAGE', 'GIF', 'VIDEO'] as const;
  const type = faker.helpers.arrayElement(types);
  return [
    {
      type,
      url: faker.internet.url(),
      altText: faker.lorem.sentence(),
      width: faker.number.int({ min: 320, max: 1920 }),
      height: faker.number.int({ min: 240, max: 1080 }),
    },
  ] as Tweet['media'];
}

function makeBaseTweet(id: string, content?: string): Tweet {
  return {
    id,
    content: content ?? faker.lorem.sentences({ min: 1, max: 3 }),
    createdAt: new Date().toISOString(),
    author: makeAuthor(faker.number.int({ min: 1, max: 999 })),
    replyCount: 0,
    retweetCount: faker.number.int({ min: 0, max: 100 }),
    likeCount: faker.number.int({ min: 0, max: 500 }),
    isLiked: faker.datatype.boolean(),
    isRetweeted: faker.datatype.boolean(),
    entities: randomEntities(),
    media: randomMedia(),
  };
}

function makeData() {
  const t1: Tweet = makeBaseTweet('tw-' + faker.string.nanoid(6));

  const t2: Tweet = makeBaseTweet('tw-' + faker.string.nanoid(6));
  const t3: Tweet = {
    ...makeBaseTweet('tw-' + faker.string.nanoid(6), faker.lorem.sentences({ min: 1, max: 2 })),
    isReplyToTweetId: t1.id,
  };
  t1.replyCount += 1;

  const quotedLight: Tweet = {
    ...t1,
    quotedTweet: undefined,
    quotedTweetId: undefined,
    isReplyToTweetId: undefined,
  };
  const t4: Tweet = {
    ...makeBaseTweet('tw-' + faker.string.nanoid(6), faker.lorem.sentences({ min: 1, max: 2 })),
    quotedTweetId: t1.id,
    quotedTweet: quotedLight,
  };

  const tweets: Tweet[] = [t1, t2, t3, t4];
  return tweets;
}

function main() {
  const data = makeData();
  const outDir = path.resolve(__dirname, '../data');
  const outFile = path.join(outDir, 'tweet.json');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${data.length} tweets to ${path.relative(process.cwd(), outFile)}`);
}

main();
