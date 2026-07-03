import { apiGet } from "./apiClient";

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  fill?: boolean;
  tension?: number;
}

export interface ChartDataResponse {
  success: boolean;
  data: {
    type: "bar" | "line" | "donut";
    labels: string[];
    datasets: ChartDataset[];
  };
}

export interface SubjectDistributionItem {
  subject: string;
  minutes: number;
  percentage: number;
  color: string;
}

export async function getActivityGraph() {
  return apiGet<ChartDataResponse>("/api/graph/activity");
}

export async function getScoresGraph() {
  return apiGet<ChartDataResponse>("/api/graph/scores");
}

export async function getSubjectDistribution() {
  return apiGet<{ success: boolean; data: SubjectDistributionItem[] }>("/api/graph/subject-distribution");
}
