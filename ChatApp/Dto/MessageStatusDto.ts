// message-dto.model.ts

export class MessageStatusDto {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  seen: boolean; 
  read: boolean; 

  constructor(
    id: string,
    senderId: string,
    receiverId: string,
    content: string,
    timestamp: Date,
    seen: boolean,
    read: boolean
  ) {
    this.id = id;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.timestamp = timestamp;
    this.seen = seen;
    this.read = read;
  }
}
