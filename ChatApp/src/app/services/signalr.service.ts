import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
// import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  token = localStorage.getItem('authToken');
  private connection: any = new signalR.HubConnectionBuilder()
    .withUrl(`https://localhost:7223/chat?token=${this.token}`)
    .configureLogging(signalR.LogLevel.Information)
    .build();
  private hubConnection: HubConnection;
  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5243/chatHub') // Update with your SignalR hub URL
      .withAutomaticReconnect()
      .build();
  }

  startConnection() {
    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connection started');
      })
      .catch((err) => {
        console.error('Error while starting SignalR connection:', err);
      });
  }

  // Send a message to the SignalR hub
  sendMessage(message: any) {
    this.hubConnection
      .invoke('SendMessage', message)
      .catch((error) => console.error('SignalR Error:', error));
  }

  onReceiveMessage(callback: (message: any) => void) {
    this.hubConnection.on('ReceiveMessage', (message: any) => {
      callback(message);
    });
  }
}
