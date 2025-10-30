# CrowdBand: The Band That Never Was

**A collaborative songwriting game where Reddit communities create original songs together, one lyric at a time.**

CrowdBand transforms Reddit into a virtual recording studio where users collaborate to write songs through weekly creative challenges. Each week presents a thematic prompt, and the community contributes verses, choruses, and bridges that get voted on by the community to create the best collaborative songs.

## What Makes CrowdBand Unique

🎵 **Collaborative Songwriting**: Unlike traditional music games, CrowdBand focuses on creative writing, allowing anyone to contribute meaningful lyrics regardless of musical ability or experience.

⏰ **Weekly Creative Challenges**: Each week features a new thematic prompt (starting with "🌙 3 AM Thoughts") that guides the creative direction and keeps the community engaged with fresh inspiration.

🗳️ **Democratic Curation**: The community votes on submissions, ensuring the best lyrics rise to the top through collective judgment rather than algorithmic sorting. Users can toggle their votes by clicking again.

🎭 **Structured Song Sections**: Users can contribute different song parts (verse, chorus, bridge) with distinct visual styling and character limits, creating natural song structure and variety.

🏆 **One Submission Per Week**: Each user gets one lyric submission per weekly challenge, making every contribution count and encouraging thoughtful creativity.

📱 **Mobile-First Design**: Optimized for Reddit's mobile audience with touch-friendly controls and a sleek, music-inspired interface featuring cyberpunk aesthetics with neon gradients and floating animations.

🎼 **Song Assembly & Archive**: The game includes functionality to automatically assemble the top-voted lyrics into complete song structures, with an archive system to browse all completed collaborative works.

📀 **Dual Interface**: Navigate between the active Studio for current week participation and the Archive to explore the growing collection of community-created songs.

## How to Play

### Getting Started
1. **Launch the App**: Click "Enter Studio" from the cyberpunk-styled splash screen featuring floating logo animations, neon waveforms, and the iconic "THE BAND THAT NEVER WAS" title
2. **Start the First Week**: If no challenge is active, click "Start Week 1" to initialize the first creative prompt: "Write a verse about the weird clarity that hits you in the middle of the night" with the theme "🌙 3 AM Thoughts"
3. **Navigate the Interface**: Use the bottom navigation to switch between:
   - 🎤 **Studio**: Active songwriting workspace for the current week
   - 📀 **Archive**: Browse completed songs from previous weeks
4. **Check the Weekly Challenge**: View the current week's creative prompt and theme displayed in the gradient header banner with an info button (ⓘ) for detailed instructions
5. **Monitor the Countdown**: Each challenge runs for one week - watch the real-time countdown timer showing hours, minutes, and seconds remaining in cyan neon styling

### Writing and Submitting Lyrics
1. **Craft Your Lyric**: Type your contribution in the dark-themed text area with neon border effects (must be 10-120 characters)
2. **Choose Your Song Section**: Select what type of lyric you're contributing using the gradient-styled buttons:
   - 🎤 **Verse**: Storytelling sections that advance the narrative and set scenes (purple styling)
   - 🎵 **Chorus**: Catchy, memorable sections that capture the main theme or hook (cyan styling, default selection)
   - ⭐ **Bridge**: Unique sections that provide contrast, resolution, or a different perspective (orange styling)
3. **Watch Your Character Count**: The counter shows your progress toward the 120-character limit (displayed as "characters/120")
4. **Submit Your Creation**: Click the glowing "Submit Your Creation" button to add your lyric to the community pool (button is disabled until you have at least 10 characters)
5. **One Shot Per Week**: Each user can only submit one lyric per weekly challenge, so make it count! The system prevents multiple submissions per user per prompt.

### Voting and Community Engagement
1. **View Your Submission**: After submitting, your lyric appears in a special "✨ YOUR SUBMISSION" section with a static vote count display
2. **Browse Community Submissions**: Scroll through the "🔥 TOP LINES - VOTE & INSPIRE" section with color-coded submission cards
3. **Vote for Your Favorites**: Click the neon vote badge (↑) next to lyrics that resonate with you - you must be logged in to vote
4. **Toggle Your Votes**: Click the vote button again to remove your vote - voted submissions show a filled upvote arrow (⬆) with cyan highlighting
5. **Watch the Rankings**: Submissions automatically sort by vote count, with the most popular rising to the top
6. **Visual Feedback**: Each lyric type has distinct styling - purple for verses, cyan for choruses, orange for bridges
7. **Real-Time Updates**: Vote counts and new submissions appear instantly without page refreshes

### Song Assembly & Archive System
The game includes comprehensive functionality for creating and preserving collaborative works:
- **Automatic Assembly**: Top-voted lyrics are assembled into complete song structures using **Verse-Chorus-Verse-Chorus-Bridge-Chorus** format
- **Song Titles**: Generated from week themes (e.g., "Week 1: 🌙 3 AM Thoughts")
- **Credit System**: Shows original authors and vote counts for each section
- **Archive Navigation**: Browse completed songs in a visual grid layout with album-style artwork placeholders
- **Song History**: All completed collaborative works are permanently stored and accessible
- **API Integration**: Backend endpoints handle song assembly and archive retrieval

### Weekly Challenge Cycle
1. **New Prompt Launch**: Fresh creative challenges begin with unique themes and prompts (starting with "🌙 3 AM Thoughts")
2. **Submission Period**: Community members have one week to contribute their best lyric and vote on others
3. **Real-Time Updates**: All submissions and votes sync instantly across all users using Reddit's Redis backend
4. **Community Curation**: The best lyrics rise through democratic voting throughout the week
5. **Song Assembly**: At week's end, top lyrics are automatically assembled into complete collaborative songs
6. **Archive Addition**: Completed songs are added to the permanent archive for future browsing

### Content Guidelines
- **Family-Friendly**: Built-in profanity filtering keeps content appropriate for all ages (filters common profanity including damn, hell, crap, shit, fuck, ass, bitch)
- **Original Content**: No URLs or external links allowed - keep it focused on original lyrics
- **Quality Over Quantity**: With one submission per week, focus on crafting your best work
- **Character Limits**: Lyrics must be between 10-120 characters to ensure quality and readability
- **Authentication Required**: Must be logged into Reddit to submit lyrics and vote

## Game Features

### Core Gameplay
- **Weekly Thematic Prompts**: Each week features a unique creative challenge with specific themes and emotional directions
- **Three Lyric Types**: Contribute verses (storytelling), choruses (hooks), or bridges (contrast) with distinct visual styling
- **Democratic Voting System**: Community-driven curation where the best lyrics rise through collective judgment
- **One Submission Rule**: Each user gets one meaningful contribution per week, encouraging thoughtful creativity
- **Real-Time Leaderboard**: Submissions automatically sort by vote count with instant updates
- **Dual Interface Navigation**: Switch between active Studio workspace and Archive browsing with bottom navigation tabs

### Technical Features
- **Instant Synchronization**: All submissions and votes update in real-time across all users
- **Vote Toggle System**: Users can vote and unvote with visual feedback and persistent state tracking
- **Content Validation**: Automatic filtering for inappropriate content, URLs, and length requirements
- **User Session Management**: Tracks submissions and voting history per user per prompt
- **Mobile-Optimized Interface**: Touch-friendly controls designed for Reddit's mobile-first audience

### Visual Design
- **Cyberpunk Aesthetic**: Dark theme with neon gradients, glowing effects, and futuristic styling
- **Animated Splash Screen**: Floating logo with pulsing backgrounds, animated waveforms, and "THE BAND THAT NEVER WAS" title
- **Color-Coded Sections**: Purple for verses, cyan for choruses, orange for bridges
- **Live Countdown Timer**: Real-time display of remaining challenge time in neon styling
- **Success Notifications**: Slide-in toast confirmations for user actions
- **Archive Interface**: Visual grid layout with album-style artwork placeholders and genre badges
- **Bottom Navigation**: Fixed navigation bar with Studio and Archive tabs featuring icon and label styling

## Architecture & Implementation

### Backend Infrastructure
- **Express.js Server**: RESTful API endpoints handling all game logic and data operations
- **Redis Database**: Persistent storage for prompts, submissions, votes, and user tracking using Reddit's infrastructure
- **Devvit Integration**: Seamless Reddit authentication and context management
- **Content Validation**: Server-side filtering for profanity, URLs, and character limits
- **Vote Management**: Toggle-based voting system with user state persistence

### Frontend Technology
- **React 19**: Modern React with hooks for state management and real-time updates
- **TypeScript**: Full type safety across client-server communication
- **Vite Build System**: Fast development and optimized production builds
- **CSS3 Animations**: Custom keyframe animations for floating elements and transitions
- **Responsive Design**: Mobile-first approach with touch-optimized controls

### API Endpoints
- `GET /api/prompt`: Retrieve current weekly challenge with theme and countdown
- `POST /api/submit`: Submit a new lyric with type validation (requires authentication)
- `GET /api/submissions`: Get all submissions with vote counts and user voting state
- `POST /api/vote/:submissionId`: Toggle vote on a submission (requires authentication)
- `POST /api/init-prompt`: Initialize the first week's challenge ("🌙 3 AM Thoughts")
- `GET /api/assemble-song`: Generate complete song from top-voted lyrics in structured format
- `GET /api/songs`: Retrieve all completed songs for archive browsing
- `GET /api/songs/:weekNumber`: Get specific week's assembled song
- `POST /internal/on-app-install`: Creates initial post when app is installed
- `POST /internal/menu/post-create`: Creates new game post from Reddit menu
- `POST /internal/jobs/assemble-weekly-song`: Automated weekly song assembly (scheduled)
- `POST /internal/jobs/start-next-week`: Automated next week initialization (scheduled)

### Data Models
- **SongPrompt**: Weekly challenges with themes, prompts, and timing
- **LyricSubmission**: User contributions with type, text, and metadata
- **Vote Tracking**: User-submission relationships for toggle functionality
- **AssembledSong**: Complete song structures with title, theme, prompt, and lyric sections
- **Song Archive**: Persistent storage of all completed collaborative works with week indexing

## Development Setup

### Prerequisites
- Node.js 22.2.0 or higher
- Reddit Developer Account
- Devvit CLI installed

### Commands
- `npm run dev`: Starts development server with live Reddit integration testing
- `npm run build`: Builds both client and server projects for production
- `npm run deploy`: Uploads new version to Reddit's servers
- `npm run launch`: Publishes app for Reddit review and approval
- `npm run login`: Authenticates your CLI with Reddit
- `npm run type-check`: Runs TypeScript compilation checks

### Project Structure
- `src/client/`: React frontend with cyberpunk-styled game interface
  - `main.tsx`: Entry point with React root mounting and CSS imports
  - `App.tsx`: Main game component with complete state management, dual-interface navigation (Studio/Archive), and API integration
  - `style.css`: Complete cyberpunk styling with neon gradients, animations, archive grid layout, and responsive design
  - `index.html`: HTML template with root container and module script loading
  - `vite.config.ts`: Vite build configuration for React with output to dist/client
- `src/server/`: Express backend with Reddit API integration and Redis data storage
  - `index.ts`: Main server with all API endpoints, middleware, and song assembly logic
  - `core/db.ts`: Redis database operations for prompts, submissions, votes, and user tracking
  - `core/validation.ts`: Content validation, profanity filtering, URL blocking, and ID generation
  - `core/voting.ts`: User voting state management with toggle functionality
  - `core/post.ts`: Reddit post creation with custom splash screen configuration
- `src/shared/`: Shared TypeScript types and interfaces for API communication
  - `types/band.ts`: Core game types (SongPrompt, LyricSubmission, FinalSong, SubmitRequest)
  - `types/api.ts`: API response types for client-server communication
- `assets/`: Game logos and visual assets (logo.png, default-splash.png, default-icon.png)

### Development Workflow
1. **Local Development**: Run `npm run dev` to start concurrent client/server builds with live reloading
2. **Reddit Testing**: Devvit automatically creates test subreddit and provides playtest URL
3. **Live Integration**: All backend features work through Reddit's infrastructure during development
4. **Build & Deploy**: Use `npm run build && npm run deploy` to upload to Reddit servers
5. **Publishing**: Run `npm run launch` to submit for Reddit review and approval
