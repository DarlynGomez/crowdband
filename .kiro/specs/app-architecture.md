# CrowdBand App Architecture Specification

## Overview
Build a Reddit community music collaboration app where users submit lyrics/melodies weekly and vote on submissions to crowdsource a song.

## Technical Requirements
- React frontend with TypeScript
- Express.js backend server
- Redis database for persistence
- Reddit Devvit Web platform

## Core Features
1. Weekly prompt system with countdown timer
2. User submission system (lyrics/melodies)
3. Voting system (upvote/downvote)
4. Leaderboard showing top submissions
5. Band member profiles

## Database Schema
- Prompts: id, text, week, theme, status, endsAt
- Submissions: id, text, username, type, votes, promptId
- Votes: userId, submissionId, value

## API Endpoints
- GET /api/prompt - Current week's prompt
- GET /api/submissions - All submissions for current prompt
- POST /api/submit - Submit new entry
- POST /api/vote - Vote on submission
