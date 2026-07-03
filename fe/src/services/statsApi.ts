import { apiGet, apiPost } from "./apiClient";

export interface DailyStatsData {
  date: string;
  minutes_studied: number;
  materials_completed: number;
  quizzes_taken: number;
  average_score: number;
  xp_earned: number;
  streak_days: number;
  level: number;
  current_xp: number;
  xp_to_next_level: number;
  daily_goal_minutes: number;
  goal_progress_percentage: number;
}

export interface WeeklyDayData {
  day: string;
  date: string;
  minutes: number;
  score: number;
  xp: number;
}

export interface WeeklyStatsData {
  total_minutes: number;
  total_xp: number;
  average_score: number;
  active_days: number;
  materials_completed: number;
  day_by_day: WeeklyDayData[];
}

export interface MonthlyStatsData {
  month: string;
  total_minutes: number;
  total_xp: number;
  total_materials_completed: number;
  total_quizzes_taken: number;
  average_score: number;
  active_days: number;
}

export interface ProgressPayload {
  user_id: number;
  material_id?: number | null;
  session_type: "material" | "quiz" | "game";
  duration_minutes: number;
  xp_earned: number;
  score?: number | null;
  is_completed: boolean;
}

export interface ProgressResponse {
  success: boolean;
  xp_earned: number;
  level_up: boolean;
  new_level?: number | null;
  streak_days: number;
  message: string;
}

export async function getDailyStats() {
  return apiGet<{ success: boolean; data: DailyStatsData }>("/api/stats/daily");
}

export async function getWeeklyStats() {
  return apiGet<{ success: boolean; data: WeeklyStatsData }>("/api/stats/weekly");
}

export async function getMonthlyStats() {
  return apiGet<{ success: boolean; data: MonthlyStatsData }>("/api/stats/monthly");
}

export async function saveProgress(payload: ProgressPayload) {
  return apiPost<ProgressResponse, ProgressPayload>("/api/progress", payload);
}
