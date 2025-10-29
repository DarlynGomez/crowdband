import express from "express";
import {
  createServer,
  context,
  getServerPort,
  reddit,
} from "@devvit/web/server";
import { createPost } from "./core/post";
import { db } from "./core/db";
import { validateLyric, generateId } from "./core/validation";
import type { SubmitRequest, SubmitResponse } from "../shared/types/band";

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
router.post<any, SubmitResponse, SubmitRequest>(
  "/api/submit",
  async (req, res): Promise<void> => {
    try {
      const { text, type } = req.body;
      const { userId } = context;
      
      const username = await reddit.getCurrentUsername();

      // Validate
      const validation = validateLyric(text);
      if (!validation.valid) {
        res.status(400).json({ 
          success: false, 
          error: validation.error 
        });
        return;
      }

      // Get current prompt
      const prompt = await db.getCurrentPrompt();
      if (!prompt || prompt.status !== "open") {
        res.status(400).json({ 
          success: false, 
          error: "No active prompt" 
        });
        return;
      }

      // Check if user already submitted
      if (userId && await db.hasUserSubmitted(userId, prompt.id)) {
        res.status(400).json({
          success: false,
          error: "You've already submitted to this prompt"
        });
        return;
      }

      // Create submission
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

      res.json({ 
        success: true, 
        submission 
      });
    } catch (error) {
      console.error("Error submitting lyric:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to submit lyric" 
      });
    }
  }
);

// Get submissions for current prompt
router.get("/api/submissions", async (_req, res): Promise<void> => {
  try {
    const prompt = await db.getCurrentPrompt();
    if (!prompt) {
      res.json([]);
      return;
    }

    let submissions = await db.getSubmissionsByPrompt(prompt.id);

    // Add vote counts
    submissions = await Promise.all(
      submissions.map(async (sub) => ({
        ...sub,
        votes: await db.getVotes(sub.id),
      }))
    );

    // Sort by votes descending
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
    
    const submission = await db.getSubmission(submissionId);
    if (!submission) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    const newVoteCount = await db.incrementVote(submissionId);
    res.json({ votes: newVoteCount });
  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ error: "Failed to vote" });
  }
});

// Initialize first prompt (for testing)
router.post("/api/init-prompt", async (_req, res): Promise<void> => {
  try {
    const prompt = {
      id: generateId(),
      promptText: "Write a chorus line about starting something new",
      weekNumber: 1,
      createdAt: Date.now(),
      endsAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
      status: "open" as const,
    };

    await db.savePrompt(prompt);
    res.json({ success: true, prompt });
  } catch (error) {
    console.error("Error creating prompt:", error);
    res.status(500).json({ error: "Failed to create prompt" });
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
