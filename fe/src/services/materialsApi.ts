import { apiGet, apiPost } from "./apiClient";

export interface BackendSubject {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  sort_order: number;
}

export interface BackendMaterial {
  id: number;
  subject_id: number;
  title: string;
  sub_category?: string | null;
  level: string;
  type: "text" | "video";
  content?: string | null;
  youtube_id?: string | null;
  duration_minutes: number;
  xp_reward: number;
  is_active: boolean;
}

export interface GenerateMaterialPayload {
  subject_id: number;
  level: string;
  topic: string;
}

export interface GeneratedMaterialData {
  title: string;
  content: string;
  youtube_search_query?: string;
  duration_minutes: number;
  xp_reward: number;
}

export async function getSubjects() {
  return apiGet<{ success: boolean; data: BackendSubject[] }>("/api/subjects");
}

export async function getMaterials(subjectId?: number, level?: string) {
  const params = new URLSearchParams();
  if (subjectId) params.set("subject_id", String(subjectId));
  if (level) params.set("level", level);
  const query = params.toString();
  return apiGet<{ success: boolean; data: BackendMaterial[]; total: number }>(`/api/materials${query ? `?${query}` : ""}`);
}

export async function getMaterialDetail(materialId: number) {
  return apiGet<{ success: boolean; data: BackendMaterial }>(`/api/materials/${materialId}`);
}

export async function generateMaterial(payload: GenerateMaterialPayload) {
  return apiPost<{
    success: boolean;
    data: GeneratedMaterialData;
    is_offline_fallback: boolean;
  }, GenerateMaterialPayload>("/api/materials/generate", payload);
}
