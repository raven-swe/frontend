import { apiFetch } from '~/api';

export const likeTweet = async (tweetId: string) => {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
    }>(`/api/tweets/${tweetId}/like`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error(`Failed to like tweet:`, error);
    throw error;
  }
};
export const unLikeTweet = async (tweetId: string) => {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
    }>(`/api/tweets/${tweetId}/like`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error(`Failed to unlike tweet:`, error);
    throw error;
  }
};
export const retweetTweet = async (tweetId: string) => {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
    }>(`/api/tweets/${tweetId}/retweet`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error(`Failed to retweet:`, error);
    throw error;
  }
};
export const undoRetweetTweet = async (tweetId: string) => {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
    }>(`/api/tweets/${tweetId}/retweet`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error(`Failed to undo retweet:`, error);
    throw error;
  }
};
