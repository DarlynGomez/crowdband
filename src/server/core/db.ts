import { redis } from '@devvit/web/server';
import type { SongPrompt, LyricSubmission, FinalSong } from '../../shared/types/band';

const KEYS = {
  prompt: (id: string) => `prompt:${id}`,
  currentPrompt: () => `prompt:current`,
  submission: (id: string) => `submission:${id}`,
  submissionsByPrompt: (promptId: string) => `submissions:prompt:${promptId}`,
  votes: (submissionId: string) => `votes:${submissionId}`,
  userSubmission: (userId: string, promptId: string) => `user:${userId}:prompt:${promptId}`,
  song: (id: string) => `song:${id}`,
  songsByWeek: (week: number) => `songs:week:${week}`,
};

export const db = {
  // Prompt operations
  async savePrompt(prompt: SongPrompt): Promise<void> {
    await redis.set(KEYS.prompt(prompt.id), JSON.stringify(prompt));
    await redis.set(KEYS.currentPrompt(), prompt.id);
  },

  async getCurrentPrompt(): Promise<SongPrompt | null> {
    const promptId = await redis.get(KEYS.currentPrompt());
    if (!promptId) return null;
    const data = await redis.get(KEYS.prompt(promptId));
    return data ? JSON.parse(data) : null;
  },

  async getPrompt(id: string): Promise<SongPrompt | null> {
    const data = await redis.get(KEYS.prompt(id));
    return data ? JSON.parse(data) : null;
  },

  // Submission operations
  async saveSubmission(submission: LyricSubmission): Promise<void> {
    await redis.set(KEYS.submission(submission.id), JSON.stringify(submission));
    await redis.sadd(KEYS.submissionsByPrompt(submission.promptId), submission.id);
    await redis.set(KEYS.userSubmission(submission.userId, submission.promptId), submission.id);
  },

  async hasUserSubmitted(userId: string, promptId: string): Promise<boolean> {
    const submissionId = await redis.get(KEYS.userSubmission(userId, promptId));
    return !!submissionId;
  },

  async getSubmissionsByPrompt(promptId: string): Promise<LyricSubmission[]> {
    const submissionIds = await redis.smembers(KEYS.submissionsByPrompt(promptId));
    const submissions = await Promise.all(
      submissionIds.map(async (id) => {
        const data = await redis.get(KEYS.submission(id));
        return data ? JSON.parse(data) : null;
      })
    );
    return submissions.filter(Boolean);
  },

  async getSubmission(id: string): Promise<LyricSubmission | null> {
    const data = await redis.get(KEYS.submission(id));
    return data ? JSON.parse(data) : null;
  },

  // Vote operations
  async incrementVote(submissionId: string): Promise<number> {
    return await redis.incrBy(KEYS.votes(submissionId), 1);
  },

  async getVotes(submissionId: string): Promise<number> {
    const votes = await redis.get(KEYS.votes(submissionId));
    return votes ? parseInt(votes) : 0;
  },

  // Song operations
  async saveSong(song: FinalSong): Promise<void> {
    await redis.set(KEYS.song(song.id), JSON.stringify(song));
    await redis.sadd(KEYS.songsByWeek(song.weekNumber), song.id);
  },

  async getSong(id: string): Promise<FinalSong | null> {
    const data = await redis.get(KEYS.song(id));
    return data ? JSON.parse(data) : null;
  },
};

export { KEYS };
