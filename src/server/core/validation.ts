const PROFANITY_LIST = [
  'damn', 'hell', 'crap', 'shit', 'fuck', 'ass', 'bitch',
  // Add more as needed
];

export function filterProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return PROFANITY_LIST.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

export function validateLyric(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Lyric cannot be empty' };
  }

  if (text.length < 10) {
    return { valid: false, error: 'Lyric must be at least 10 characters' };
  }
  
  if (text.length > 120) {
    return { valid: false, error: 'Lyric must be 120 characters or less' };
  }

  if (filterProfanity(text)) {
    return { valid: false, error: 'Please keep lyrics family-friendly' };
  }

  if (/https?:\/\//.test(text)) {
    return { valid: false, error: 'URLs not allowed in lyrics' };
  }

  return { valid: true };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
