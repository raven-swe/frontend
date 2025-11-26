import { faker } from '@faker-js/faker';
import type { User } from '#shared/types/user';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type BioEntity = User['bioEntities'];
function generateBioWithEntities(): { bio: string; bioEntities: BioEntity } {
  const bioTokens: string[] = [];
  const mentions: BioEntity['mentions'] = [];
  const hashtags: BioEntity['hashtags'] = [];

  const wordCount = faker.number.int({ min: 10, max: 25 });
  let currentPosition = 0;

  for (let i = 0; i < wordCount; i++) {
    const rnd = Math.random();

    let token = '';
    if (rnd < 0.7) {
      token = faker.word.words(); // 70% regular word
    } else if (rnd < 0.8) {
      const username = faker.internet.username();
      token = `@${username}`;
      mentions.push({ username, startPosition: currentPosition });
    } else if (rnd < 0.9) {
      const tag = faker.word.noun(); // 10% hashtag
      token = `#${tag}`;
      hashtags.push({ hashtag: tag, startPosition: currentPosition });
    } else {
      // 10% random link
      const url = faker.internet.url();
      token = url;
    }

    bioTokens.push(token);
    currentPosition += token.length + 1;
  }

  const bio = bioTokens.join(' ');

  return {
    bio,
    bioEntities: { mentions, hashtags },
  };
}

export function generateMockUser(): User {
  const { bio, bioEntities } = generateBioWithEntities();
  return {
    username: faker.internet.username(),
    displayName: faker.internet.displayName(),
    bio,
    bioEntities,
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
