export default defineWrappedResponseHandler(() => {
  // Placeholder implementation - replace with actual logic to fetch interests
  return {
    success: true,
    message: 'Interests fetched successfully',
    data: [
      { id: 'news', name: 'News', code: 'NEWS', selected: false },
      { id: 'sports', name: 'Sports', code: 'SPORTS', selected: false },
      {
        id: 'entertainment',
        name: 'Entertainment',
        code: 'ENTERTAINMENT',
        selected: false,
      },
      { id: 'technology', name: 'Technology', code: 'TECHNOLOGY', selected: false },
      { id: 'music', name: 'Music', code: 'MUSIC', selected: false },
      { id: 'art', name: 'Art', code: 'ART', selected: false },
      { id: 'travel', name: 'Travel', code: 'TRAVEL', selected: false },
      { id: 'food', name: 'Food', code: 'FOOD', selected: false },
      { id: 'fashion', name: 'Fashion', code: 'FASHION', selected: false },
      { id: 'health', name: 'Health', code: 'HEALTH', selected: false },
      { id: 'science', name: 'Science', code: 'SCIENCE', selected: false },
      { id: 'gaming', name: 'Gaming', code: 'GAMING', selected: false },
      { id: 'movies', name: 'Movies', code: 'MOVIES', selected: false },
      { id: 'books', name: 'Books', code: 'BOOKS', selected: false },
      { id: 'photography', name: 'Photography', code: 'PHOTOGRAPHY', selected: false },
      { id: 'business', name: 'Business', code: 'BUSINESS', selected: false },
      { id: 'education', name: 'Education', code: 'EDUCATION', selected: false },
      { id: 'nature', name: 'Nature', code: 'NATURE', selected: false },
      { id: 'history', name: 'History', code: 'HISTORY', selected: false },
      { id: 'politics', name: 'Politics', code: 'POLITICS', selected: false },
      { id: 'comedy', name: 'Comedy', code: 'COMEDY', selected: false },
    ],
  };
});
