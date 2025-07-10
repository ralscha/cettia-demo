import {Component, inject} from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  NavController
} from '@ionic/angular/standalone';
import {ChatService} from '../../services/chat.service';
import {addIcons} from "ionicons";
import {addSharp, chatbubblesSharp, exitOutline} from "ionicons/icons";

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrl: './room.page.scss',
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonFab,
    IonFabButton
  ]
})
export class RoomPage {
  readonly chatService = inject(ChatService);
  private readonly navCtrl = inject(NavController);

  constructor() {
    addIcons({exitOutline, chatbubblesSharp, addSharp});
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
