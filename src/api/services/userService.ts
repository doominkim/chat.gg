import { apiClient } from "../client";
import type { ApiResponse } from "../client";

export interface User {
  id: string;
  name: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSearchResult {
  userIdHashes: string[];
  users: User[];
}

export const userService = {
  async getUsers(): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>("/users");
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/users/${id}`);
  },

  async searchUsers(params: {
    userIdHash?: string;
    nickname?: string;
    channelId?: string;
  }): Promise<ApiResponse<UserSearchResult>> {
    const search = new URLSearchParams();
    if (params.userIdHash) search.set("userIdHash", params.userIdHash);
    if (params.nickname) search.set("nickname", params.nickname);
    if (params.channelId) search.set("channelId", params.channelId);
    const qs = search.toString();
    const endpoint = qs
      ? `/user/search/userIdHash?${qs}`
      : "/user/search/userIdHash";
    return apiClient.get<UserSearchResult>(endpoint);
  },

  async createUser(
    user: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<User>> {
    return apiClient.post<User>("/users", user);
  },

  async updateUser(
    id: string,
    user: Partial<User>
  ): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/users/${id}`, user);
  },

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/${id}`);
  },
};
