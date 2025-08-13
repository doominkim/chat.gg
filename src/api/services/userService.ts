import { apiClient } from "../client";
import type { ApiResponse } from "../client";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export const userService = {
  async getUsers(): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>("/users");
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/users/${id}`);
  },

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>("/users", userData);
  },

  async updateUser(
    id: string,
    userData: UpdateUserRequest
  ): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/users/${id}`, userData);
  },

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/${id}`);
  },
};
