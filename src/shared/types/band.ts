export interface SongPrompt {
  id: string;
  promptText: string;
  weekNumber: number;
  weekTheme?: string;
  createdAt: number;
  endsAt: number;
  status: 'open' | 'closed' | 'assembled';
}

export interface LyricSubmission {
  id: string;
  userId: string;
  username: string;
  text: string;
  type: 'verse' | 'chorus' | 'bridge';
  promptId: string;
  votes: number;
  createdAt: number;
  flagged: boolean;
}

export interface FinalSong {
  id: string;
  promptId: string;
  weekNumber: number;
  lyrics: string[];
  structure: string;
  topContributors: string[];
  coverArtUrl: string;
  createdAt: number;
}

export interface SubmitRequest {
  text: string;
  type: 'verse' | 'chorus' | 'bridge';
}

export interface SubmitResponse {
  success: boolean;
  submission?: LyricSubmission;
  error?: string;
}
