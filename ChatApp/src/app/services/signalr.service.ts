import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MessageDto } from 'Dto/MessageDto';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { EditMessageDto } from 'Dto/EditMessageDto';
import { ChangeDetectorRef } from '@angular/core';
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
  private unreadMessageCountSubject: Subject<number> = new Subject<number>();
  public unreadMessageCount$: Observable<any> = this.unreadMessageCountSubject.asObservable();
  private unreadMessageCount: number = 0;
  private allMessagesReadSubject = new BehaviorSubject<string>('');
  allMessagesRead$ = this.allMessagesReadSubject.asObservable();
 
  changeDetector: any;
  private unreadMessageCounts: { [userId: string]: number } = {};
 
 
  

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5243/chatHub') 
      .withAutomaticReconnect()
      .build();
    
     
    
      this.hubConnection.on('ReceiveOne', (message: any, senderId: any, unreadMessageCount: number) => {
      const receivedMessageObject: MessageDto = {
        id: message.id,
        senderId: senderId,
        receiverId: message.receiverId,
        content: message.content,
        seen: message.seen,
        };
        
        console.log(unreadMessageCount);

      if (!receivedMessageObject.seen) {
        this.unreadMessageCount++;
        this.unreadMessageCountSubject.next(this.unreadMessageCount);
       
        console.log(this.unreadMessageCount);
      }

      this.sharedObj.next(receivedMessageObject);
    });

   

  

    this.hubConnection.on('ReceiveEdited', (editedMessage: any) => {
      const receivedEditedMessage: EditMessageDto = {
        id: editedMessage.id,
        content: editedMessage.content,
      };
      this.sharedEditedObj.next(receivedEditedMessage);
    });

    this.hubConnection.on('ReceiveDeleted', (deletedMessage: any) => {
      console.log(`Received deleted message with ID ${deletedMessage.id}`);
      this.sharedDeletedObj.next(deletedMessage);
    });

   
    this.startConnection();
  }

   async startConnection(): Promise<void> {
    try {
      await this.hubConnection.start();
      console.log('SignalR Connection started');
      this.isConnectionEstablished = true;
      const connectionId = this.hubConnection.connectionId;
      console.log('Connection ID:', connectionId);
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      throw error;
    }
  }

  

  sendMessage(message: any, senderId: any): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('SendMessage', message, senderId)
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

  EditMessage(editMessage: any): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('SendEditedMessage', editMessage)
        .then(() => {
          console.log('Edited message sent successfully');
        })
        .catch((error) => {
          console.error('Error sending edited message:', error);
        });
    } else {
      console.warn('SignalR connection is not established yet.');
    }
  }

  deleteMessage(messageId: number): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('SendDeletedMessage', messageId)
        .then(() => {
          console.log('Deleted message sent successfully');
        })
        .catch((error) => {
          console.error('Error sending deleted message:', error);
        });
    } else {
      console.warn('SignalR connection is not established yet.');
    }
  }

  markAllMessagesAsRead(receiverId: string): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('MarkAllMessagesAsRead', receiverId)
        .then((response: any) => {
          console.log('Response from MarkAllMessagesAsRead:', response);
       
          if (response === "All messages marked as read.") {
         
          } else {
          
          }
        })
        .catch((error) => {
          console.error('Error invoking MarkAllMessagesAsRead:', error);
      
        });
    }
  }

   
   
  

   
  public retrieveDeletedObject(): Subject<Message> {
    return this.sharedDeletedObj;
  }

  public retrieveMappedObject(): Subject<MessageDto> {
    return this.sharedObj;
  }

  public retrieveEditedObject(): Subject<EditMessageDto> {
    return this.sharedEditedObj;
  }

 
}



