import { connectToDatabase } from '../config/mongodb';
import { UserAchievementEntity } from '../../core/entities/Achievement';
import { ObjectId } from 'mongodb';

export class AchievementRepository {
  async unlockAchievement(userId: string, achievementCode: string): Promise<UserAchievementEntity | null> {
    const { db } = await connectToDatabase();
    
    // Check if already unlocked to prevent duplicate entries
    const existing = await db.collection('user_achievements').findOne({
      userId,
      achievementCode
    });
    
    if (existing) return null;

    const newUnlock = {
      userId,
      achievementCode,
      unlockedAt: new Date()
    };

    const result = await db.collection('user_achievements').insertOne(newUnlock);
    return {
      id: result.insertedId.toString(),
      ...newUnlock
    };
  }

  async getUnlockedAchievements(userId: string): Promise<string[]> {
    const { db } = await connectToDatabase();
    const docs = await db.collection('user_achievements')
      .find({ userId })
      .toArray();
    return docs.map(doc => doc.achievementCode);
  }
}
