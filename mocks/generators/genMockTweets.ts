import { faker } from '@faker-js/faker';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Tweet, TweetAuthor, TweetWithParents } from '../../shared/types/tweets';
import type { User } from '#shared/types/user';
import { generateBioWithEntities } from './genMockUsers';
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

function makeBaseTweet(id: string, content?: string, author?: TweetAuthor): TweetWithParents {
  const contentGenerated = generateBioWithEntities();
  return {
    id,
    content: content ?? contentGenerated.bio,
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
    entities: contentGenerated.bioEntities!,
    media: randomMedia(),
    replyToTweetId: undefined,
    hasMoreParents: false,
    parentTweets: null,
    quoteToTweetId: null,
    quotedTweet: null,
    rootTweet: null,
  };
}

async function makeData() {
  const NUM_TWEETS = 400;
  const usersPath = path.resolve(__dirname, '../data/mock-users.json');
  let users: User[] = [];
  try {
    const raw = readFileSync(usersPath, 'utf-8');
    users = JSON.parse(raw);
  } catch {
    users = [];
  }

  const tweets: (Tweet | TweetWithParents)[] = [];

  const NUM_THREAD_TWEETS = 10;

  const tweetMap = new Map<string, Tweet | TweetWithParents>();
  for (let i = 0; i < NUM_THREAD_TWEETS; ++i) {
    const randomUser = faker.helpers.arrayElement(users);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const tweet = makeBaseTweet('tw-thread-' + i, undefined, makeAuthorFromUser(randomUser));
    tweetMap.set(tweet.id, tweet);
  }

  for (let i = NUM_THREAD_TWEETS - 1; i > 0; --i) {
    const currentTweet = tweetMap.get('tw-thread-' + i) as TweetWithParents;
    const rootTweet = tweetMap.get('tw-thread-0');
    currentTweet.replyToTweetId = 'tw-thread-' + (i - 1);
    currentTweet.rootTweet = rootTweet;
    const parentTweets: Tweet[] = [];
    for (let j = i - 1; j > 0; --j) {
      const parentTweet = tweetMap.get('tw-thread-' + j) as Tweet;
      parentTweets.push(parentTweet);
    }
    if (parentTweets.length > 4) {
      currentTweet.hasMoreParents = true;
      parentTweets.splice(4);
    }
    parentTweets.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
    currentTweet.parentTweets = parentTweets;
  }

  tweets.push(...Array.from(tweetMap.values()));

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

  for (let i = NUM_THREAD_TWEETS + 1; i < tweets.length; i++) {
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

async function main() {
  const data = await makeData();
  const outDir = path.resolve(__dirname, '../data');
  const outFile = path.join(outDir, 'mock-tweets.json');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf-8');
}

await main();
