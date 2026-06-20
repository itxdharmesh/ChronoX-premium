import { connectToDatabase } from '../config/mongodb';
import { UserEntity } from '../../core/entities/User';
import { ObjectId } from 'mongodb';

export class UserRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const { db } = await connectToDatabase();
    const doc = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const { db } = await connectToDatabase();
    if (!ObjectId.isValid(id)) return null;
    const doc = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  async createUser(user: Omit<UserEntity, 'id'>): Promise<UserEntity> {
    const { db } = await connectToDatabase();
    const result = await db.collection('users').insertOne({
      ...user,
      email: user.email.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { ...user, id: result.insertedId.toString() };
  }

  async updateUserXp(id: string, xpIncrement: number, newLevel: number): Promise<void> {
    const { db } = await connectToDatabase();
    if (!ObjectId.isValid(id)) return;
    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $inc: { xp: xpIncrement },
        $set: { level: newLevel, updatedAt: new Date() }
      }
    );
  }

  async getTopLeaderboard(limit: number = 100): Promise<UserEntity[]> {
    const { db } = await connectToDatabase();
    const docs = await db.collection('users')
      .find({})
      .sort({ xp: -1 })
      .limit(limit)
      .toArray();
    return docs.map(d => this.mapToEntity(d));
  }

  async getAllUsersAdmin(): Promise<UserEntity[]> {
    const { db } = await connectToDatabase();
    const docs = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(d => this.mapToEntity(d));
  }

  private mapToEntity(doc: any): UserEntity {
    return {
      id: doc._id.toString(),
      email: doc.email,
      displayName: doc.displayName,
      avatarUrl: doc.avatarUrl,
      role: doc.role,
      xp: doc.xp,
      level: doc.level,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
