import { NextResponse } from 'next/server';
import { UserRepository } from '../../../../../infrastructure/repositories/UserRepository';
import { signToken } from '../../../../../infrastructure/adapters/jwt';
import { auth as firebaseAuth } from '../../../../../infrastructure/config/firebase';

const userRepo = new UserRepository();

export async function POST(request: Request) {
  try {
    const { token, displayName, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json({ error: 'Missing authentication parameters.' }, { status: 400 });
    }

    // Check if the user already exists in MongoDB
    let user = await userRepo.findByEmail(email);

    if (!user) {
      // Create a new baseline user if they don't exist
      user = await userRepo.createUser({
        email,
        displayName: displayName || email.split('@')[0],
        role: 'user',
        xp: 0,
        level: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Generate our secure app session JWT token
    const appToken = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, user });
    
    // Set cookie wrapper inside the user browser runtime container securely
    response.cookies.set('chronox_session', appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 Days operational lifespan
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Session production failure:', error);
    return NextResponse.json({ error: 'Failed to verify internal server authorization context.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  // Clean up session cookie on user logout
  response.cookies.delete('chronox_session');
  return response;
}
