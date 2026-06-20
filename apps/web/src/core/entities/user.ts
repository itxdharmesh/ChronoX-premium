export interface UserEntity {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  xp: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UserValidator {
  static validate(user: Partial<UserEntity>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.push("Invalid or missing structural email format.");
    }
    if (!user.displayName || user.displayName.trim().length < 3) {
      errors.push("Display name must be verified and be at least 3 characters long.");
    }
    if (user.xp !== undefined && user.xp < 0) {
      errors.push("Experience metrics cannot drop below baseline zero.");
    }
    if (user.level !== undefined && user.level < 1) {
      errors.push("Player runtime initialization level must be at least 1.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }
}
