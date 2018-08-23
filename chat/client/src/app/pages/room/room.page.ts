import {Component} from '@angular/core';
import {NavController} from '@ionic/angular';
import {ChatService} from '../../services/chat.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage {

  constructor(private readonly navCtrl: NavController,
              readonly chatService: ChatService) {
  }

  addRoom() {
    this.navCtrl.goForward('/add-room', true, {skipLocationChange: true});
  }

  joinRoom(room: string) {
    this.navCtrl.goForward(`/messages/${room}`);
  }

  exit() {
    sessionStorage.removeItem('username');
    this.chatService.signout();
    this.navCtrl.goRoot('/signin');
  }

}
