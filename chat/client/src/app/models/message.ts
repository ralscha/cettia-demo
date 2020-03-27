export interface Message {
  sendDate: number;
  user: string;
  type: 'JOIN' | 'LEAVE' | 'MSG';
  message: string;
}

