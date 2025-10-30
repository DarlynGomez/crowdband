import { redis } from "@devvit/web/server";

export async function getCurrentPrompt() {
  const data = await redis.get("prompt:current");
  return data ? JSON.parse(data) : null;
}

export async function savePrompt(prompt: any) {
  await redis.set("prompt:current", JSON.stringify(prompt));
  await redis.set(`prompt:${prompt.id}`, JSON.stringify(prompt));
}

export async function getSubmissionsByPrompt(promptId: string) {
  const data = await redis.get(`submissions:${promptId}`);
  return data ? JSON.parse(data) : [];
}

export async function saveSubmission(submission: any) {
  const prompt = await getCurrentPrompt();
  if (!prompt) return;

  const existing = await getSubmissionsByPrompt(prompt.id);
  existing.push(submission);
  await redis.set(`submissions:${prompt.id}`, JSON.stringify(existing));
}

export async function getSubmission(submissionId: string) {
  const prompt = await getCurrentPrompt();
  if (!prompt) return null;

  const submissions = await getSubmissionsByPrompt(prompt.id);
  return submissions.find((s: any) => s.id === submissionId) || null;
}

export async function hasUserSubmitted(userId: string, promptId: string) {
  const submissions = await getSubmissionsByPrompt(promptId);
  return submissions.some((s: any) => s.userId === userId);
}

export async function getVotes(submissionId: string) {
  const data = await redis.get(`votes:${submissionId}`);
  return data ? parseInt(data) : 0;
}

export async function setVotes(submissionId: string, votes: number) {
  await redis.set(`votes:${submissionId}`, votes.toString());
}

export async function incrementVote(submissionId: string) {
  const current = await getVotes(submissionId);
  const newCount = current + 1;
  await setVotes(submissionId, newCount);
  return newCount;
}

export async function saveAssembledSong(song: any) {
  const key = `song:week:${song.weekNumber}`;
  await redis.set(key, JSON.stringify(song));
  
  const allSongsData = await redis.get("songs:all");
  const allSongs = allSongsData ? JSON.parse(allSongsData) : [];
  if (!allSongs.includes(song.weekNumber)) {
    allSongs.push(song.weekNumber);
    await redis.set("songs:all", JSON.stringify(allSongs));
  }
}

export async function getAssembledSong(weekNumber: number) {
  const key = `song:week:${weekNumber}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function getAssembledSongs() {
  const allSongsData = await redis.get("songs:all");
  const weekNumbers = allSongsData ? JSON.parse(allSongsData) : [];
  
  const songs = [];
  for (const weekNum of weekNumbers) {
    const song = await getAssembledSong(weekNum);
    if (song) {
      songs.push(song);
    }
  }
  return songs;
}

export async function closePrompt(promptId: string) {
  const key = `prompt:${promptId}`;
  const data = await redis.get(key);
  if (data) {
    const prompt = JSON.parse(data);
    prompt.status = "closed";
    await redis.set(key, JSON.stringify(prompt));
    
    const currentData = await redis.get("prompt:current");
    if (currentData) {
      const current = JSON.parse(currentData);
      if (current.id === promptId) {
        current.status = "closed";
        await redis.set("prompt:current", JSON.stringify(current));
      }
    }
  }
}
