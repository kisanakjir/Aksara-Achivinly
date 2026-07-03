import { apiPost, apiGet } from "./apiClient";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  display_name?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  goal_name?: string | null;
  goal_intensity?: number | null;
  goal_subjects?: string | null;
  level: number;
  current_xp: number;
  xp_to_next_level: number;
  streak_days: number;
  last_active_date: string | null;
  total_minutes_studied: number;
  total_questions_solved: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface ProfileResponse {
  success: boolean;
  data: AuthUser;
}

export async function loginApi(payload: LoginPayload) {
  return apiPost<AuthResponse, LoginPayload>("/api/auth/login", payload);
}

export async function registerApi(payload: RegisterPayload) {
  return apiPost<AuthResponse, RegisterPayload>("/api/auth/register", payload);
}

export async function getProfileApi() {
  return apiGet<ProfileResponse>("/api/auth/me");
}
