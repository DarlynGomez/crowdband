# 🎵 CrowdBand — The Band That Never Was

> A weekly, community-powered music game built for Reddit

[![Reddit Developer Platform](https://img.shields.io/badge/Reddit-Devvit-FF4500?logo=reddit)](https://developers.reddit.com/)
[![Hackathon](https://img.shields.io/badge/Hackathon-Reddit%20%2B%20Kiro-blue)](https://communitygames2025.devpost.com/)
[![License](https://img.shields.io/badge/License-BSD--3--Clause-green)](LICENSE)

## 🎸 What is CrowdBand?

CrowdBand turns Reddit communities into a collaborative songwriting studio. Each week a new theme drops (like *“🌙 3 AM Thoughts – Lofi Hip Hop”*). People submit short lyrics—verses, choruses, or bridges—then vote for their favorites. When the week wraps up, the top-voted lines are automatically stitched together into a full song and saved forever in the Archive.

**No music skills needed. Just creativity and good vibes.**

## ✨ Features

### 🎤 Studio

* Submit verse, chorus, or bridge lines (max 120 chars)
* One-tap voting
* Your own submissions are highlighted
* Live countdown for the weekly deadline
* Clean, themed UI with custom splash screens

### 🏆 Leaderboard

* Top contributors ranked by total votes
* Medal system (gold/silver/bronze)
* User stats + profile previews
* Earn recognition across the community

### 📀 Archive

* Browse every finished weekly song
* View full lyrics and their authors
* Vote counts for each line
* Contributor lists for each week

### 👤 Profile

* Personal stats: submissions, votes, active weeks
* Badge collection + unlocks
* Streak tracking
* Mini leaderboard card

### 🏅 Badges

* Milestone-based rewards
* Bronze → Diamond tiers
* Locked badges show requirements
* Real-time badge unlock popups

## 🎮 How to Play

1. **Enter the Studio** to see this week’s theme
2. **Write a line** inspired by the theme
3. **Vote** on other submissions
4. **Let the system assemble** the top lines into a song
5. **Check the Archive** and celebrate the results

## 🛠️ Tech Stack

* **Platform:** Reddit Devvit
* **Frontend:** React + TypeScript
* **Styling:** Custom CSS (Space Grotesk)
* **Backend:** Express.js + Devvit Server APIs
* **Database:** Redis (Devvit KVStore)
* **Deployment:** Devvit CLI

## 📁 Project Structure

```
crowdband/
├── src/
│   ├── client/
│   │   ├── App.tsx
│   │   ├── style.css
│   │   └── main.tsx
│   └── server/
│       ├── index.ts
│       └── core/
│           ├── db.ts
│           ├── voting.ts
│           ├── badges.ts
│           └── validation.ts
├── devvit.json
├── package.json
└── README.md
```

## 🚀 Installation & Setup

### Requirements

* Node.js 18+
* Reddit Developer Account
* Devvit CLI

### Steps

```bash
git clone https://github.com/yourusername/crowdband.git
cd crowdband
npm install
devvit login
npm run dev
```

To deploy:

```bash
npm run deploy
devvit publish
```

## 🎯 Community Game Mechanics

### Asynchronous Collaboration

* Submit and vote anytime during the week
* Works across time zones
* Fully asynchronous—no live sessions needed

### Democratic Voting

* Every vote counts
* Top lines are chosen by the community
* Transparent and fair ranking

### Collective Creation

* Finished songs belong to everyone
* Contributors are always credited
* Creates lasting community artifacts

### Engagement Loops

* Badges reward consistency
* Leaderboards spark friendly competition
* New weekly themes keep things fresh

## 🏆 Why It's Perfect for Reddit

1. Built entirely around community input
2. Encourages creative expression
3. Easy for anyone to join in
4. Produces unique, community-owned artifacts
5. Establishes recurring weekly traditions

## 📊 Database Schema

### Prompt

```ts
{
  id: string
  promptText: string
  weekNumber: number
  weekTheme: string
  status: 'open' | 'closed'
  endsAt: number
}
```

### Submission

```ts
{
  id: string
  userId: string
  username: string
  text: string
  type: 'verse' | 'chorus' | 'bridge'
  promptId: string
  votes: number
  createdAt: number
}
```

### Assembled Song

```ts
{
  weekNumber: number
  theme: string
  genre: string
  lyrics: {
    verses: Submission[]
    choruses: Submission[]
    bridges: Submission[]
  }
  contributors: string[]
  totalSubmissions: number
  totalVotes: number
  completedAt: number
}
```

## 🎨 Design Philosophy

* Clean, modern visual style
* Mobile-first layout with bottom nav
* Clear visual hierarchy
* Instant feedback on actions
* High contrast and readable text

## 🔮 Coming Soon

* [ ] AI-generated music from lyrics (Kiro)
* [ ] Seasonal challenges and tournaments
* [ ] Genre voting
* [ ] Co-writing features
* [ ] Export songs as images/PDF
* [ ] Integration with music subreddits
* [ ] Customizable profiles
* [ ] Advanced badge tiers
* [ ] Song remixing

## 📜 License

Licensed under the BSD-3-Clause License — see [LICENSE](LICENSE).

## 🤝 Contributing

This started as a hackathon project, but contributions are welcome. PRs and issues appreciated.

## 👨‍💻 Author

Built for the **Reddit + Kiro Community Games Challenge (Oct 2025)**.

## 🙏 Acknowledgments

* The Reddit Developer Platform team
* Kiro for AI-powered dev tooling
* The Reddit communities that inspired this
* Future CrowdBand contributors and players

---

**Made with ❤️ for Reddit communities**
*“The best band is the one we build together.”*

---

