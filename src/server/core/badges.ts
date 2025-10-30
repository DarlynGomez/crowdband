import { redis } from "@devvit/web/server";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'special';
  requirement: string;
}

export interface UserBadge {
  badgeId: string;
  earnedAt: number;
}

export interface UserStats {
  userId: string;
  username: string;
  totalSubmissions: number;
  totalVotes: number;
  topVotedSubmissions: number;
  weeksParticipated: number;
  consecutiveWeeks: number;
  firstSubmissionAt: number;
  badges: UserBadge[];
}

// All available badges
export const BADGES: Badge[] = [
  // Bronze Tier
  {
    id: 'first_submission',
    name: 'First Voice',
    description: 'Submit your first lyric',
    icon: '🎤',
    tier: 'bronze',
    requirement: '1 submission'
  },
  {
    id: 'five_submissions',
    name: 'Lyricist',
    description: 'Submit 5 lyrics',
    icon: '📝',
    tier: 'bronze',
    requirement: '5 submissions'
  },
  {
    id: 'first_vote',
    name: 'Supporter',
    description: 'Receive your first upvote',
    icon: '⬆️',
    tier: 'bronze',
    requirement: '1 vote received'
  },
  
  // Silver Tier
  {
    id: 'ten_submissions',
    name: 'Songwriter',
    description: 'Submit 10 lyrics',
    icon: '🎼',
    tier: 'silver',
    requirement: '10 submissions'
  },
  {
    id: 'top_voted',
    name: 'Chart Topper',
    description: 'Have the most votes on a submission',
    icon: '🏆',
    tier: 'silver',
    requirement: 'Top voted submission'
  },
  {
    id: 'three_weeks',
    name: 'Regular',
    description: 'Participate in 3 different weeks',
    icon: '🗓️',
    tier: 'silver',
    requirement: '3 weeks'
  },
  
  // Gold Tier
  {
    id: 'twentyfive_submissions',
    name: 'Prolific Writer',
    description: 'Submit 25 lyrics',
    icon: '✍️',
    tier: 'gold',
    requirement: '25 submissions'
  },
  {
    id: 'five_top_voted',
    name: 'Hit Maker',
    description: 'Have 5 top-voted submissions',
    icon: '💿',
    tier: 'gold',
    requirement: '5 top submissions'
  },
  {
    id: 'hundred_votes',
    name: 'Fan Favorite',
    description: 'Receive 100+ total votes',
    icon: '⭐',
    tier: 'gold',
    requirement: '100 total votes'
  },
  
  // Diamond Tier
  {
    id: 'fifty_submissions',
    name: 'Legend',
    description: 'Submit 50 lyrics',
    icon: '👑',
    tier: 'diamond',
    requirement: '50 submissions'
  },
  {
    id: 'ten_weeks',
    name: 'Band Member',
    description: 'Participate in 10 different weeks',
    icon: '🎸',
    tier: 'diamond',
    requirement: '10 weeks'
  },
  
  // Special Badges
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Submit to 3 consecutive weeks',
    icon: '🔥',
    tier: 'special',
    requirement: '3 consecutive weeks'
  },
  {
    id: 'in_the_song',
    name: 'On The Record',
    description: 'Have your lyric in a completed song',
    icon: '🎵',
    tier: 'special',
    requirement: 'In completed song'
  },
  {
    id: 'og',
    name: 'OG',
    description: 'Submit the very first lyric in CrowdBand history',
    icon: '💎',
    tier: 'special',
    requirement: 'First ever submission'
  }
];

// Get user stats
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const data = await redis.get(`user:stats:${userId}`);
  return data ? JSON.parse(data) : null;
}

// Save user stats
export async function saveUserStats(stats: UserStats): Promise<void> {
  await redis.set(`user:stats:${stats.userId}`, JSON.stringify(stats));
}

// Initialize user stats
export async function initializeUserStats(userId: string, username: string): Promise<UserStats> {
  const stats: UserStats = {
    userId,
    username,
    totalSubmissions: 0,
    totalVotes: 0,
    topVotedSubmissions: 0,
    weeksParticipated: 0,
    consecutiveWeeks: 0,
    firstSubmissionAt: Date.now(),
    badges: []
  };
  await saveUserStats(stats);
  return stats;
}

// Award badge to user
export async function awardBadge(userId: string, badgeId: string): Promise<void> {
  let stats = await getUserStats(userId);
  if (!stats) return;
  
  // Check if already has badge
  if (stats.badges.some(b => b.badgeId === badgeId)) return;
  
  stats.badges.push({
    badgeId,
    earnedAt: Date.now()
  });
  
  await saveUserStats(stats);
}

// Check and award badges based on stats
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const stats = await getUserStats(userId);
  if (!stats) return [];
  
  const newBadges: string[] = [];
  
  // Check each badge requirement
  if (stats.totalSubmissions >= 1 && !stats.badges.some(b => b.badgeId === 'first_submission')) {
    await awardBadge(userId, 'first_submission');
    newBadges.push('first_submission');
  }
  
  if (stats.totalSubmissions >= 5 && !stats.badges.some(b => b.badgeId === 'five_submissions')) {
    await awardBadge(userId, 'five_submissions');
    newBadges.push('five_submissions');
  }
  
  if (stats.totalVotes >= 1 && !stats.badges.some(b => b.badgeId === 'first_vote')) {
    await awardBadge(userId, 'first_vote');
    newBadges.push('first_vote');
  }
  
  if (stats.totalSubmissions >= 10 && !stats.badges.some(b => b.badgeId === 'ten_submissions')) {
    await awardBadge(userId, 'ten_submissions');
    newBadges.push('ten_submissions');
  }
  
  if (stats.topVotedSubmissions >= 1 && !stats.badges.some(b => b.badgeId === 'top_voted')) {
    await awardBadge(userId, 'top_voted');
    newBadges.push('top_voted');
  }
  
  if (stats.weeksParticipated >= 3 && !stats.badges.some(b => b.badgeId === 'three_weeks')) {
    await awardBadge(userId, 'three_weeks');
    newBadges.push('three_weeks');
  }
  
  if (stats.totalSubmissions >= 25 && !stats.badges.some(b => b.badgeId === 'twentyfive_submissions')) {
    await awardBadge(userId, 'twentyfive_submissions');
    newBadges.push('twentyfive_submissions');
  }
  
  if (stats.topVotedSubmissions >= 5 && !stats.badges.some(b => b.badgeId === 'five_top_voted')) {
    await awardBadge(userId, 'five_top_voted');
    newBadges.push('five_top_voted');
  }
  
  if (stats.totalVotes >= 100 && !stats.badges.some(b => b.badgeId === 'hundred_votes')) {
    await awardBadge(userId, 'hundred_votes');
    newBadges.push('hundred_votes');
  }
  
  if (stats.totalSubmissions >= 50 && !stats.badges.some(b => b.badgeId === 'fifty_submissions')) {
    await awardBadge(userId, 'fifty_submissions');
    newBadges.push('fifty_submissions');
  }
  
  if (stats.weeksParticipated >= 10 && !stats.badges.some(b => b.badgeId === 'ten_weeks')) {
    await awardBadge(userId, 'ten_weeks');
    newBadges.push('ten_weeks');
  }
  
  if (stats.consecutiveWeeks >= 3 && !stats.badges.some(b => b.badgeId === 'hot_streak')) {
    await awardBadge(userId, 'hot_streak');
    newBadges.push('hot_streak');
  }
  
  return newBadges;
}

// Get leaderboard
export async function getLeaderboard(limit: number = 10): Promise<UserStats[]> {
  // Get all user IDs
  const userIdsData = await redis.get('users:all');
  const userIds: string[] = userIdsData ? JSON.parse(userIdsData) : [];
  
  // Get all stats
  const allStats = await Promise.all(
    userIds.map(id => getUserStats(id))
  );
  
  // Filter and sort
  const validStats = allStats.filter((s): s is UserStats => s !== null);
  validStats.sort((a, b) => b.totalSubmissions - a.totalSubmissions);
  
  return validStats.slice(0, limit);
}

// Track user globally
export async function trackUser(userId: string): Promise<void> {
  const userIdsData = await redis.get('users:all');
  const userIds: string[] = userIdsData ? JSON.parse(userIdsData) : [];
  
  if (!userIds.includes(userId)) {
    userIds.push(userId);
    await redis.set('users:all', JSON.stringify(userIds));
  }
}
