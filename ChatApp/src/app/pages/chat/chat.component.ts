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
import { Subscription } from 'rxjs';


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
  userUnreadMessageCounts: Map<string, number> = new Map<string, number>();
  receiverUnreadCounts: { [receiverId: string]: number } = {};
  receivedMessage: any;
  unreadMessageCountSubscription!: Subscription;
  

  
  

  constructor(private userService: UserService, private router: Router, private ChatService: ChatService, private SignalrService: SignalrService) { }

  ngOnInit(): void {
    // Fetch the list of users
   
    this.userService.retrieveUsers().subscribe(
      (res) => {
        // Store the users with their userIds
        this.users = res.map((user) => ({
          ...user,
          userId: user.id,
          
        }));

        // Subscribe to updates for each user's unread message count
        this.users.forEach((user) => {
          this.userUnreadMessageCounts.set(user.userId, 0);
          this.showMessage(user.id);
          this.subscribeToUnreadMessageCount(user.userId);
        });
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  

  subscribeToUnreadMessageCount(userId: string): void {
    // Subscribe to changes in unread message count for the user
    this.ChatService.getUnreadMessageCount(userId).subscribe(
      (count: any) => {
        // Update the user's unreadMessageCount property
        this.userUnreadMessageCounts.set(userId, count);
        console.log("con", count);
      },
      (error) => {
        console.error('Error fetching unread message count:', error);
      }
    );
  
  
  

    this.SignalrService.allMessagesRead$.subscribe((receiverId) => {
      if (receiverId) {
        console.log(`All messages are marked as read for receiver with ID: ${receiverId}`);
      }
    });

    
    this.SignalrService.unreadMessageCount$.subscribe((count: any) => {
      // Update the unreadMessageCount in real-time
      this.unreadMessageCount = count;
      console.log(count, "hfdushf");
      
    });
      
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

            const userUnreadCount = this.userUnreadMessageCounts.get(id) || 0;
            console.log("t5t", userUnreadCount);
            this.userUnreadMessageCounts.set(
              id,
              Math.max(userUnreadCount - 1, 0),
              );

            this.ChatService.markAllMessagesAsRead(this.currentReceiver).subscribe(
              () => {
                // Update the unread message count for this user
                const updatedCount = Math.max(userUnreadCount - 1, 0);
                this.userUnreadMessageCounts.set(id, updatedCount);

                // Update the receiverUnreadCounts object for this receiver
                this.receiverUnreadCounts[id] = updatedCount;
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
 
