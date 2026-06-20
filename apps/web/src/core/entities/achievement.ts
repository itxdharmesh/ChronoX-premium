export interface AchievementEntity {
  id: string;
  code: string;
  title: string;
  description: string;
  xpReward: number;
  iconType: string;
}

export interface UserAchievementEntity {
  id: string;
  userId: string;
  achievementCode: string;
  unlockedAt: Date;
}

export const SYSTEM_ACHIEVEMENTS: AchievementEntity[] = [
  {
    id: "ach_001",
    code: "FIRST_BLOOD",
    title: "First Initiative",
    description: "Successfully complete your first multiplayer interface match setup.",
    xpReward: 150,
    iconType: "swords",
  },
  {
    id: "ach_002",
    code: "AI_CHALLENGER",
    title: "Deep Thought Sync",
    description: "Engage the Gemini AI companion model engine inside conversational frames.",
    xpReward: 100,
    iconType: "brain",
  },
  {
    id: "ach_003",
    code: "GRANDMASTER",
    title: "Chronox Absolute",
    description: "Cross the competitive threshold scoring tier above 5,000 XP metrics.",
    xpReward: 1000,
    iconType: "crown",
  },
];
