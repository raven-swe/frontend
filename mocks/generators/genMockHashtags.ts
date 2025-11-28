import { faker } from '@faker-js/faker';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { TrendingHashtag } from '../../shared/types/hashtag';
import type { ExploreTab } from '../../shared/types/timeline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Predefined hashtags for each category
const trendingHashtags = [
  'TechTrends2025',
  'ViralMoment',
  'GlobalNews',
  'MustWatch',
  'TrendingNow',
  'HotTopic',
  'BreakingNews',
  'Trending',
  'WorldWide',
  'PopularNow',
  'TrendAlert',
  'DailyTrends',
  'SocialBuzz',
  'GoingViral',
  'TopTrending',
];

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

function generateHashtagsForCategory(hashtags: string[], count: number): TrendingHashtag[] {
  const shuffled = faker.helpers.shuffle([...hashtags]);
  return shuffled.slice(0, Math.min(count, hashtags.length)).map((hashtag) => ({
    hashtag,
    tweetsCount: faker.number.int({ min: 1000, max: 1000000 }),
  }));
}

function generateAllHashtags() {
  const categorizedHashtags: Record<ExploreTab, TrendingHashtag[]> = {
    trending: generateHashtagsForCategory(trendingHashtags, 15),
    news: generateHashtagsForCategory(newsHashtags, 15),
    sports: generateHashtagsForCategory(sportsHashtags, 20),
    entertainment: generateHashtagsForCategory(entertainmentHashtags, 20),
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
