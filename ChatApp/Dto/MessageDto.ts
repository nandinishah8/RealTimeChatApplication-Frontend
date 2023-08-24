export class MessageDto {
  id: number;
//   senderId: string;
  reciverdId: string;
  content: string;

  constructor() {
    // this.senderId = '';
    this.reciverdId = '';
    this.content = '';
    this.id = 0;
  }
}