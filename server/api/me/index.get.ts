export default defineWrappedResponseHandler(async (_event) => {
  return {
    message: 'User profile fetched successfully',
    success: true,
    data: {
      username: 'backendUsername',
      displayName: 'display121',
      bio: 'This is the bio',
      bioEntities: {
        mentions: [],
        hashtags: [],
      },
      avatarUrl: '',
      bannerUrl: '',
      location: '',
      websiteUrl: '',
      birthDate: '2004-05-07',
      joinedAt: '2020-03-15T10:30:00Z',
      email: 'https://github.com/',
      phone: '+1234567890',
      followingCount: 0,
      followersCount: 0,
      mutualsCount: 0,
      mutualNames: [],
      languageCode: 'en',
    } as User,
  };
});
