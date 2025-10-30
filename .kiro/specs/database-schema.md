# CrowdBand Database Schema

## Redis Key Structure

### Prompts
Key: `prompt:current`
Value: JSON object with id, promptText, weekNumber, weekTheme, status, endsAt

### Submissions
Key: `submissions:{promptId}`
Value: Array of JSON objects with id, text, username, type, votes, createdAt

### Votes
Key: `votes:{userId}:{submissionId}`
Value: 1 or -1

### User Submissions Tracking
Key: `user:submitted:{userId}:{promptId}`
Value: boolean (exists = submitted)

## Validation Rules
- Submissions max 280 characters
- One submission per user per prompt
- Vote values must be 1 or -1
- Usernames must be valid Reddit usernames
