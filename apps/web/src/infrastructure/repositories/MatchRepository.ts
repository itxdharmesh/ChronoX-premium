import { connectToDatabase } from '../config/mongodb';
import { MatchEntity, MatchStatus } from '../../core/entities/Match';
import { ObjectId } from 'mongodb';

export class MatchRepository {
  async createMatch(match: Omit<MatchEntity, 'id'>): Promise<MatchEntity> {
    const { db } = await connectToDatabase();
    const result = await db.collection('matches').insertOne({
      ...match,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { ...match, id: result.insertedId.toString() };
  }

  async findById(id: string): Promise<MatchEntity | null> {
    const { db } = await connectToDatabase();
    if (!ObjectId.isValid(id)) return null;
    const doc = await db.collection('matches').findOne({ _id: new ObjectId(id) });
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  async updateMatchStatus(id: string, status: MatchStatus, winnerId?: string): Promise<void> {
    const { db } = await connectToDatabase();
    if (!ObjectId.isValid(id)) return;
    const updateData: any = { status, updatedAt: new Date() };
    if (winnerId) {
      updateData.winnerId = winnerId;
    }
    await db.collection('matches').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
  }

  async updatePlayerScore(id: string, userId: string, score: number): Promise<void> {
    const { db } = await connectToDatabase();
    if (!ObjectId.isValid(id)) return;
    await db.collection('matches').updateOne(
      { _id: new ObjectId(id), "players.userId": userId },
      { 
        $set: { "players.$.score": score, updatedAt: new Date() }
      }
    );
  }

  private mapToEntity(doc: any): MatchEntity {
    return {
      id: doc._id.toString(),
      gameType: doc.gameType,
      status: doc.status,
      players: doc.players,
      winnerId: doc.winnerId,
      moves: doc.moves || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
