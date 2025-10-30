import { redis } from '@devvit/web/server';

const VOTE_KEY = (userId: string, submissionId: string) => 
  `vote:${userId}:${submissionId}`;

export async function hasUserVoted(userId: string, submissionId: string): Promise<boolean> {
  const voted = await redis.get(VOTE_KEY(userId, submissionId));
  return !!voted;
}

export async function recordVote(userId: string, submissionId: string): Promise<void> {
  await redis.set(VOTE_KEY(userId, submissionId), '1');
}

export async function removeVote(userId: string, submissionId: string): Promise<void> {
  await redis.del(VOTE_KEY(userId, submissionId));
}
