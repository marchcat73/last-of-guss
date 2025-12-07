import { apiClient } from './client';
import type {
  LoginRequest,
  User,
  RoundResponse,
  RoundsListResponse,
  RoundForList,
  TapResponse,
} from '../types';

export const authAPI = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

export const roundsAPI = {
  getAll: async (
    cursor?: string,
    limit: number = 10,
  ): Promise<RoundsListResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const response = await apiClient.get<RoundsListResponse>(
      `/rounds?${params.toString()}`,
    );
    return response.data;
  },

  getById: async (id: string): Promise<RoundResponse> => {
    const response = await apiClient.get<RoundResponse>(`/rounds/${id}`);
    return response.data;
  },

  create: async (): Promise<RoundForList> => {
    const response = await apiClient.post('/rounds');
    const roundData = response.data;

    const now = new Date();
    const startTime = new Date(roundData.startTime);

    return {
      ...roundData,
      round_state: now < startTime ? 'cooldown' : 'active',
    };
  },

  tap: async (id: string): Promise<TapResponse> => {
    const response = await apiClient.post(`/rounds/${id}/tap`);
    return response.data;
  },
};
