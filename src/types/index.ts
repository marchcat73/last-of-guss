export interface User {
  username: string;
  role: 'ADMIN' | 'SURVIVOR';
}

export interface RoundStats {
  taps: number;
  score: number;
}

export interface TopStats extends RoundStats {
  user: {
    username: string;
  };
}

export interface RoundResponse {
  round: {
    id: string;
    startTime: string;
    endTime: string;
    totalScore: number;
    createdAt: string;
  };
  topStats: TopStats[];
  myStats: RoundStats;
}

export interface RoundListItem {
  id: string;
  startTime: string;
  endTime: string;
  totalScore: number;
  createdAt: string;
}

export interface RoundsListResponse {
  data: RoundListItem[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface RoundForList extends RoundListItem {
  round_state: 'active' | 'cooldown' | 'completed';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiError {
  message: string;
}

export interface TapResponse {
  taps: number;
  score: number;
}
