export type MatchStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

export interface MatchPlayer {
  userId: string;
  displayName: string;
  score: number;
  isReady: boolean;
}

export interface MatchEntity {
  id: string;
  gameType: 'speed-trivia' | 'chrono-lock';
  status: MatchStatus;
  players: MatchPlayer[];
  winnerId?: string;
  moves: Array<{
    playerId: string;
    action: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class MatchValidator {
  static validate(match: Partial<MatchEntity>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!match.gameType || !['speed-trivia', 'chrono-lock'].includes(match.gameType)) {
      errors.push("Invalid game engine target configuration type selection.");
    }
    if (!match.players || match.players.length === 0) {
      errors.push("A valid transactional match session must have at least one assigned participant.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
