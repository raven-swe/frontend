import { faker } from '@faker-js/faker';
import type { User } from '#shared/types/user';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateMockUser(): User {
  return {
    username: faker.internet.username(),
    displayName: faker.internet.displayName(),
    bio: faker.lorem.sentence(),
    bioEntities: {
      mentions: [],
      hashtags: [],
    },
    avatarUrl: faker.image.avatar(),
    bannerUrl: faker.image.urlPicsumPhotos({ width: 128 }),
    location: faker.location.city(),
    websiteUrl: faker.internet.url(),
    birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString(),
    joinedAt: faker.date
      .past({
        years: 5,
      })
      .toISOString(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    languageCode: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
  };
}

const totalMockUsers = 100;
export const mockUsers: User[] = Array.from({ length: totalMockUsers }, generateMockUser);
const stream = fs.createWriteStream(path.join(__dirname, '../data/mock-users.json'));
stream.write(JSON.stringify(mockUsers, null, 2));
stream.end();
