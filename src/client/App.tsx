import React, { useState, useEffect, useCallback } from 'react';
import './style.css';

interface Prompt {
  id: string;
  promptText: string;
  weekNumber: number;
  weekTheme?: string;
  status: string;
  endsAt: number;
}

interface Submission {
  id: string;
  text: string;
  username: string;
  type: string;
  votes: number;
  userVoted?: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'special';
  requirement: string;
  earnedAt?: number;
}

interface UserStats {
  userId: string;
  username: string;
  totalSubmissions: number;
  totalVotes: number;
  topVotedSubmissions: number;
  weeksParticipated: number;
  consecutiveWeeks: number;
  badges: any[];
  badgeDetails?: Badge[];
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  totalSubmissions: number;
  totalVotes: number;
  badges: any[];
}

interface AssembledSong {
  weekNumber: number;
  theme: string;
  genre: string;
  lyrics: {
    verses: Submission[];
    choruses: Submission[];
    bridges: Submission[];
  };
  contributors: string[];
  totalSubmissions: number;
  totalVotes: number;
  completedAt: number;
}

function App() {
  const [screen, setScreen] = useState<'splash' | 'main'>('splash');
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userSubmission, setUserSubmission] = useState<Submission | null>(null);
  const [, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [type, setType] = useState('chorus');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentTab, setCurrentTab] = useState<'studio' | 'archive' | 'leaderboard' | 'profile'>('studio');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [newBadgeAlert, setNewBadgeAlert] = useState<Badge | null>(null);
  const [assembledSongs, setAssembledSongs] = useState<AssembledSong[]>([]);
  const [showSongModal, setShowSongModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<AssembledSong | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [promptRes, subsRes] = await Promise.all([
        fetch('/api/prompt'),
        fetch('/api/submissions')
      ]);

      const promptData = await promptRes.json();
      const subsData = await subsRes.json();

      if (!promptData.error) {
        setPrompt(promptData);
      }

      const userSub = subsData.find((s: Submission) => s.username !== 'Anonymous');
      setUserSubmission(userSub || null);

      setSubmissions(subsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/me`);
      if (res.ok) {
        const data = await res.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  }, []);

  const loadBadges = useCallback(async () => {
    try {
      const res = await fetch('/api/badges');
      const data = await res.json();
      setAllBadges(data);
    } catch (error) {
      console.error('Failed to load badges:', error);
    }
  }, []);

  const loadAssembledSongs = useCallback(async () => {
    try {
      const res = await fetch('/api/songs');
      const data = await res.json();
      console.log('Assembled songs:', data);
      setAssembledSongs(data);
    } catch (error) {
      console.error('Failed to load songs:', error);
    }
  }, []);

  useEffect(() => {
    if (screen === 'main') {
      loadData();
      loadUserStats();
      loadBadges();
    }
  }, [screen, loadData, loadUserStats, loadBadges]);

  useEffect(() => {
    if (currentTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [currentTab, loadLeaderboard]);

  useEffect(() => {
    if (currentTab === 'profile') {
      loadUserStats();
    }
  }, [currentTab, loadUserStats]);

  useEffect(() => {
    if (currentTab === 'archive') {
      loadAssembledSongs();
    }
  }, [currentTab, loadAssembledSongs]);

  useEffect(() => {
    if (prompt) {
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = prompt.endsAt - now;
        if (diff <= 0) {
          setTimeLeft('00:00:00');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [prompt]);

  useEffect(() => {
    if (prompt && timeLeft === '00:00:00' && prompt.status === 'open') {
      const assembleSong = async () => {
        try {
          await fetch('/api/test/end-week', { method: 'POST' });
          await loadData();
          await loadAssembledSongs();
        } catch (error) {
          console.error('Failed to assemble song:', error);
        }
      };
      assembleSong();
    }
  }, [timeLeft, prompt, loadData, loadAssembledSongs]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), type }),
      });

      const data = await res.json();

      if (data.success) {
        setText('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        if (data.newBadges && data.newBadges.length > 0) {
          const newBadge = allBadges.find(b => b.id === data.newBadges[0]);
          if (newBadge) {
            setNewBadgeAlert(newBadge);
            setTimeout(() => setNewBadgeAlert(null), 5000);
          }
        }
        
        await loadData();
        await loadUserStats();
      } else {
        alert(data.error || 'Failed to submit');
      }
    } catch (error) {
      alert('Failed to submit lyric');
    } finally {
      setSubmitting(false);
    }
  }, [text, type, submitting, loadData, loadUserStats, allBadges]);

  const handleVote = useCallback(async (submissionId: string) => {
    try {
      await fetch(`/api/vote/${submissionId}`, { method: 'POST' });
      await loadData();
    } catch (error) {
      console.error('Failed to vote');
    }
  }, [loadData]);

  const openModal = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowInfo(true);
  }, []);

  const closeModal = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowInfo(false);
  }, []);

  const viewSong = (song: AssembledSong) => {
    setSelectedSong(song);
    setShowSongModal(true);
  };

  // Archive View
  const renderArchive = () => {
    return (
      <div className="archive-view">
        <h2>🎵 SONG ARCHIVE</h2>
        <p className="archive-subtitle">All completed weekly songs</p>
        
        <div className="archive-grid">
          {assembledSongs.length === 0 ? (
            <>
              <div className="archive-card incomplete">
                <div className="archive-art">
                  <div className="album-placeholder">?</div>
                </div>
                <div className="archive-info">
                  <h3>Week 1: 3 AM Thoughts</h3>
                  <span className="genre-badge">Lofi Hip Hop</span>
                  <p className="status">🎵 In Progress...</p>
                </div>
              </div>

              <div className="archive-card empty">
                <p>No completed songs yet!</p>
                <p className="hint">Come back after the week ends to see the completed song</p>
              </div>
            </>
          ) : (
            assembledSongs.map((song) => (
              <div key={song.weekNumber} className="archive-card completed" onClick={() => viewSong(song)}>
                <div className="archive-art">
                  <div className="album-cover">
                    <span className="week-number">W{song.weekNumber}</span>
                  </div>
                </div>
                <div className="archive-info">
                  <h3>Week {song.weekNumber}: {song.theme}</h3>
                  <span className="genre-badge">{song.genre}</span>
                  <p className="song-stats">
                    👥 {song.contributors.length} contributors<br/>
                    📝 {song.totalSubmissions} submissions<br/>
                    ⬆️ {song.totalVotes} total votes
                  </p>
                  <button className="play-btn">▶ View Song</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Leaderboard View
  const renderLeaderboard = () => {
    return (
      <div className="leaderboard-view">
        <h2>🏆 TOP CONTRIBUTORS</h2>
        <p className="leaderboard-subtitle">Most active lyricists in CrowdBand</p>
        
        {leaderboard.length === 0 ? (
          <div className="empty">
            <p>No contributors yet. Be the first!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((user, index) => (
              <div key={user.userId} className="leaderboard-card">
                <div className="leaderboard-rank">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="leaderboard-info">
                  <h3>{user.username}</h3>
                  <div className="leaderboard-stats">
                    <span>📝 {user.totalSubmissions} submissions</span>
                    <span>⬆️ {user.totalVotes} votes</span>
                    <span>🏅 {user.badges.length} badges</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Profile View
  const renderProfile = () => {
    if (!userStats) {
      return (
        <div className="profile-view">
          <div className="loading">
            <p>Loading your profile...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-view">
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <h2>{userStats.username}</h2>
          <p className="profile-level">Level 3 Producer</p>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-value">{userStats.totalSubmissions}</div>
            <div className="stat-label">Total Contributions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.totalVotes}</div>
            <div className="stat-label">Total Votes Received</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.weeksParticipated}</div>
            <div className="stat-label">Weeks Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.badges.length}</div>
            <div className="stat-label">Badges Earned</div>
          </div>
        </div>

        <div className="badges-showcase">
          <h3>Your Badges</h3>
          <div className="badges-carousel">
            {userStats.badgeDetails && userStats.badgeDetails.length > 0 ? (
              userStats.badgeDetails.slice(0, 3).map((badge) => (
                <div key={badge.id} className={`badge-showcase-card ${badge.tier}`}>
                  <div className="badge-icon-large">{badge.icon}</div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-tier">{badge.tier} Tier</div>
                  <div className="badge-status">Unlocked!</div>
                </div>
              ))
            ) : (
              <p className="no-badges-yet">No badges yet. Start contributing!</p>
            )}
          </div>
        </div>

        <div className="leaderboard-preview">
          <h3>Community Leaderboard</h3>
          {leaderboard.slice(0, 3).map((user, index) => (
            <div key={user.userId} className="leaderboard-mini-card">
              <span className="mini-rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </span>
              <span className="mini-username">{user.username}</span>
              <span className="mini-votes">({user.totalVotes} votes)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // SPLASH SCREEN
  if (screen === 'splash') {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="logo-container">
            <img src="/logo.png" alt="CrowdBand Logo" className="logo" />
          </div>
          <h1 className="splash-title">THE BAND THAT<br />NEVER WAS</h1>
          <p className="splash-subtitle">WEEK #01: 🌙 3 AM THOUGHTS</p>
          <button className="enter-btn" onClick={() => setScreen('main')}>
            Enter Studio
          </button>
        </div>
        <div className="waveform left"></div>
        <div className="waveform right"></div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="main-screen">
        <div className="header-banner">
          <img src="/logo.png" alt="Logo" className="header-logo" />
          <div className="header-text">
            <h2>THE BAND THAT NEVER WAS</h2>
            <p>No active week</p>
          </div>
        </div>
        <div className="no-prompt-content">
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/init-prompt', { method: 'POST' });
              await loadData();
            }}
            className="start-btn"
          >
            Start Week 1
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-screen">
      {/* SONG MODAL */}
      {showSongModal && selectedSong && (
        <div className="modal-overlay" onClick={() => setShowSongModal(false)}>
          <div className="modal-content song-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowSongModal(false)}>×</button>
            
            <h2 className="song-title">🎵 Week {selectedSong.weekNumber}: {selectedSong.theme}</h2>
            <p className="song-genre">{selectedSong.genre}</p>
            
            <div className="song-stats-banner">
              <span>👥 {selectedSong.contributors.length} Contributors</span>
              <span>📝 {selectedSong.totalSubmissions} Lines</span>
              <span>⬆️ {selectedSong.totalVotes} Votes</span>
            </div>

            <div className="song-lyrics">
              {/* VERSES */}
              {selectedSong.lyrics.verses.length > 0 && (
                <div className="song-section">
                  <h3 className="section-title">🎤 Verses</h3>
                  {selectedSong.lyrics.verses.map((verse, idx) => (
                    <div key={verse.id} className="lyric-line verse">
                      <span className="line-number">V{idx + 1}</span>
                      <div className="line-content">
                        <p className="line-text">{verse.text}</p>
                        <span className="line-author">by {verse.username}</span>
                        <span className="line-votes">⬆️ {verse.votes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CHORUSES */}
              {selectedSong.lyrics.choruses.length > 0 && (
                <div className="song-section">
                  <h3 className="section-title">🎵 Choruses</h3>
                  {selectedSong.lyrics.choruses.map((chorus, idx) => (
                    <div key={chorus.id} className="lyric-line chorus">
                      <span className="line-number">C{idx + 1}</span>
                      <div className="line-content">
                        <p className="line-text">{chorus.text}</p>
                        <span className="line-author">by {chorus.username}</span>
                        <span className="line-votes">⬆️ {chorus.votes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* BRIDGES */}
              {selectedSong.lyrics.bridges.length > 0 && (
                <div className="song-section">
                  <h3 className="section-title">⭐ Bridges</h3>
                  {selectedSong.lyrics.bridges.map((bridge, idx) => (
                    <div key={bridge.id} className="lyric-line bridge">
                      <span className="line-number">B{idx + 1}</span>
                      <div className="line-content">
                        <p className="line-text">{bridge.text}</p>
                        <span className="line-author">by {bridge.username}</span>
                        <span className="line-votes">⬆️ {bridge.votes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="song-contributors">
              <h4>🎸 Contributors ({selectedSong.contributors.length})</h4>
              <div className="contributors-list">
                {selectedSong.contributors.map((contributor, idx) => (
                  <span key={idx} className="contributor-tag">{contributor}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INFO MODAL */}
      {showInfo && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🎸 WELCOME TO THE STUDIO</h2>

            <div className="modal-section">
              <h3>This Week&apos;s Theme</h3>
              <p className="theme-text">{prompt.weekTheme || '🌙 3 AM Thoughts'}</p>
              <p className="genre-text">Lofi Hip Hop Vibes</p>
            </div>

            <div className="modal-divider"></div>

            <div className="modal-instructions">
              <p>📝 Submit your lyric line</p>
              <p>⬆️ Vote for your favorites</p>
              <p>🎵 Top lines become the song</p>
            </div>

            <div className="modal-footer">
              <p>The best lines become the song.</p>
              <p>Your contributions earn badges.</p>
            </div>

            <button
              type="button"
              className="modal-btn"
              onClick={closeModal}
            >
              Enter Studio 🎤
            </button>

            <p className="modal-tip">💡 Tip: Keep it under 120 chars</p>
          </div>
        </div>
      )}

      {/* New Badge Alert */}
      {newBadgeAlert && (
        <div className="badge-alert">
          <div className="badge-alert-content">
            <div className="badge-alert-icon">{newBadgeAlert.icon}</div>
            <div className="badge-alert-text">
              <h4>Badge Unlocked!</h4>
              <p><strong>{newBadgeAlert.name}</strong></p>
              <p className="badge-alert-desc">{newBadgeAlert.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST */}
      {showSuccess && (
        <div className="success-toast">
          ✅ Lyric submitted successfully!
        </div>
      )}

      <div className="header-banner">
        <img src="/logo.png" alt="Logo" className="header-logo" />
        <div className="header-text">
          <h2>Theme: {prompt.weekTheme || '🌙 3 AM Thoughts'}</h2>
          <p>&quot;{prompt.promptText}&quot;</p>
        </div>
        <button
          type="button"
          className="info-btn"
          onClick={openModal}
        >
          ⓘ
        </button>
      </div>

      <div className="tab-content">
        {currentTab === 'studio' ? (
          <>
            {prompt && prompt.status === 'closed' ? (
              <div className="week-complete-message">
                <h2>🎉 Week {prompt.weekNumber} Complete!</h2>
                <p>The song has been assembled from your contributions</p>
                <button 
                  onClick={() => setCurrentTab('archive')}
                  className="view-song-btn"
                >
                  View Final Song 🎵
                </button>
                <p className="next-week-hint">New week starts Monday! 🎸</p>
              </div>
            ) : (
            <>
              <div className="timer-section">
                <span className="timer-label">Time Left:</span>
                <span className="timer-value">{timeLeft}</span>
              </div>

              <form className="submit-section" onSubmit={handleSubmit}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your lyrics here..."
                  maxLength={120}
                  className="lyric-input"
                />

                <div className="type-buttons">
                  <button
                    type="button"
                    className={`type-btn ${type === 'verse' ? 'active' : ''}`}
                    onClick={() => setType('verse')}
                  >
                    🎤 Verse
                  </button>
                  <button
                    type="button"
                    className={`type-btn chorus ${type === 'chorus' ? 'active' : ''}`}
                    onClick={() => setType('chorus')}
                  >
                    🎵 Chorus
                  </button>
                  <button
                    type="button"
                    className={`type-btn bridge ${type === 'bridge' ? 'active' : ''}`}
                    onClick={() => setType('bridge')}
                  >
                    ⭐ Bridge
                  </button>
                  <span className="char-counter">{text.length}/120</span>
                </div>

                <button type="submit" className="submit-btn" disabled={text.length < 10 || submitting}>
                  {submitting ? 'Submitting...' : 'Submit Your Creation'}
                </button>
              </form>

              {userSubmission && (
                <div className="user-submission-section">
                  <h3>✨ YOUR SUBMISSION</h3>
                  <div className={`submission-card ${userSubmission.type} user-card`}>
                    <div className="submission-content">
                      <span className="submission-icon">
                        {userSubmission.type === 'verse' ? '🎤' : userSubmission.type === 'chorus' ? '🎵' : '⭐'}
                      </span>
                      <div className="submission-text-wrapper">
                        <p className="submission-text">{userSubmission.text}</p>
                        <span className="submission-type">{userSubmission.type}</span>
                      </div>
                    </div>
                    <div className="vote-badge static">{userSubmission.votes}</div>
                  </div>
                </div>
              )}

              <div className="submissions-section">
                <h3>🔥 TOP LINES - VOTE & INSPIRE</h3>
                {submissions.length === 0 ? (
                  <p className="empty">No submissions yet...</p>
                ) : (
                  <div className="submissions-list">
                    {submissions.map((sub) => (
                      <div key={sub.id} className={`submission-card ${sub.type}`}>
                        <div className="submission-content">
                          <span className="submission-icon">
                            {sub.type === 'verse' ? '🎤' : sub.type === 'chorus' ? '🎵' : '⭐'}
                          </span>
                          <div className="submission-text-wrapper">
                            <p className="submission-text">{sub.text}</p>
                            <span className="submission-type">{sub.type}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`vote-badge ${sub.userVoted ? 'voted' : ''}`}
                          onClick={() => handleVote(sub.id)}
                        >
                          {sub.userVoted ? '⬆' : '↑'} {sub.votes}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
            )}
          </>
        ) : currentTab === 'leaderboard' ? (
          renderLeaderboard()
        ) : currentTab === 'archive' ? (
          renderArchive()
        ) : currentTab === 'profile' ? (
          renderProfile()
        ) : null}
      </div>
    
      {/* BOTTOM NAVIGATION */}
      <div className="bottom-nav">
        <button
          className={`nav-tab ${currentTab === 'studio' ? 'active' : ''}`}
          onClick={() => setCurrentTab('studio')}
        >
          <span className="nav-icon">🎤</span>
          <span className="nav-label">Studio</span>
        </button>
        
        <button
          className={`nav-tab ${currentTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('leaderboard')}
        >
          <span className="nav-icon">🏆</span>
          <span className="nav-label">Leaderboard</span>
        </button>
        
        <button
          className={`nav-tab ${currentTab === 'archive' ? 'active' : ''}`}
          onClick={() => setCurrentTab('archive')}
        >
          <span className="nav-icon">📀</span>
          <span className="nav-label">Archive</span>
        </button>
        
        <button
          className={`nav-tab ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentTab('profile')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </button>
      </div>
    </div>
  );
}

export default App;