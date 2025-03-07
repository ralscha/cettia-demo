import {Component} from '@angular/core';
import {NavController} from '@ionic/angular';
import {ChatService} from '../../services/chat.service';

@Component({
    selector: 'app-add-room',
    templateUrl: './add-room.page.html',
    styleUrls: ['./add-room.page.scss'],
    standalone: false
})
export class AddRoomPage {

  roomname = '';

  constructor(private readonly navCtrl: NavController,
              private readonly chatService: ChatService) {
  }

  async addRoom(): Promise<void> {
    this.chatService.addRoom(this.roomname);
    await this.navCtrl.navigateBack('/room');
  }

}
