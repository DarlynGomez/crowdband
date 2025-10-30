# Automated Weekly Song Assembly Workflow

## Overview
Every Friday at 11:59 PM (23:00 UTC), CrowdBand automatically:
1. Closes the current week's prompt
2. Gathers and ranks all submissions by votes
3. Assembles top submissions into song structure
4. Stores the completed song in Redis
5. (Future) Posts song to subreddit as a new post
6. (Future) Transitions to next week's prompt

## Cron Schedule
`0 23 * * 5` = Every Friday at 11:59 PM UTC

## Song Assembly Algorithm

### Structure
- **Verse 1**: Highest-voted verse submission
- **Chorus**: Highest-voted chorus (repeated 3x in song)
- **Verse 2**: Second highest verse (or repeat #1)
- **Bridge**: Highest-voted bridge

### Fallback Handling
- If no submissions for a section: "No [type] submitted"
- If only one verse: Use it for both verses
- Minimum viable song: 1 verse + 1 chorus

## Manual Trigger
Moderators can manually trigger assembly via subreddit menu:
- **Menu Item**: "Assemble This Week's Song"
- **Endpoint**: `/internal/menu/assemble-song`
- **Use Case**: Early week closure or testing

## Data Storage

### Assembled Songs
**Key**: `song:week:{weekNumber}`
**Value**: JSON with complete song data

### Week History
All past weeks remain queryable for:
- User statistics
- Best-of compilations  
- Year-end reviews

## Future Enhancements
1. Reddit post creation with song
2. Automatic week transitions
3. User notification system
4. Album art generation
5. Audio synthesis from lyrics
