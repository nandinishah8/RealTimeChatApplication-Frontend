import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MessageDto } from 'Dto/MessageDto';
import { Subject, Observable } from 'rxjs';
// import { environment } from 'src/environments/environment';
// import { Message } from 'Message.model';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  // token = localStorage.getItem('authToken');
  // private connection: any = new signalR.HubConnectionBuilder()
  //   .withUrl(`https://localhost:7223/chat?token=${this.token}`)
  //   .configureLogging(signalR.LogLevel.Information)
  //   .build();

  private hubConnection: signalR.HubConnection;
  private isConnectionEstablished: boolean = false;
  private connectionPromise: Promise<void> | undefined;
  private sharedObj = new Subject<MessageDto>();

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5243/chatHub') 
      .withAutomaticReconnect()
      .build();

    
    this.hubConnection.on("ReceiveOne", (message: any, senderId: any) => {
      const receivedMessageObject: MessageDto = {
        id: message.id,
        senderId: senderId,
        receiverId: message.receiverId,
        content: message.content
      };
      this.sharedObj.next(receivedMessageObject);
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

  // onReceiveMessage(callback: (message: any, senderId: string) => void) {
  //   this.hubConnection.on('ReceiveOne', (message: any, senderId: string) => {
  //     callback(message, senderId);
  //   });
  // }

  async onReceiveMessage( message: any, senderId: string)  {
    await this.connectionPromise;
    if (this.isConnectionEstablished) {
      this.hubConnection.on('ReceiveOne', (message: any, senderId: any) => {
        
        console.log('ReceivedOne:', message);
         const receivedMessageObject: MessageDto = {
          id: message.id,
          senderId: senderId,
          receiverId: message.receiverId,
          content: message.content
        };
        // callback(message, senderId);
        //this.sharedObj.next(receivedMessageObject);
      });
    } else {
      console.warn('SignalR connection is not established yet.');
    }
  }

  public retrieveMappedObject(): Subject<MessageDto> {
    return this.sharedObj;
  }

}
