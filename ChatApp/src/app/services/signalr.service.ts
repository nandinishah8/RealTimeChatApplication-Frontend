import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MessageDto } from 'Dto/MessageDto';
import { Subject, Observable } from 'rxjs';
import { EditMessageDto } from 'Dto/EditMessageDto';
import { Message } from 'Dto/Message';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
 

  private hubConnection: signalR.HubConnection;
  private isConnectionEstablished: boolean = false;
  private connectionPromise: Promise<void> | undefined;
  private sharedObj = new Subject<MessageDto>();
  private sharedEditedObj = new Subject<EditMessageDto>();
  private sharedDeletedObj = new Subject<Message>();
  private messageSeenSubject: Subject<string> = new Subject<string>();
  private unreadMessageCountSubject = new Subject<number>();
  // public unreadMessageCount$ = this.unreadMessageCountSubject.asObservable();
  public unreadMessageCount$: Observable<number> = this.unreadMessageCountSubject.asObservable();
  private unreadMessageCount: number = 0;

 
 
  

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5243/chatHub') 
      .withAutomaticReconnect()
      .build();
    
     this.unreadMessageCount = 0;

    
     this.hubConnection.on("ReceiveOne", (message: any, senderId: any) => {
      // Handle received messages
      const receivedMessageObject: MessageDto = {
        id: message.id,
        senderId: senderId,
        receiverId: message.receiverId,
        content: message.content,
        seen: message.seen,
      };

       if (!receivedMessageObject.seen) {
        this.unreadMessageCount++;
        this.unreadMessageCountSubject.next(this.unreadMessageCount);
      }

      this.sharedObj.next(receivedMessageObject);
     });
    
    
    
     this.hubConnection.on('messageSeen', (messageId: string) => {
      this.messageSeenSubject.next(messageId);
    });
  
     this.hubConnection.on("UpdateUnreadCount", (count: number) => {
        // Update the count and notify subscribers.
       this.unreadMessageCountSubject.next(count);
       console.log(count);
    });

   
  
    this.hubConnection.on("ReceiveEdited", (editedMessage: any) =>
    {
      const receivedEditedMessage: EditMessageDto =
      {
        id: editedMessage.id,
        content: editedMessage.content
       
      };
      this.sharedEditedObj.next(receivedEditedMessage);
    });
    
    this.hubConnection.on("ReceiveDeleted", (deletedMessage: any) =>
    {
      // Handle the received deleted message here
      console.log(`Received deleted message with ID ${deletedMessage.id}`);
       this.sharedDeletedObj.next(deletedMessage);
    });

     this.startConnection();
    
  }

  async startConnection(): Promise<void>
  {
    try
    {
      await this.hubConnection.start();
      console.log('SignalR Connection started');
      this.isConnectionEstablished = true;
      const connectionId = this.hubConnection.connectionId;
      console.log('Connection ID:', connectionId);
    }
    
    catch (error)
    {
      console.error('Error starting SignalR connection:', error);
      throw error;
    }
  }

  

  sendMessage(message: any, senderId: any): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('SendMessage', message, senderId)
        .then(() => {
          console.log('Message sent successfully');
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
    } else {
      console.warn('SignalR connection is not established yet.');
    }
  }

 

  async onReceiveMessage(message: any, senderId: string)
  {
    await this.connectionPromise;
    if (this.isConnectionEstablished) {
      this.hubConnection.on('ReceiveOne', (message: any, senderId: any) => {
        
        console.log('ReceivedOne:', message);
         const receivedMessageObject: MessageDto = {
          id: message.id,
          senderId: senderId,
          receiverId: message.receiverId,
          content: message.content,
          seen: message.seen,
        };
        
        this.sharedObj.next(receivedMessageObject);
      });
    }
    
    else
    {
      console.warn('SignalR connection is not established yet.');
    }
  }

  EditMessage(editMessage: any): void
  {
     
    if (this.hubConnection.state === signalR.HubConnectionState.Connected)
    {
      this.hubConnection.invoke('SendEditedMessage', editMessage)
      .then(() => {
        console.log('Edited message sent successfully');
      })
      .catch((error) => {
        console.error('Error sending edited message:', error);
      });
    }
    
    else
    {
        console.warn('SignalR connection is not established yet.');
    }
  }

  onReceiveEditedMessage(): void
  {
     
     this.connectionPromise;
    if (this.isConnectionEstablished)
    {
      this.hubConnection.on('ReceiveEdited', (editMessage: any) =>
      {
        console.log('Received Edited Message:', editMessage);
        
        const receivedEditedMessage: EditMessageDto = {
        id: editMessage.id,
        content: editMessage.content
        };
        this.sharedEditedObj.next(receivedEditedMessage);
      });
    }
    
    else
    {
      console.warn('SignalR connection is not established yet.');
    }
  }

  deleteMessage(messageId: number): void
  {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected)
    {
      this.hubConnection.invoke('SendDeletedMessage', messageId)
        .then(() => {
          console.log('Deleted message sent successfully');
        })
        .catch((error) => {
          console.error('Error sending deleted message:', error);
        });
    }
    
    else
    {
      console.warn('SignalR connection is not established yet.');
    }
  }
  
  onReceiveDeletedMessage(): void
  {
    if (this.isConnectionEstablished)
    {
      this.hubConnection.on('ReceiveDeleted', (deletedMessageId: any) =>
      {
        // Notify subscribers
        this.sharedDeletedObj.next(deletedMessageId);
      });
    }
    
    else
    {
      console.warn('SignalR connection is not established yet.');
    }
  }

 
  public retrieveDeletedObject(): Subject<Message>
  {
    return this.sharedDeletedObj;
  }

  public retrieveMappedObject(): Subject<MessageDto>
  {
    return this.sharedObj;
  }

  public retrieveEditedObject(): Subject<EditMessageDto>
  {
    return this.sharedEditedObj;
  }

    public markMessageAsSeen(messageId: string) {
    this.hubConnection.invoke('markMessageAsSeen', messageId);
  }

  public getMessageSeenObservable(): Observable<string> {
    return this.messageSeenSubject.asObservable();
  }

}



