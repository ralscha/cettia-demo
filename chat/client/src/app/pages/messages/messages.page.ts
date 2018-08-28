import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Content, List, NavController} from '@ionic/angular';
import {ChatService} from '../../services/chat.service';
import {Message} from '../../models/message';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: 'messages.page.html',
  styleUrls: ['messages.page.scss'],
})
export class MessagesPage implements OnInit, OnDestroy {

  @ViewChild(Content) content: Content;

  message: string;
  messages: Message[] = [];
  roomName: string;
  showEmojiPicker = false;

  @ViewChild('messageInput') messageInput: ElementRef;

  @ViewChild(List, {read: ElementRef})
  private chatElement: ElementRef;
  private mutationObserver: MutationObserver;

  private handleNewMessageFunction: any = null;

  constructor(private readonly route: ActivatedRoute,
              private readonly navCtrl: NavController,
              readonly chatService: ChatService) {
  }

  exit() {
    sessionStorage.removeItem('username');
    this.chatService.signout();
    this.navCtrl.navigateRoot('/signin');
  }

  ngOnInit() {
    this.roomName = this.route.snapshot.paramMap.get('room');

    this.handleNewMessageFunction = this.handleNewMessage.bind(this);
    this.chatService.joinRoom(this.roomName, this.handleNewMessageFunction);

    this.mutationObserver = new MutationObserver(mutations => {
      setTimeout(() => {
        this.content.scrollToBottom();
      }, 100);
    });

    this.mutationObserver.observe(this.chatElement.nativeElement, {
      childList: true
    });
  }

  ngOnDestroy() {
    this.mutationObserver.disconnect();
    this.chatService.leaveRoom(this.roomName, this.handleNewMessageFunction);
  }

  handleNewMessage(msg) {
    this.messages.push(...msg);
    if (this.messages.length > 100) {
      this.messages.shift();
    }
  }

  sendMessage() {
    if (this.message && this.message.trim()) {
      this.chatService.send(this.roomName, this.message);
      this.message = '';

      this.onFocus();
    }
  }

  onFocus() {
    this.showEmojiPicker = false;
    this.scrollToBottom();
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker) {
      this.focus();
    }

    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 10);
  }

  private focus() {
    if (this.messageInput && this.messageInput.nativeElement) {
      this.messageInput.nativeElement.focus();
    }
  }

}
