import { redis } from "@devvit/web/server";
import express from "express";
import {
  createServer,
  context,
  getServerPort,
  reddit,
} from "@devvit/web/server";

import { createPost } from "./core/post";
import * as db from "./core/db";
import { validateLyric, generateId } from "./core/validation";
import { hasUserVoted, recordVote, removeVote } from "./core/voting";
import * as badges from "./core/badges";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();

// Get current prompt
router.get("/api/prompt", async (_req, res): Promise<void> => {
  try {
    const prompt = await db.getCurrentPrompt();
    
    if (!prompt) {
      res.json({ 
        error: 'No active prompt',
        message: 'Check back soon for the next challenge!' 
      });
      return;
    }

    res.json(prompt);
  } catch (error) {
    console.error("Error fetching prompt:", error);
    res.status(500).json({ error: "Failed to fetch prompt" });
  }
});

// Submit lyric
router.post("/api/submit", async (req, res): Promise<void> => {
  try {
    const { text, type } = req.body;
    const { userId } = context;
    
    const username = await reddit.getCurrentUsername();

    const validation = validateLyric(text);
    if (!validation.valid) {
      res.status(400).json({ 
        success: false, 
        error: validation.error 
      });
      return;
    }

    const prompt = await db.getCurrentPrompt();
    if (!prompt || prompt.status !== "open") {
      res.status(400).json({ 
        success: false, 
        error: "No active prompt" 
      });
      return;
    }

    if (userId && await db.hasUserSubmitted(userId, prompt.id)) {
      res.status(400).json({
        success: false,
        error: "You've already submitted to this prompt"
      });
      return;
    }

    const submission = {
      id: generateId(),
      userId: userId || "anonymous",
      username: username || "Anonymous",
      text: text.trim(),
      type: type || "verse",
      promptId: prompt.id,
      votes: 0,
      createdAt: Date.now(),
      flagged: false,
    };

    await db.saveSubmission(submission);

    // UPDATE USER STATS
    if (userId) {
      await badges.trackUser(userId);
      let stats = await badges.getUserStats(userId);
      
      if (!stats) {
        stats = await badges.initializeUserStats(userId, username || "Anonymous");
      }
      
      stats.totalSubmissions++;
      
      // Check if this is a new week for the user
      const userWeeksData = await redis.get(`user:weeks:${userId}`);
      const userWeeks: number[] = userWeeksData ? JSON.parse(userWeeksData) : [];
      
      if (!userWeeks.includes(prompt.weekNumber)) {
        userWeeks.push(prompt.weekNumber);
        stats.weeksParticipated++;
        await redis.set(`user:weeks:${userId}`, JSON.stringify(userWeeks));
        
        // Check for consecutive weeks
        userWeeks.sort((a, b) => a - b);
        let consecutive = 1;
        let maxConsecutive = 1;
        for (let i = 1; i < userWeeks.length; i++) {
          if (userWeeks[i] === userWeeks[i-1] + 1) {
            consecutive++;
            maxConsecutive = Math.max(maxConsecutive, consecutive);
          } else {
            consecutive = 1;
          }
        }
        stats.consecutiveWeeks = maxConsecutive;
      }
      
      await badges.saveUserStats(stats);
      const newBadges = await badges.checkAndAwardBadges(userId);
      
      res.json({ 
        success: true, 
        submission,
        newBadges: newBadges.length > 0 ? newBadges : undefined
      });
    } else {
      res.json({ 
        success: true, 
        submission 
      });
    }
  } catch (error) {
    console.error("Error submitting lyric:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit lyric" 
    });
  }
});

// Get submissions
router.get("/api/submissions", async (_req, res): Promise<void> => {
  try {
    const prompt = await db.getCurrentPrompt();
    const { userId } = context;
    
    if (!prompt) {
      res.json([]);
      return;
    }

    let submissions = await db.getSubmissionsByPrompt(prompt.id);

    submissions = await Promise.all(
      submissions.map(async (sub) => ({
        ...sub,
        votes: await db.getVotes(sub.id),
        userVoted: userId ? await hasUserVoted(userId, sub.id) : false,
      }))
    );

    submissions.sort((a, b) => b.votes - a.votes);

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Vote on submission
router.post("/api/vote/:submissionId", async (req, res): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { userId } = context;
    
    if (!userId) {
      res.status(401).json({ error: "Must be logged in to vote" });
      return;
    }

    const submission = await db.getSubmission(submissionId);
    if (!submission) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    const alreadyVoted = await hasUserVoted(userId, submissionId);
    
    if (alreadyVoted) {
      await removeVote(userId, submissionId);
      const currentVotes = await db.getVotes(submissionId);
      const newVotes = Math.max(0, currentVotes - 1);
      await db.setVotes(submissionId, newVotes);
      res.json({ votes: newVotes, userVoted: false });
    } else {
      await recordVote(userId, submissionId);
      const newVoteCount = await db.incrementVote(submissionId);
      res.json({ votes: newVoteCount, userVoted: true });
    }
  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ error: "Failed to vote" });
  }
});

// Initialize with Week 1: 3 AM Thoughts
router.post("/api/init-prompt", async (_req, res): Promise<void> => {
  try {
    const prompt = {
      id: generateId(),
      promptText: "Write a verse about the weird clarity that hits you in the middle of the night",
      weekNumber: 1,
      weekTheme: "🌙 3 AM Thoughts",
      createdAt: Date.now(),
      endsAt: Date.now() + 5 * 60 * 1000, // 🧪 TEST: 5 minutes
      status: "open" as const,
    };

    await db.savePrompt(prompt);
    res.json({ success: true, prompt });
  } catch (error) {
    console.error("Error creating prompt:", error);
    res.status(500).json({ error: "Failed to create prompt" });
  }
});

// Get user profile
router.get("/api/user/:userId", async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const stats = await badges.getUserStats(userId);
    
    if (!stats) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    
    // Get badge details
    const userBadges = stats.badges.map(ub => {
      const badge = badges.BADGES.find(b => b.id === ub.badgeId);
      return badge ? { ...badge, earnedAt: ub.earnedAt } : null;
    }).filter(b => b !== null);
    
    res.json({ ...stats, badgeDetails: userBadges });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Get leaderboard
router.get("/api/leaderboard", async (_req, res): Promise<void> => {
  try {
    const leaderboard = await badges.getLeaderboard(10);
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get all badges
router.get("/api/badges", async (_req, res): Promise<void> => {
  try {
    res.json(badges.BADGES);
  } catch (error) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

// Get assembled songs (for archive)
router.get("/api/songs", async (_req, res): Promise<void> => {
  try {
    const songs = await db.getAssembledSongs();
    res.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

// Get specific week's song
router.get("/api/songs/:weekNumber", async (req, res): Promise<void> => {
  try {
    const weekNumber = parseInt(req.params.weekNumber);
    const song = await db.getAssembledSong(weekNumber);
    
    if (!song) {
      res.status(404).json({ error: "Song not found" });
      return;
    }
    
    res.json(song);
  } catch (error) {
    console.error("Error fetching song:", error);
    res.status(500).json({ error: "Failed to fetch song" });
  }
});

// 🧪 TEST ENDPOINTS - Remove before production

// TEST: Clear current prompt
router.post('/api/test/clear-all', async (req, res) => {
  try {
    // Delete all the main keys
    await redis.del('prompt:current');
    
    res.json({
      success: true,
      message: '🧹 All data cleared! Create a new prompt with /api/init-prompt'
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// TEST: Create fake submissions
router.post('/api/test/create-fake-submissions', async (req, res) => {
  try {
    const prompt = await db.getCurrentPrompt();
    if (!prompt) {
      return res.status(404).json({ error: 'No active prompt. Run /api/init-prompt first' });
    }

    const fakeUsers = [
      { userId: 'user_test_001', username: 'LyricMaster' },
      { userId: 'user_test_002', username: 'BeatsPoet' },
      { userId: 'user_test_003', username: 'ChorusKing' },
      { userId: 'user_test_004', username: 'VerseLord' },
      { userId: 'user_test_005', username: 'RhymeQueen' },
    ];

    const fakeLyrics = [
      { text: 'Late night thoughts racing through my mind', type: 'verse', votes: 15 },
      { text: 'City lights fade as the moon takes flight', type: 'verse', votes: 12 },
      { text: '3 AM and I\'m wide awake again', type: 'chorus', votes: 25 },
      { text: 'Dreams and reality start to blend', type: 'chorus', votes: 18 },
      { text: 'In the silence I find my peace', type: 'bridge', votes: 20 },
      { text: 'Coffee cold but my heart still beats', type: 'verse', votes: 8 },
      { text: 'Lost in thoughts that never sleep', type: 'bridge', votes: 14 },
      { text: 'Neon signs guide me home tonight', type: 'verse', votes: 22 },
      { text: 'Can\'t escape these midnight feels', type: 'chorus', votes: 30 },
      { text: 'Time stands still at 3 AM', type: 'bridge', votes: 17 },
    ];

    const createdSubmissions = [];

    for (let i = 0; i < fakeLyrics.length; i++) {
      const user = fakeUsers[i % fakeUsers.length];
      const lyric = fakeLyrics[i];

      const submission = {
        id: generateId(),
        promptId: prompt.id,
        text: lyric.text,
        type: lyric.type,
        userId: user.userId,
        username: user.username,
        createdAt: Date.now(),
        votes: lyric.votes,
      };

      await db.saveSubmission(submission);
      await db.setVotes(submission.id, lyric.votes);
      createdSubmissions.push(submission);

      // Small delay to ensure unique IDs
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    res.json({
      success: true,
      message: `✅ Created ${createdSubmissions.length} test submissions`,
      submissions: createdSubmissions,
    });
  } catch (error) {
    console.error('Error creating fake submissions:', error);
    res.status(500).json({ error: 'Failed to create test data' });
  }
});

// TEST: End week and generate final song
router.post('/api/test/end-week', async (req, res) => {
  try {
    const prompt = await db.getCurrentPrompt();
    if (!prompt) {
      return res.status(404).json({ error: 'No active prompt found' });
    }

    const submissions = await db.getSubmissionsByPrompt(prompt.id);

    if (submissions.length === 0) {
      return res.status(400).json({ 
        error: 'No submissions to process. Create test data first with /api/test/create-fake-submissions' 
      });
    }

    const submissionsWithVotes = await Promise.all(
      submissions.map(async (sub: any) => {
        const votes = await db.getVotes(sub.id);
        return { ...sub, votes };
      })
    );

    const getTop = (type: string, count: number = 3) => {
      return submissionsWithVotes
        .filter((s: any) => s.type === type)
        .sort((a: any, b: any) => b.votes - a.votes)
        .slice(0, count);
    };

    const topVerses = getTop('verse', 3);
    const topChoruses = getTop('chorus', 3);
    const topBridges = getTop('bridge', 2);

    const finalSong = {
      weekNumber: prompt.weekNumber,
      theme: prompt.weekTheme || '3 AM Thoughts',
      genre: 'Lofi Hip Hop',
      lyrics: {
        verses: topVerses,
        choruses: topChoruses,
        bridges: topBridges,
      },
      contributors: Array.from(new Set(submissionsWithVotes.map((s: any) => s.username))),
      totalSubmissions: submissionsWithVotes.length,
      totalVotes: submissionsWithVotes.reduce((sum: number, s: any) => sum + s.votes, 0),
      completedAt: Date.now(),
    };

    await db.saveAssembledSong(finalSong);
    await db.closePrompt(prompt.id);

    res.json({
      success: true,
      song: finalSong,
      message: `🎵 Week ${prompt.weekNumber} completed! Generated song with ${submissionsWithVotes.length} submissions.`
    });
  } catch (error) {
    console.error('Error ending week:', error);
    res.status(500).json({ error: 'Failed to end week' });
  }
});

// TEST: Get final song
router.get('/api/test/song/:weekNumber', async (req, res) => {
  try {
    const { weekNumber } = req.params;
    const song = await db.getAssembledSong(parseInt(weekNumber));
    
    if (!song) {
      return res.status(404).json({ error: `Song for week ${weekNumber} not found` });
    }

    res.json(song);
  } catch (error) {
    console.error('Error getting final song:', error);
    res.status(500).json({ error: 'Failed to get song' });
  }
});

// Get current user's profile
router.get("/api/user/me", async (_req, res): Promise<void> => {
  try {
    const { userId } = context;
    const username = await reddit.getCurrentUsername();
    
    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }
    
    let stats = await badges.getUserStats(userId);
    
    if (!stats) {
      stats = await badges.initializeUserStats(userId, username || "Anonymous");
    }
    
    // Get badge details
    const userBadges = stats.badges.map(ub => {
      const badge = badges.BADGES.find(b => b.id === ub.badgeId);
      return badge ? { ...badge, earnedAt: ub.earnedAt } : null;
    }).filter(b => b !== null);
    
    res.json({ ...stats, badgeDetails: userBadges });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// App install handler
router.post("/internal/on-app-install", async (_req, res): Promise<void> => {
  try {
    const post = await createPost();
    res.json({
      status: "success",
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: "error",
      message: "Failed to create post",
    });
  }
});

// Menu handler for creating posts
router.post("/internal/menu/post-create", async (_req, res): Promise<void> => {
  try {
    const post = await createPost();
    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: "error",
      message: "Failed to create post",
    });
  }
});

app.use(router);

const server = createServer(app);
server.on("error", (err) => console.error(`server error; ${err.stack}`));
server.listen(getServerPort());