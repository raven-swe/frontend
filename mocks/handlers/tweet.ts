import { http, HttpResponse } from 'msw';
import type { Tweet, CreateTweetRequest } from '../../shared/types/tweets';
import tweetsData from '../data/mock-tweets.json' assert { type: 'json' };
import type { ApiSuccessResponse } from '#shared/types/api';
import { useUserStore } from '../../app/stores/user';

const API_URL = process.env.BACKEND_URL;
const initialTweets = (tweetsData as unknown as Tweet[]) || [];
const tweets = new Map<string, Tweet>(initialTweets.map((t) => [t.id, { ...t }]));

const getTweet = (id: string) => tweets.get(id);
const genId = () => Math.random().toString(36).slice(2, 10);
const mediaStore = new Map<string, { id: string; url: string; type: 'IMAGE' | 'VIDEO' | 'GIF' }>();

const likeTweet = (t: Tweet) => {
  if (!t.isLiked) {
    t.isLiked = true;
    t.likeCount += 1;
  }
};

const unlikeTweet = (t: Tweet) => {
  if (t.isLiked) {
    t.isLiked = false;
    t.likeCount = Math.max(0, t.likeCount - 1);
  }
};

const retweet = (t: Tweet) => {
  if (!t.isRetweeted) {
    t.isRetweeted = true;
    t.retweetCount += 1;
  }
};

const unretweet = (t: Tweet) => {
  if (t.isRetweeted) {
    t.isRetweeted = false;
    t.retweetCount = Math.max(0, t.retweetCount - 1);
  }
};

export const handlers = [
  // post media upload image: /media/upload/image
  // request body: form-data(file: File, folder: string)
  // response: { success: boolean; message: string; data: { url: string, id: string, message: string } }

  // POST /media/upload/image
  http.post(`${API_URL}/media/upload/image`, async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return HttpResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
    }

    const id = genId();
    const url = `/mock/media/images/${folder}/${id}/${file.name}`;

    mediaStore.set(id, { id, url, type: 'IMAGE' });

    return HttpResponse.json(
      {
        success: true,
        message: 'Image uploaded successfully.',
        data: {
          id,
          url,
          message: 'File stored in media store (mock).',
        },
      },
      { status: 200 },
    );
  }),

  // post media upload image: /media/upload/video
  // request body: form-data(file: File, folder: string)
  // response: { success: boolean; message: string; data: { url: string, id: string, message: string } }

  // POST /media/upload/video
  http.post(`${API_URL}/media/upload/video`, async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return HttpResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
    }

    const id = genId();
    const url = `/mock/media/videos/${folder}/${id}/${file.name}`;

    mediaStore.set(id, { id, url, type: 'VIDEO' });

    return HttpResponse.json(
      {
        success: true,
        message: 'Video uploaded successfully.',
        data: {
          id,
          url,
          message: 'File stored in media store (mock).',
        },
      },
      { status: 200 },
    );
  }),

  // post tweets: /tweets
  // request body: { content: string; media?: string[];  isReplyToTweetId?: string }
  // response: { success: boolean; message: string; data: Tweet }

  // POST /tweets
  http.post(`${API_URL}/tweets`, async ({ request }) => {
    const body = (await request.json()) as CreateTweetRequest;

    const { content, media = [], isReplyToTweetId = null } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return HttpResponse.json(
        { success: false, message: 'Content is required.' },
        { status: 400 },
      );
    }

    // basically unreachable
    if (media.length > 4) {
      return HttpResponse.json(
        { success: false, message: 'You can attach up to 4 media items only.' },
        { status: 400 },
      );
    }

    // Validate media IDs
    const storedMedia = [];
    for (const m of media) {
      const found = mediaStore.get(m);
      if (!found) {
        return HttpResponse.json(
          { success: false, message: `Media ID "${m}" not found.` },
          { status: 400 },
        );
      }
      storedMedia.push(found);
    }

    // create tweet instance
    const id = genId();
    const createdAt = new Date().toISOString();
    const userStore = useUserStore();

    const newTweet: Tweet = {
      id,
      content,
      createdAt,
      author: {
        username: userStore.user.username,
        displayName: userStore.user.displayName,
        avatarUrl: userStore.user.avatarUrl,
        isFollowing: true,
        isFollower: false,
      },
      replyCount: 0,
      retweetCount: 0,
      likeCount: 0,
      isLiked: false,
      isRetweeted: false,
      entities: {
        mentions: [],
        hashtags: [],
      },
      media: storedMedia.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        altText: '',
        width: 0,
        height: 0,
      })),
      isReplyToTweetId,
    };

    // eslint-disable-next-line no-console
    console.log('New tweet created (mock):', newTweet);

    tweets.set(id, newTweet);

    return HttpResponse.json(
      {
        success: true,
        message: 'Tweet posted successfully.',
        data: newTweet,
      },
      { status: 201 },
    );
  }),

  // Get All Tweets
  http.get(`${API_URL}/tweets`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Tweets fetched successfully.',
        data: Array.from(tweets.values()),
      },
      { status: 200 },
    );
  }),

  // GET /tweets/:id — fetch a tweet by id
  http.get(`${API_URL}/tweets/:id`, ({ params }) => {
    const { id } = params as { id: string };
    const tweet = getTweet(id);
    if (!tweet) {
      return HttpResponse.json({ message: `Tweet "${id}" not found` }, { status: 404 });
    }
    return HttpResponse.json(
      {
        success: true,
        message: 'Tweet fetched successfully.',
        data: tweet,
      },
      { status: 200 },
    );
  }),

  // POST /tweets/:id/like — like a tweet
  http.post(`${API_URL}/tweets/:id/like`, ({ params }) => {
    const { id } = params as { id: string };
    const tweet = getTweet(id);
    if (!tweet) {
      return HttpResponse.json({ message: `Tweet "${id}" not found` }, { status: 404 });
    }
    if (tweet.isLiked) {
      return HttpResponse.json({ message: 'Tweet already liked.' }, { status: 409 });
    }
    likeTweet(tweet);
    return HttpResponse.json(
      { success: true, message: 'Tweet liked successfully.' },
      { status: 200 },
    );
  }),

  // DELETE /tweets/:id/like — unlike a tweet
  http.delete(`${API_URL}/tweets/:id/like`, ({ params }) => {
    const { id } = params as { id: string };
    const tweet = getTweet(id);
    if (!tweet) {
      return HttpResponse.json({ message: `Tweet "${id}" not found` }, { status: 404 });
    }
    if (!tweet.isLiked) {
      return HttpResponse.json({ message: 'Tweet is not liked.' }, { status: 400 });
    }
    unlikeTweet(tweet);
    return HttpResponse.json(
      { success: true, message: 'Tweet unliked successfully.' },
      { status: 200 },
    );
  }),

  // POST /tweets/:id/retweet — retweet a tweet
  http.post(`${API_URL}/tweets/:id/retweet`, ({ params }) => {
    const { id } = params as { id: string };
    const tweet = getTweet(id);
    if (!tweet) {
      return HttpResponse.json({ message: `Tweet "${id}" not found` }, { status: 404 });
    }
    if (tweet.isRetweeted) {
      return HttpResponse.json({ message: 'Tweet already retweeted.' }, { status: 409 });
    }
    retweet(tweet);
    return HttpResponse.json(
      { success: true, message: 'Tweet retweeted successfully.' },
      { status: 200 },
    );
  }),

  // DELETE /tweets/:id/retweet — undo retweet
  http.delete(`${API_URL}/tweets/:id/retweet`, ({ params }) => {
    const { id } = params as { id: string };
    const tweet = getTweet(id);
    if (!tweet) {
      return HttpResponse.json({ message: `Tweet "${id}" not found` }, { status: 404 });
    }
    if (!tweet.isRetweeted) {
      return HttpResponse.json({ message: 'Tweet is not retweeted.' }, { status: 400 });
    }
    unretweet(tweet);
    return HttpResponse.json(
      { success: true, message: 'Retweet undone successfully.' },
      { status: 200 },
    );
  }),

  // GET /timeline/for-you
  http.get(`${API_URL}/timeline/for-you`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || null;
    const limit = Number(url.searchParams.get('limit') || '20');

    const allTweets = Array.from(tweets.values());
    const startIndex = cursor ? Math.max(0, Number(cursor)) : 0;
    const paginatedTweets = allTweets.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + paginatedTweets.length;
    const nextCursor = nextIndex < allTweets.length ? String(nextIndex) : null;

    return HttpResponse.json(
      {
        success: true,
        message: 'Timeline fetched successfully.',
        data: paginatedTweets,
        pagination: {
          cursor: String(startIndex),
          nextCursor,
          hasNextPage: !!nextCursor,
        },
      } as ApiSuccessResponse<Tweet[]>,
      { status: 200 },
    );
  }),

  // GET /timeline/following
  http.get(`${API_URL}/timeline/following`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || null;
    const limit = Number(url.searchParams.get('limit') || '20');

    const allTweets = Array.from(tweets.values());
    const startIndex = cursor ? Math.max(0, Number(cursor)) : 0;
    const paginatedTweets = allTweets.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + paginatedTweets.length;
    const nextCursor = nextIndex < allTweets.length ? String(nextIndex) : null;

    return HttpResponse.json(
      {
        success: true,
        message: 'Timeline fetched successfully.',
        data: paginatedTweets,
        pagination: {
          cursor: String(startIndex),
          nextCursor,
          hasNextPage: !!nextCursor,
        },
      } as ApiSuccessResponse<Tweet[]>,
      { status: 200 },
    );
  }),
];
