import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
// import { environment } from 'src/environments/environment';

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
  private connectionPromise: Promise<void>;

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5243/chatHub') // Update with your SignalR hub URL
      .withAutomaticReconnect()
      .build();

    this.connectionPromise = this.startConnection();
    
  }

  // startConnection(): Promise<void> {
  //   return this.hubConnection
  //     .start()
  //     .then(() => {
  //       console.log('SignalR Connection started');
  //     })
  //     .catch((error) => {
  //       console.error('Error starting SignalR connection:', error);
  //     });
  // }

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

  // Send a message to the SignalR hub
  // sendMessage(message: any) {
  //   console.log('Sending message:', message);
  //   if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
  //     this.hubConnection
  //       .invoke('PostMessage', message)
  //       .then(() => {
  //         console.log('Message sent successfully:', message);
  //       })
  //       .catch((error) => {
  //         console.error('Error sending message:', error);
  //       });
  //   } else {
  //     console.error('SignalR connection not in the Connected state');
  //   }
  // }

  async sendMessage(message: any, senderId: any): Promise<void> {
    await this.connectionPromise;
    if (this.isConnectionEstablished) {
     
      //const senderId = localStorage.getItem('chatMessages.senderId');
      this.hubConnection.invoke('SendMessage', message, senderId);
      console.log('Message sent successfully');
    } else {
      console.warn('SignalR connection is not established yet.');
    }
  }

  // onReceiveMessage(callback: (message: any, senderId: string) => void) {
  //   this.hubConnection.on('ReceiveOne', (message: any, senderId: string) => {
  //     callback(message, senderId);
  //   });
  // }

  async onReceiveMessage(callback: (message: any) => void): Promise<void> {
    await this.connectionPromise;
    if (this.isConnectionEstablished) {
      this.hubConnection.on('ReceiveOne', (message: any, senderId: any) => {
        
        console.log('ReceivedOne:', message);
        callback(message);
      });
    } else {
      console.warn('SignalR connection is not established yet.');
    }
  }
}
