import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
// import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;
  private reconnectInterval = 5000;

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5243/chatHub') // Replace with your SignalR hub URL
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.onclose((error) => {
      console.error('SignalR Connection closed with an error:', error);
      this.startReconnection(); // Attempt to reconnect
    });
  }

  public startConnection(): Promise<void> {
    return this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connection started');
        const connectionId = this.hubConnection.connectionId;
        console.log('Connection ID:', connectionId);
      })
      .catch((error) => {
        console.error('Error starting SignalR connection:', error);
        // Retry the connection after a delay
        setTimeout(() => {
          this.startConnection();
        }, 5000);
      });
  }

  private startReconnection() {
    setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.startConnection();
    }, this.reconnectInterval);
  }

  sendMessage(message: {
    receiverId: string;
    senderId: string;
    content: string;
  }) {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('SendMessage', message);
    } else {
      console.error('SignalR connection not in the Connected state');
    }
  }

  onReceiveMessage(callback: (message: any) => void) {
    this.hubConnection.on('ReceiveMessage', (message: any) => {
      callback(message);
    });
  }
}
