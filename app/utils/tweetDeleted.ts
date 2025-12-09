export function isTweetDeleted(tweet: Tweet | DeletedTweet): tweet is DeletedTweet {
  return (tweet as DeletedTweet).isDeleted === true;
}
