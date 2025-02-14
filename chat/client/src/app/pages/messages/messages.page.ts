import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IonContent, IonList, NavController} from '@ionic/angular';
import {ChatService} from '../../services/chat.service';
import {Message} from '../../models/message';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-messages',
    templateUrl: './messages.page.html',
    styleUrls: ['./messages.page.scss'],
    standalone: false
})
export class MessagesPage implements OnInit, OnDestroy {

  @ViewChild(IonContent, {static: true}) content!: IonContent;

  message = '';
  messages: Message[] = [];
  roomName!: string | null;
  showEmojiPicker = false;

  @ViewChild('messageInput', {static: true}) messageInput!: ElementRef;

  @ViewChild(IonList, {read: ElementRef, static: true})
  private chatElement!: ElementRef;
  private mutationObserver!: MutationObserver;

  private handleNewMessageFunction: ((msg: Message[]) => void) | null = null;

  constructor(private readonly route: ActivatedRoute,
              private readonly navCtrl: NavController,
              readonly chatService: ChatService) {
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
        setTimeout(() => this.content.scrollToBottom(), 100);
      });

      this.mutationObserver.observe(this.chatElement.nativeElement, {
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
      this.content.scrollToBottom();
    }, 10);
  }

  private focus(): void {
    if (this.messageInput && this.messageInput.nativeElement) {
      this.messageInput.nativeElement.focus();
    }
  }

}
