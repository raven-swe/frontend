import { faker } from '@faker-js/faker';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { TrendingHashtag } from '../../shared/types/hashtag';
import type { ExploreTab } from '../../shared/types/timeline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newsHashtags = [
  'BreakingNews',
  'WorldNews',
  'Politics',
  'Economy',
  'ClimateChange',
  'Technology',
  'Science',
  'Health',
  'Education',
  'Environment',
  'GlobalAffairs',
  'CurrentEvents',
  'NewsUpdate',
  'LiveNews',
  'InTheNews',
];

const sportsHashtags = [
  'Football',
  'Basketball',
  'Soccer',
  'Tennis',
  'Olympics',
  'WorldCup',
  'NBA',
  'NFL',
  'Cricket',
  'Baseball',
  'Hockey',
  'F1Racing',
  'Boxing',
  'MMA',
  'Swimming',
  'Athletics',
  'Sports',
  'GameDay',
  'Championship',
  'Finals',
];

const entertainmentHashtags = [
  'Hollywood',
  'Movies',
  'Music',
  'Celebrity',
  'TVShows',
  'Gaming',
  'Netflix',
  'Streaming',
  'PopCulture',
  'Entertainment',
  'RedCarpet',
  'Awards',
  'BoxOffice',
  'NewRelease',
  'Concert',
  'Festival',
  'Theater',
  'Drama',
  'Comedy',
  'Action',
];

function generateHashtagsForCategory(
  hashtags: string[],
  count: number,
  category: string,
): TrendingHashtag[] {
  const shuffled = faker.helpers.shuffle([...hashtags]);

  return shuffled.slice(0, Math.min(count, hashtags.length)).map((hashtag) => {
    // 50% chance to add # prefix, 50% keep as normal word
    const hasHashSymbol = faker.datatype.boolean();
    const formattedHashtag = hasHashSymbol ? `#${hashtag}` : hashtag;

    return {
      hashtag: formattedHashtag,
      tweetsCount: faker.number.int({ min: 1000, max: 1000000 }),
      category,
    };
  });
}

function generateAllHashtags() {
  const newsHashtagsList = generateHashtagsForCategory(newsHashtags, 15, 'news');
  const sportsHashtagsList = generateHashtagsForCategory(sportsHashtags, 20, 'sports');
  const entertainmentHashtagsList = generateHashtagsForCategory(
    entertainmentHashtags,
    20,
    'entertainment',
  );

  // Trending is a mix of all categories
  const trendingList = faker.helpers.shuffle([
    ...newsHashtagsList.slice(0, 5),
    ...sportsHashtagsList.slice(0, 5),
    ...entertainmentHashtagsList.slice(0, 5),
  ]);

  const categorizedHashtags: Record<ExploreTab, TrendingHashtag[]> = {
    trending: trendingList,
    news: newsHashtagsList,
    sports: sportsHashtagsList,
    entertainment: entertainmentHashtagsList,
  };

  return categorizedHashtags;
}

function main() {
  const data = generateAllHashtags();
  const outDir = path.resolve(__dirname, '../data');
  const outFile = path.join(outDir, 'mock-hashtags-categorized.json');

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`✅ Generated mock hashtags at: ${outFile}`);
}

main();
