import { 
  getCurrentPrompt, 
  getSubmissionsByPrompt, 
  getVotes,
  setVotes,
  saveSubmission,
  saveAssembledSong,
  getAssembledSong,
  closePrompt
} from './core/db';

/**
 * 🧪 TEST: Create fake submissions from different users
 */
export async function testCreateFakeSubmissions(req: any, res: any) {
  try {
    const prompt = await getCurrentPrompt();
    if (!prompt) {
      return res.status(404).json({ error: 'No active prompt' });
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
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        promptId: prompt.id,
        text: lyric.text,
        type: lyric.type,
        userId: user.userId,
        username: user.username,
        createdAt: Date.now(),
        votes: lyric.votes,
      };

      await saveSubmission(submission);
      await setVotes(submission.id, lyric.votes);
      createdSubmissions.push(submission);

      // Small delay to ensure unique IDs
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    res.json({
      success: true,
      message: `Created ${createdSubmissions.length} test submissions`,
      submissions: createdSubmissions,
    });
  } catch (error) {
    console.error('Error creating fake submissions:', error);
    res.status(500).json({ error: 'Failed to create test data' });
  }
}

/**
 * 🧪 TEST: End the current week and generate final song
 */
export async function testEndWeek(req: any, res: any) {
  try {
    const prompt = await getCurrentPrompt();
    if (!prompt) {
      return res.status(404).json({ error: 'No active prompt found' });
    }

    // Get all submissions for this prompt
    const submissions = await getSubmissionsByPrompt(prompt.id);

    if (submissions.length === 0) {
      return res.status(400).json({ 
        error: 'No submissions to process. Create test data first with /api/test/create-fake-submissions' 
      });
    }

    // Get vote counts for each submission
    const submissionsWithVotes = await Promise.all(
      submissions.map(async (sub: any) => {
        const votes = await getVotes(sub.id);
        return { ...sub, votes };
      })
    );

    // Sort by type and get top submissions
    const getTop = (type: string, count: number = 3) => {
      return submissionsWithVotes
        .filter((s: any) => s.type === type)
        .sort((a: any, b: any) => b.votes - a.votes)
        .slice(0, count);
    };

    const topVerses = getTop('verse', 3);
    const topChoruses = getTop('chorus', 3);
    const topBridges = getTop('bridge', 2);

    // Build the final song
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

    // Save the song
    await saveAssembledSong(finalSong);

    // Close the prompt
    await closePrompt(prompt.id);

    res.json({
      success: true,
      song: finalSong,
      message: `Week ${prompt.weekNumber} completed! Generated song with ${submissionsWithVotes.length} submissions.`
    });
  } catch (error) {
    console.error('Error ending week:', error);
    res.status(500).json({ error: 'Failed to end week' });
  }
}

/**
 * 🧪 TEST: Get final song for a specific week
 */
export async function testGetFinalSong(req: any, res: any) {
  try {
    const { weekNumber } = req.params;
    const song = await getAssembledSong(parseInt(weekNumber));
    
    if (!song) {
      return res.status(404).json({ error: `Song for week ${weekNumber} not found` });
    }

    res.json(song);
  } catch (error) {
    console.error('Error getting final song:', error);
    res.status(500).json({ error: 'Failed to get song' });
  }
}