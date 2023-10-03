import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, Route } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { ChatService } from '../../services/chat.service';
import { SignalrService } from '../../services/signalr.service';
import { ChannelService } from 'src/app/services/channel.service';
import jwt_decode from 'jwt-decode';

import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { Message } from 'Dto/Message';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  users: any[] = [];
  currentReceiver: any;
  currentUserId: string = '';
  changeDetector: any;
  receivedMessage: any;
  channels: any[] = [];
  

  
  

  constructor(private userService: UserService, private router: Router, private ChatService: ChatService, private SignalrService: SignalrService, private ChannelService: ChannelService)
  {
     const jwtToken = localStorage.getItem('token');
    console.log('JWT Token:', jwtToken);

    if (jwtToken) {
      try {
       
        const tokenPayload = JSON.parse(atob(jwtToken.split('.')[1]));
        console.log('Token Payload:', tokenPayload);


       
        this.currentUserId = tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        console.log(this.currentUserId);
      } catch (error) {
        console.error('Error parsing JWT token:', error);
      }
    }
   }

  
  ngOnInit(): void {
    // Fetch the list of users
     if (this.currentUserId) {
     
      this.loadChannels();
     }
     
     else {
       
    }
  
   
  
   
    this.userService.retrieveUsers().subscribe(
      (res) => {
        this.users = res.map((user) => ({ ...user, userId: user.id }));
        this.loadChannels(); 
       
      }),

        // Subscribe to updates for each user's unread message count
        this.users.forEach((user) => {
         
          this.showMessage(user.id);
        });
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    ;
  }

  loadChannels() {
    // Fetch the list of channels based on the user's ID
    this.ChannelService.getChannels().subscribe(
      (res) => {
        this.channels = res;
        console.log(res);
      },
      (error) => {
        console.error('Error fetching channels:', error);
      }
    );
  }

  onUserClick(user: any) {
    console.log(user);

    this.currentReceiver = user;
  }


 showMessage(id: string) {
    this.router.navigate(['/chat', { outlets: { childPopup: ['user', id] } }]);
    const user = this.users.find((u) => u.id === id);

    if (user) {
      if (user.messages) {
        user.messages.forEach((message: any) => {
          if (!message.seen) {
            message.seen = true;

          }
        });
      }
    }
  }

  onChannelClick(channel: any) {
 
  this.router.navigate(['/chat',  { outlets: { childPopup: ['chat', channel] } }]);
}
}
 
