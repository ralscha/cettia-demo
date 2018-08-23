export type MessageType = 'ease-in' | 'ease-out' | 'ease-in-out';

export interface Message {
  sendDate: number;
  user: string;
  type: 'JOIN' | 'LEAVE' | 'MSG';
  message: string;
}

