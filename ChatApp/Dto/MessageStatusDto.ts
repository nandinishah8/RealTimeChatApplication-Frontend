export interface MessageStatusDto {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  seen: boolean; 
  
}
