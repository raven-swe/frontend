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
    followersCount: faker.number.int({ min: 0, max: 100000 }),
    followingCount: faker.number.int({ min: 0, max: 10000 }),
    languageCode: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
    relationship: {
      blocking: faker.datatype.boolean(),
      blockedBy: faker.datatype.boolean(),
      muted: faker.datatype.boolean(),
      following: faker.datatype.boolean(),
      follower: faker.datatype.boolean(),
    },
  };
}

const totalMockUsers = 100;
export const mockUsers: User[] = Array.from({ length: totalMockUsers }, generateMockUser);
const outputDir = path.join(__dirname, '../data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'mock-users.json');
fs.writeFileSync(outputPath, JSON.stringify(mockUsers, null, 2));
console.warn(`Mock users written to ${outputPath}`);
