import {Component, inject} from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  NavController
} from '@ionic/angular/standalone';
import {ChatService} from '../../services/chat.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-add-room',
  templateUrl: './add-room.page.html',
  styleUrls: ['./add-room.page.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonList, IonItem, IonInput, IonLabel, IonButton]
})
export class AddRoomPage {
  roomname = '';
  private readonly navCtrl = inject(NavController);
  private readonly chatService = inject(ChatService);

  async addRoom(): Promise<void> {
    this.chatService.addRoom(this.roomname);
    await this.navCtrl.navigateBack('/room');
  }

}
