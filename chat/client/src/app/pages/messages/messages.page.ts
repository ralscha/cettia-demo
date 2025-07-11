import {Component, ElementRef, inject, OnDestroy, OnInit, viewChild} from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTextarea,
  IonTitle,
  IonToolbar,
  NavController
} from '@ionic/angular/standalone';
import {ChatService} from '../../services/chat.service';
import {Message} from '../../models/message';
import {ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {EmojiPickerComponent} from '../../components/emoji-picker/emoji-picker';
import {RelativeTimePipe} from '../../pipes/relative-time.pipe';
import {addIcons} from "ionicons";
import {exitOutline, happySharp, sendSharp} from "ionicons/icons";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  imports: [FormsModule, EmojiPickerComponent, RelativeTimePipe, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonButton, IonIcon, IonContent, IonList, IonItem, IonLabel, IonFooter, IonTextarea]
})
export class MessagesPage implements OnInit, OnDestroy {
  readonly chatService = inject(ChatService);
  readonly content = viewChild.required(IonContent);
  message = '';
  messages: Message[] = [];
  roomName!: string | null;
  showEmojiPicker = false;
  readonly messageInput = viewChild.required<ElementRef>('messageInput');
  private readonly route = inject(ActivatedRoute);
  private readonly navCtrl = inject(NavController);
  private readonly chatElement = viewChild.required(IonList, { read: ElementRef });
  private mutationObserver!: MutationObserver;

  private handleNewMessageFunction: ((msg: Message[]) => void) | null = null;

  constructor() {
    addIcons({exitOutline, happySharp, sendSharp});
  }

  exit(): void {
    sessionStorage.removeItem('username');
    this.chatService.signout();
    this.navCtrl.navigateRoot('/signin');
  }

  ngOnInit(): void {
    this.roomName = this.route.snapshot.paramMap.get('room');
    if (this.roomName) {
      this.handleNewMessageFunction = this.handleNewMessage.bind(this);
      this.chatService.joinRoom(this.roomName, this.handleNewMessageFunction);

      this.mutationObserver = new MutationObserver(() => {
        setTimeout(() => this.content().scrollToBottom(), 100);
      });

      this.mutationObserver.observe(this.chatElement().nativeElement, {
        childList: true
      });
    }
  }

  ngOnDestroy(): void {
    this.mutationObserver.disconnect();
    if (this.roomName && this.handleNewMessageFunction) {
      this.chatService.leaveRoom(this.roomName, this.handleNewMessageFunction);
    }
  }

  handleNewMessage(msg: Message[]): void {
    this.messages.push(...msg);
    if (this.messages.length > 100) {
      this.messages.shift();
    }
  }

  sendMessage(): void {
    if (this.message && this.message.trim() && this.roomName) {
      this.chatService.send(this.roomName, this.message);
      this.message = '';

      this.onFocus();
    }
  }

  onFocus(): void {
    this.showEmojiPicker = false;
    this.scrollToBottom();
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker) {
      this.focus();
    }

    this.scrollToBottom();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      this.content().scrollToBottom();
    }, 10);
  }

  private focus(): void {
    const messageInput = this.messageInput();
    if (messageInput && messageInput.nativeElement) {
      messageInput.nativeElement.focus();
    }
  }

}
