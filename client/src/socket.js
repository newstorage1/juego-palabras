import { io } from 'socket.io-client';
import { SOCKET_URL } from './config/config';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;