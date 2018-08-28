import {Component} from '@angular/core';
import {NavController} from '@ionic/angular';
import {ChatService} from '../../services/chat.service';

@Component({
  selector: 'app-add-room',
  templateUrl: './add-room.page.html',
  styleUrls: ['./add-room.page.scss'],
})
export class AddRoomPage {

  roomname: string;

  constructor(private readonly navCtrl: NavController,
              private readonly chatService: ChatService) {
  }

  async addRoom() {
    this.chatService.addRoom(this.roomname);
    this.navCtrl.navigateBack('room');
  }

}
