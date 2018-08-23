import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import cettia from 'cettia-client/cettia-bundler';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  rooms: string[] = [];
  username: string = null;
  private loggedIn = false;
  private socket: any = null;

  isLoggedIn() {
    return this.loggedIn;
  }

  signin(username: string, language: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.socket = cettia.open(environment.SERVER_URL);
      this.socket.on('signedin', msg => {
        this.loggedIn = true;
        this.username = username;
        this.rooms = msg.rooms;
        resolve(true);
      });

      this.socket.on('userexists', () => {
        resolve(false);
      });

      this.socket.on('roomAdded', msg => {
        if (!this.rooms.includes(msg.room)) {
          this.rooms.push(msg.room);
        }
      });

      this.socket.on('roomsRemoved', rooms => {
        this.rooms = this.rooms.filter(r => !rooms.includes(r));
      });

      this.socket.on('open', () => {
        this.socket.send('signin', {username, language});
      });

    });
  }

  signout() {
    this.loggedIn = false;
    this.username = null;
    this.socket.close();
    this.socket = null;
  }

  addRoom(room: string) {
    this.socket.send('newRoom', {room});
  }

  send(room: string, message: string) {
    this.socket.send('msg', {room, message});
  }

  joinRoom(room: string, roomListener: (msg: any) => void) {
    this.socket.send('joinedRoom', {room});
    this.socket.once('existingMessages', roomListener);
    this.socket.on('newMsg', roomListener);
  }

  leaveRoom(room: string, roomListener: (msg: any) => void) {
    if (this.socket) {
      this.socket.send('leftRoom', {room});
      this.socket.off('newMsg', roomListener);
    }
  }
}
