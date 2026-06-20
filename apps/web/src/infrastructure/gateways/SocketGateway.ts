import { Server as NetServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export class SocketGateway {
  private io: SocketIOServer | null = null;

  initialize(server: NetServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket client synchronized successfully: ${socket.id}`);

      // Handle matchmaking arena queue room entries
      socket.on('join_match_room', (data: { matchId: string; userId: string; displayName: string }) => {
        const { matchId, userId, displayName } = data;
        socket.join(`match_${matchId}`);
        console.log(`User ${displayName} locked into transactional match container: match_${matchId}`);
        
        // Broadcast user presence to room opponents
        socket.to(`match_${matchId}`).emit('player_connected', { userId, displayName });
      });

      // Handle real-time game action metrics or quiz submissions
      socket.on('submit_move', (data: { matchId: string; userId: string; action: string; currentScore: number }) => {
        const { matchId, userId, action, currentScore } = data;
        // Echo game updates directly to the connected opponent stream inside the same session room
        socket.to(`match_${matchId}`).emit('opponent_moved', { userId, action, currentScore });
      });

      // Handle real-time chat broadcast inside specific channels
      socket.on('send_global_chat', (data: { displayName: string; message: string; timestamp: string }) => {
        this.io?.emit('receive_global_chat', data);
      });

      socket.on('disconnect', () => {
        console.log(`Socket lifecycle terminated for node client: ${socket.id}`);
      });
    });

    return this.io;
  }

  getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error("Critical Core Failure: Socket.io runtime environment instance has not been initialized.");
    }
    return this.io;
  }
}
