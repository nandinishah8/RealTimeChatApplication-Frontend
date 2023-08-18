import { Component, OnInit } from '@angular/core';
import { SignalrService } from './services/signalr.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  messages: any[] = [];
  constructor(private SignalrService: SignalrService) {}
  // title = 'ChatApp';

  ngOnInit() {
    this.SignalrService.startConnection();

    // Listen for incoming messages
    this.SignalrService.onReceiveMessage((message: any) => {
      console.log('Received message:', message);
      // Handle the incoming message and update UI
      this.messages.push(message);
    });
  }
}
