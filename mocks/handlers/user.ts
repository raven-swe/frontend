import { http, HttpResponse } from 'msw';

const mockUsers = {
  johndoe: { id: 'abc-123', name: 'John Doe' },
  janedoe: { id: 'xyz-456', name: 'Jane Doe' },
  ravenbot: { id: 'bot-001', name: 'Raven Bot' },
};

const API_URL = process.env.BACKEND_URL;

export const handlers = [
  http.get(`${API_URL}/user/:username`, ({ params }) => {
    const { username } = params;

    const user = mockUsers[username as keyof typeof mockUsers];

    if (!user) {
      return HttpResponse.json({ message: `User "${username}" not found` }, { status: 404 });
    }

    return HttpResponse.json(user, { status: 200 });
  }),
];
