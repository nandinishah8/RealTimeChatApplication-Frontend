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
  private channelMessagesSubject = new Subject<any>();
  private newChannelSubject = new Subject<any>();
  private updatedChannelSubject: Subject<any> = new Subject<any>();
 
  
 
 
  

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5243/chatHub') 
      .withAutomaticReconnect()
      .build();
    
     
    
      this.hubConnection.on('ReceiveOne', (message: any, senderId: any) => {
      const receivedMessageObject: MessageDto = {
        id: message.id,
        senderId: senderId,
        receiverId: message.receiverId,
        content: message.content,
        };
        
      this.sharedObj.next(receivedMessageObject);
      });
    
     this.hubConnection.on('ReceiveChannel', (newChannel: any) => {
      this.newChannelSubject.next(newChannel);
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

     this.hubConnection.on('ReceiveChannelMessage', (message) => {
      this.channelMessagesSubject.next(message);
     });
    
     this.hubConnection.on('ReceiveUpdatedChannel', (updatedChannel: any) => {
      // Notify subscribers about the updated channel
      this.updatedChannelSubject.next(updatedChannel);
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


   createChannel(channel: any) {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('CreateChannel', channel)
        .then(() => {
          console.log('Channel created successfully');
        })
        .catch((error) => {
          console.error('Error creating channel:', error);
        });
    } else {
      console.warn('SignalR connection is not established yet.');
    }
  }

   editChannel(channelId: any, updatedChannel: any) {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('EditChannel', channelId, updatedChannel)
        .then(() => {
          console.log('EditChannel request sent successfully',channelId,updatedChannel);
        })
        .catch((error) => {
          console.error('Error sending EditChannel request:', error);
        });
    } else {
      console.warn('SignalR connection is not established yet.');
    }
  }

  deleteChannel(channelId: any) {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('DeleteChannel', channelId)
        .then(() => {
          console.log('DeleteChannel request sent successfully',channelId);
        })
        .catch((error) => {
          console.error('Error sending DeleteChannel request:', error);
        });
    } else {
      console.warn('SignalR connection is not established yet.');
    }
  }
  

  sendChannelMessage(message: any) {
      if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
        this.hubConnection.invoke('SendChannelMessage', message)
        .then(() => {
          console.log('message sent successfully');
        })
         .catch((error) => {
          console.error('Error sending  message:', error);
        });
    } else {
      console.warn('SignalR connection is not established yet.');
    }
  }

  EditChannelMessage(editMessage: any): void {
    console.log("hio");
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('EditChannelMessage', editMessage)
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

  

  deleteChannelMessage(messageId: any): void {
  if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
    this.hubConnection
      .invoke('DeleteChannelMessage', messageId)
      .then(() => {
        console.log('Deleted channel message sent successfully');
      })
      .catch((error) => {
        console.error('Error sending deleted channel message:', error);
      });
  } else {
    console.warn('SignalR connection is not established yet.');
  }
  }
  
  receiveDeletedChannelMessage() {
  return new Observable((subscriber) => {
    this.hubConnection.on('ReceiveDeletedChannelMessage', (messageId: any) => {
      subscriber.next(messageId);
    });
  });
  }
  
  receiveEditedChannelMessage() {
  return new Observable((subscriber) => {
    this.hubConnection.on('ReceiveChannelEdited', (message: any) => {
      subscriber.next(message);
    });
  });
  }
  
  receiveChannelMessages() {
    return new Observable((subscriber) => {
      this.hubConnection.on('ReceiveChannelMessage', (message: any) => {
      subscriber.next(message);
    });
    });

  }

  receiveUpdatedChannel() {
    return new Observable((subscriber) => {
      this.hubConnection.on('ReceiveUpdatedChannel', (channelId:any,message: any) => {
        console.log(message);
        console.log(channelId);
        const msg = { channelId: channelId, name: message.name, description: message.description, createdAt: message.createdAt }
        subscriber.next(msg);
      });
    });
  }

  receiveDeletedChannel() {
    return new Observable((subscriber) => {
      this.hubConnection.on('ReceiveDeletedChannel', (channelId:any) => {
       
        console.log(channelId);
    
        subscriber.next(channelId);
      });
    });
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

 public retrieveChannelEditedObject(): Subject<EditMessageDto> {
    return this.sharedEditedObj;
  }

  public getNewChannelsObservable(): Observable<any> {
    return this.newChannelSubject.asObservable();
  }

  
}



