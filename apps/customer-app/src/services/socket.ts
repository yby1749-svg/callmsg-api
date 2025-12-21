import {io, Socket} from 'socket.io-client';
import {SOCKET_URL} from '@config/constants';
import {getTokens} from '@api/client';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    const tokens = await getTokens();
    if (!tokens?.accessToken) {
      console.log('Socket: No auth token, skipping connection');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {token: tokens.accessToken},
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on('connect', () => {
      console.log('Socket: Connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', reason => {
      console.log('Socket: Disconnected -', reason);
    });

    this.socket.on('connect_error', error => {
      console.log('Socket: Connection error -', error.message);
      this.reconnectAttempts++;
    });

    this.socket.on('error', error => {
      console.error('Socket: Error -', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBooking(bookingId: string): void {
    this.socket?.emit('join:booking', {bookingId});
  }

  leaveBooking(bookingId: string): void {
    this.socket?.emit('leave:booking', {bookingId});
  }

  onProviderLocation(
    callback: (data: {latitude: number; longitude: number}) => void,
  ): void {
    this.socket?.on('location:provider', callback);
  }

  onBookingUpdated(
    callback: (data: {bookingId: string; status: string; data?: any}) => void,
  ): void {
    this.socket?.on('booking:updated', callback);
  }

  onNotification(
    callback: (data: {
      type: string;
      title: string;
      body: string;
      data?: any;
    }) => void,
  ): void {
    this.socket?.on('notification', callback);
  }

  onChatMessage(
    callback: (data: {
      id: string;
      bookingId: string;
      senderId: string;
      content: string;
      createdAt: string;
    }) => void,
  ): void {
    this.socket?.on('chat:message', callback);
  }

  offProviderLocation(): void {
    this.socket?.off('location:provider');
  }

  offBookingUpdated(): void {
    this.socket?.off('booking:updated');
  }

  offNotification(): void {
    this.socket?.off('notification');
  }

  offChatMessage(): void {
    this.socket?.off('chat:message');
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
