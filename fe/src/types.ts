export enum LearnLevel {
  FUNDAMENTAL = "Fundamental",
  BASIC = "Basic",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
  UTBK = "UTBK Level"
}

export interface Material {
  id: string;
  title: string;
  category: "Math" | "Physics" | "Biology" | "Chemistry" | "Indonesian" | "English" | "General" | "Matematika" | "Fisika" | "Biologi" | "Kimia" | "Bahasa Indonesia" | "Bahasa Inggris" | "UTBK / SNBT";
  subCategory?: string;
  subjectId?: number;
  level: LearnLevel;
  type: "text" | "video";
  content: string; // Markdown text or description
  videoUrl?: string; // YouTube watch link or embed ID
  youtubeId?: string; // Parsed YouTube ID
  durationMinutes: number;
  xpReward: number;
  isCompleted?: boolean;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  level: LearnLevel;
  category: string;
  points: number;
  timerSeconds: number;
}

export interface QuizSession {
  id: string;
  title: string;
  category: string;
  level: LearnLevel;
  questions: Question[];
  xpReward: number;
}

export interface UserStats {
  username: string;
  avatar_url: string | null;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  streakDays: number;
  dailyGoalMinutes: number;
  goalName: string;
  goalIntensity: number;
  goalSubjects: string[];
  dailyMinutesCompleted: number;
  dailyMaterialsCompleted: number;
  monthlyMaterialsCompleted: number;
  monthlyMinutesCompleted: number;
  currentMonth: string; // "YYYY-MM" — buat deteksi reset bulanan
  totalQuestionsSolved: number;
  iqScoreEstimate?: number; // Simulated IQ Report
  averageScores: {
    daily: number; // Daily percentage avg
    weekly: number; // Weekly percentage avg
    monthly: number; // Monthly percentage avg
  };
  weeklyActivity: {
    day: string; // e.g., "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"
    minutes: number;
    score: number;
  }[];
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  unlockedAt?: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

export interface LeaderboardUser {
  id: string;
  username: string;
  avatarSeed: string; // dicebear or similar placeholder
  xp: number;
  rank: number;
  badgeCount: number;
  level: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorLevel: number;
  authorAvatar: string;
  category: string;
  tags: string[];
  upvotes: number;
  repliesCount: number;
  createdAt: string;
  replies: ForumReply[];
  isUpvoted?: boolean;
}

export interface ForumReply {
  id: string;
  author: string;
  authorLevel: number;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderLevel: number;
  senderAvatar: string;
  message: string;
  timestamp: string;
  channelId: "general" | "utbk-math" | "discussion";
}
