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

  addRoom(): void {
    this.navCtrl.navigateForward('/add-room');
  }

  joinRoom(room: string): void {
    this.navCtrl.navigateForward(`/messages/${room}`);
  }

  exit(): void {
    sessionStorage.removeItem('username');
    this.chatService.signout();
    this.navCtrl.navigateRoot('/signin');
  }

}
