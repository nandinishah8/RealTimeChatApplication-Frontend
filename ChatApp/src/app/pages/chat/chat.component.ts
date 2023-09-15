import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, Route } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { ChatService } from '../../services/chat.service';
import { SignalrService } from '../../services/signalr.service';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { Message } from 'Dto/Message';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  users: any[] = [];
  currentReceiver: any;
  unreadMessageCount: number = 0;
  currentUserId!: string;
  changeDetector: any;
  
  

  constructor(private userService: UserService, private router: Router, private ChatService: ChatService, private SignalrService: SignalrService) { }

  ngOnInit(): void {
    this.userService.retrieveUsers().subscribe(
      (res) => {
        this.users = res;
        if (Array.isArray(this.users)) {
          this.currentReceiver = this.users[0];

          this.users.forEach((user) => {
            const userId = user.id;

            this.ChatService.getUnreadMessageCount(userId).subscribe(
              (count: any) => {
                user.unreadMessageCount = count.unreadCount;
                console.log('Unread message count for user', user.name, ':', count.unreadCount);
              },
              (error) => {
                console.error('Error fetching unread message count:', error);
              }
            );
          });
        } else {
          console.error('this.users is not an array.');
        }
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );

    this.SignalrService.allMessagesRead$.subscribe((receiverId) => {
      if (receiverId) {
        console.log(`All messages are marked as read for receiver with ID: ${receiverId}`);
      }
    });

     this.SignalrService.unreadMessageCount$.subscribe((count: any) => {
        console.log(count);
        
        // Update the unreadMessageCount in real-time
        this.unreadMessageCount = count;
        console.log(this.unreadMessageCount);
        // this.changeDetector.detectChanges();
      });
      
  }


  onUserClick(user: any) {
    console.log(user);

    this.currentReceiver = user;
  }

  showMessage(id: string) {
    this.router.navigate(['/chat', { outlets: { childPopup: ['user', id] } } ]);

    const user = this.users.find((u) => u.id === id);

    if (user) {
      if (user.messages) {
        user.messages.forEach((message: any) => {
          if (!message.seen) {
            message.seen = true;

            user.unreadMessageCount = Math.max(user.unreadMessageCount - 1, 0);
            console.log('Updated unread message count:', user.unreadMessageCount);

            this.ChatService.markAllMessagesAsRead(this.currentReceiver).subscribe(
              () => {
                // Update the unread message count in the UI
                user.unreadMessageCount = Math.max(user.unreadMessageCount - 1, 0);
              },
              (error) => {
                console.error('Error marking message as seen:', error);
              }
            );
          }
        });
      }
    }
  }
}
 
