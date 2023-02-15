import { Server } from 'socket.io';

let socketIOPostObject: Server;

export class SocketIOPostHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }

  public listen(): void {
    this.io.on('connection', () => {
      console.log('Post socket io connected');
    });
  }
}

export { socketIOPostObject };
