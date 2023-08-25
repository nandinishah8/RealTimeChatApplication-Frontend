export class MessageDto {
  id: number;
  senderId?: string;
  receiverId: string;
  content: string;

  constructor() {
    this.senderId = '';
    this.receiverId = '';
    this.content = '';
    this.id = 0;
  }
}