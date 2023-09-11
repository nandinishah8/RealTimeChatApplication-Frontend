export class MessageDto {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  seen: boolean;

  constructor() {
    this.senderId = '';
    this.receiverId = '';
    this.content = '';
    this.id = '';
    this.seen = false;
  }
}