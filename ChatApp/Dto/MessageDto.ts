export class MessageDto {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;

  constructor() {
    this.senderId = '';
    this.receiverId = '';
    this.content = '';
    this.id = '';
  }
}