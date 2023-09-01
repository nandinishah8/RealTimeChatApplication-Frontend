import { MessageDto } from './MessageDto';
export class EditMessageDto {
  id: any; 
  content: string; 
 
  constructor(id: any, content: string) {
    this.id = id;
    this.content = content;
  
  }
}
