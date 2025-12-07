import { faker } from '@faker-js/faker';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Tweet } from '../../shared/types/tweets';
import type { User } from '#shared/types/user';

type TweetAuthor = {
  username: string;
  displayName: string;
  avatarUrl: string;
  isFollowing: boolean;
  isFollower: boolean;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function makeAuthorFromUser(user: Partial<User> | undefined) {
  const rawName = user?.username ?? faker.internet.username();
  const username = String(rawName).toLowerCase();
  return {
    username,
    displayName: user?.displayName ?? faker.person.fullName(),
    avatarUrl: user?.avatarUrl ?? `/avatars/${username}.png`,
    isFollowing: faker.datatype.boolean(),
    isFollower: faker.datatype.boolean(),
  };
}

function randomEntities() {
  const mentionsCount = faker.number.int({ min: 0, max: 2 });
  const hashtagsCount = faker.number.int({ min: 0, max: 2 });
  const mentions = Array.from({ length: mentionsCount }, () => ({
    username: faker.internet.username().toLowerCase(),
    startPosition: faker.number.int({ min: 0, max: 20 }),
  }));
  const hashtags = Array.from({ length: hashtagsCount }, () => ({
    hashtag: faker.hacker.noun().replace(/\s+/g, ''),
    startPosition: faker.number.int({ min: 0, max: 20 }),
  }));
  return { mentions, hashtags };
}

function randomMedia() {
  const shouldHaveMedia = faker.datatype.boolean(0.4);
  if (!shouldHaveMedia) return [] as Tweet['media'];

  const types = ['IMAGE', 'GIF', 'VIDEO'] as const;
  const type = faker.helpers.arrayElement(types);

  let url = '';
  switch (type) {
    case 'IMAGE': {
      const width = faker.number.int({ min: 400, max: 1200 });
      const height = faker.number.int({ min: 300, max: 900 });
      const seed = faker.number.int(10000);
      url = `https://picsum.photos/seed/${seed}/${width}/${height}`;
      break;
    }

    case 'GIF': {
      const gifIds = ['3oEjI6SIIHBdRxXI40', 'l0MYC0LajbaPoEADu', '26tPplGWjN0xLybiU'];
      const gifId = faker.helpers.arrayElement(gifIds);
      url = `https://media.giphy.com/media/${gifId}/giphy.gif`;
      break;
    }

    case 'VIDEO': {
      const videoSources = [
        'https://media.w3.org/2010/05/sintel/trailer.mp4',
        'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
        'https://vjs.zencdn.net/v/oceans.mp4',
        'https://www.w3schools.com/html/mov_bbb.mp4',
      ];
      url = faker.helpers.arrayElement(videoSources);
      break;
    }
  }

  return [
    {
      type,
      url,
      altText: faker.lorem.sentence(),
      width: faker.number.int({ min: 320, max: 1920 }),
      height: faker.number.int({ min: 240, max: 1080 }),
    },
  ] as Tweet['media'];
}

function makeBaseTweet(id: string, content?: string, author?: TweetAuthor): Tweet {
  return {
    id,
    content: content ?? faker.lorem.sentences({ min: 1, max: 3 }),
    createdAt: new Date().toISOString(),
    author:
      author ??
      makeAuthorFromUser({
        username: faker.internet.username().toLowerCase() + faker.number.int({ min: 1, max: 9999 }),
      }),
    replyCount: 0,
    retweetCount: faker.number.int({ min: 0, max: 100 }),
    likeCount: faker.number.int({ min: 0, max: 500 }),
    isLiked: faker.datatype.boolean(),
    isRetweeted: faker.datatype.boolean(),
    entities: randomEntities(),
    media: randomMedia(),
    replyToTweetId: undefined,
  };
}

function makeData() {
  const NUM_TWEETS = 400;
  const usersPath = path.resolve(__dirname, '../data/mock-users.json');
  let users: User[] = [];
  try {
    const raw = readFileSync(usersPath, 'utf-8');
    users = JSON.parse(raw);
  } catch {
    users = [];
  }

  const tweets: Tweet[] = [];
  for (let i = 0; i < 100; i++) {
    const id = 'tw-' + faker.string.nanoid(8);
    const chosenUser = users[0];
    const author = makeAuthorFromUser(chosenUser as Partial<User>);
    const t: Tweet = makeBaseTweet(id, 'This is a pinned tweet example.', author);
    tweets.push(t);
  }

  for (let i = 0; i < NUM_TWEETS - 100; i++) {
    const id = 'tw-' + faker.string.nanoid(8);
    const chosenUser = users.length ? faker.helpers.arrayElement(users) : undefined;
    const author = makeAuthorFromUser(chosenUser as Partial<User>);
    const t: Tweet = makeBaseTweet(id, undefined, author);
    tweets.push(t);
  }

  for (let i = 1; i < tweets.length; i++) {
    if (faker.number.int({ min: 0, max: 100 }) < 50) {
      const targetIndex = faker.number.int({ min: 0, max: i - 1 });
      tweets[i]!.replyToTweetId = tweets[targetIndex]!.id;
      tweets[targetIndex]!.replyCount = (tweets[targetIndex]!.replyCount ?? 0) + 1;
    }

    if (faker.number.int({ min: 0, max: 100 }) < 8) {
      const targetIndex = faker.number.int({ min: 0, max: i - 1 });
      const quotedLight: Partial<Tweet> = { ...tweets[targetIndex]! };
      (quotedLight as unknown as Record<string, unknown>).quotedTweet = undefined;
      (quotedLight as unknown as Record<string, unknown>).quotedTweetId = undefined;
      // (quotedLight as unknown as Record<string, unknown>).isReplyToTweetId = undefined;
      tweets[i]!.quoteToTweetId = tweets[targetIndex]!.id;
      tweets[i]!.quotedTweet = quotedLight as unknown as Tweet;
    }
  }

  return tweets;
}

function main() {
  const data = makeData();
  const outDir = path.resolve(__dirname, '../data');
  const outFile = path.join(outDir, 'mock-tweets.json');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf-8');
}

main();
