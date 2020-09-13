import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
// @ts-ignore
import cettia from 'cettia-client/cettia-bundler';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  rooms: string[] = [];
  username: string | null = null;
  private loggedIn = false;
  // tslint:disable-next-line:no-any
  private socket: any | null = null;

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  signin(username: string, language: string | null, refresh = false): Promise<boolean> {
    return new Promise<boolean>(resolve => {

      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }

      this.socket = cettia.open(environment.SERVER_URL);
      // tslint:disable-next-line:no-any
      this.socket.on('signedin', (msg: any) => {
        this.loggedIn = true;
        this.username = username;
        this.rooms = msg.rooms;
        resolve(true);
      });

      this.socket.on('userexists', () => {
        resolve(false);
      });

      // tslint:disable-next-line:no-any
      this.socket.on('roomAdded', (msg: any) => {
        if (!this.rooms.includes(msg.room)) {
          this.rooms.push(msg.room);
        }
      });

      this.socket.on('roomsRemoved', (rooms: string[]) => {
        this.rooms = this.rooms.filter(r => !rooms.includes(r));
      });

      this.socket.on('open', () => {
        this.socket.send('signin', {username, language, refresh});
      });

    });
  }

  signout(): void {
    this.loggedIn = false;
    this.username = null;
    this.socket.close();
    this.socket = null;
  }

  addRoom(room: string): void {
    this.socket.send('newRoom', {room});
  }

  send(room: string, message: string): void {
    this.socket.send('msg', {room, message});
  }

  // tslint:disable-next-line:no-any
  joinRoom(room: string, roomListener: (msg: any) => void): void {
    this.socket.send('joinedRoom', {room});
    this.socket.once('existingMessages', roomListener);
    this.socket.on('newMsg', roomListener);
  }

  // tslint:disable-next-line:no-any
  leaveRoom(room: string, roomListener: (msg: any) => void): void {
    if (this.socket) {
      this.socket.send('leftRoom', {room});
      this.socket.off('newMsg', roomListener);
    }
  }
}
