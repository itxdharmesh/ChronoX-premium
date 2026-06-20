import { NextResponse } from 'next/server';
import { UserRepository } from '../../../../infrastructure/repositories/UserRepository';

const userRepo = new UserRepository();

export async function GET() {
  try {
    // Fetch top 50 ranked players from the MongoDB data stream
    const leaderboardData = await userRepo.getTopLeaderboard(50);
    return NextResponse.json({ success: true, data: leaderboardData });
  } catch (error) {
    console.error("Leaderboard transmission error:", error);
    return NextResponse.json({ error: "Failed to compile leaderboard statistics matrix." }, { status: 500 });
  }
}
