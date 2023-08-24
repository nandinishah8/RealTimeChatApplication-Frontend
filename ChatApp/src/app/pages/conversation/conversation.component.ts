import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import { UserService } from 'src/app/services/user.service';
import { SignalrService } from 'src/app/services/signalr.service';
//import { Message } from 'Message.model';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css'],
})
export class ConversationComponent implements OnInit {
  currentUserId: string;
  senderId!: string;
  currentReceiverId!: string;
  currentReceiver: any = {};
  outgoingMessages: any[] = [];
  incomingMessages: any[] = [];
  messages: any[] = [];
  messageContent: string = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private chatService: ChatService,
    private signalrService: SignalrService,
    private http: HttpClient
  ) {
    this.currentUserId = this.userService.getLoggedInUser().toString();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const userId = params['userId'];
      this.currentReceiverId = userId;

      console.log('currentReceiverId:', this.currentReceiverId);

      this.getMessages(this.currentReceiverId);

      this.userService.retrieveUsers().subscribe((res) => {
        this.currentReceiver = res.find(
          (user) => user.UserId === this.currentReceiverId
        );
      });
    });

    this.signalrService.onReceiveMessage((receivedMessage: any) => {
      console.log('Received message:', receivedMessage);

      const isReceived = receivedMessage.receiverId === this.currentUserId;

      //   const newReceivedMessage = {
      //     senderId: senderId,
      //     receiverId: receivedMessage.receiverId,
      //     content: receivedMessage.content,
      //     timestamp: receivedMessage.timestamp,
      //     isReceived: isReceived,
      //   };
      //   this.messages.push(newReceivedMessage);
      // }
      const newReceivedMessage = {
        senderId: receivedMessage.senderId,
        receiverId: receivedMessage.receiverId,
        content: receivedMessage.content,
        timestamp: receivedMessage.timestamp,
        isReceived: isReceived,
      };
      this.messages.push(newReceivedMessage);
    });

    // this.signalrService.onReceiveMessage((message: any) => {
    //   if (message.senderId === this.currentUserId) {
    //     this.outgoingMessages.push(message);
    //   } else {
    //     this.incomingMessages.push(message);
    //   }
    // });

    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
    }
  }

  getMessages(userId: string) {
    //this.messages = [];
    console.log(userId);

    this.chatService.getMessages(userId).subscribe((res) => {
      console.log('getMessages response:', res);
      this.messages = res;

      // Extract userId and conversationId from the fetched messages
      this.currentUserId = this.messages[0].senderId;
      this.currentReceiverId = this.messages[0].receiverId;
      console.log('getMessages messages:', this.messages);
    });
  }

  sendMessage() {
    if (this.messageContent.trim() === '') {
      // Don't send an empty message
      return;
    }

    // const message = {
    //   receiverId: this.currentReceiverId,
    //   senderId: this.currentUserId,
    //   content: this.messageContent.trim(),
    //   isEvent: false,
    // };

    // console.log('Sending message from component:', message);

    // this.messages.push({
    //   senderId: this.currentUserId,
    //   receiverId: this.currentReceiverId,
    //   content: message.content,
    //   timestamp: new Date(),
    //   isReceived: false,
    // });
    // localStorage.setItem('chatMessages', JSON.stringify(this.messages));

    // this.signalrService.sendMessage(message);
    // // this.signalrService.onReceiveMessage((receivedmessage: any) => {
    // //   console.log('Received message:', receivedmessage);
    // // });

    this.chatService
      .sendMessage(this.currentReceiverId, this.messageContent.trim())
      .subscribe(
        (response) => {
          this.messageContent = '';
          console.log(response);
          // Handle the response from the backend if needed

          const message = {
            receiverId: response.receiverId,
            content: response.content,
          };

          
          this.signalrService.sendMessage(message, response.senderId);


          this.messages.push(response);
          this.messageContent = '';
        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
  }

  onContextMenu(event: MouseEvent, message: any) {
    event.preventDefault();
    if (message.senderId === this.currentUserId) {
      message.isEvent = !message.isEvent;
    }
    this.sendMessage();
  }

  onAcceptEdit(message: any) {
    // Update the message content with edited content
    message.content = message.editedContent;
    message.editMode = false;
    console.log(message);

    this.chatService.editMessage(message.id, message.content).subscribe(
      (res) => {
        const editedMessageIndex = this.messages.findIndex(
          (m) => m.id === message.id
        );
        if (editedMessageIndex !== -1) {
          this.messages[editedMessageIndex].content = message.editedContent;
        }
      },
      (error) => {
        console.error('Error editing message:', error);
        // Handle the error if needed
      }
    );
  }

  onDeclineEdit(message: any) {
    // Revert back to original content and close the inline editor
    message.editMode = false;
  }

  onEditMessage(message: any) {
    if (message.senderId === this.currentUserId) {
      message.editMode = true;
      message.editedContent = message.content;
      message.showContextMenu = true; // Add a property to control the context menu visibility
    }
  }

  onAcceptDelete(message: any) {
    this.chatService.deleteMessage(message.id).subscribe(
      () => {
        const index = this.messages.findIndex((m) => m.id === message.id);
        if (index !== -1) {
          this.messages.splice(index, 1); // Remove the message from the array
        }
      },
      (error) => {
        console.error('Error deleting message:', error);
        // Handle the error if needed
      }
    );
  }

  onDeclineDelete(message: any) {
    // Revert back to original content and close the inline editor
    message.deleteMode = false;
  }

  onDeleteMessage(message: any) {
    if (message.senderId === this.currentUserId) {
      message.deleteMode = true;
      message.showContextMenu = true; // Add a property to control the context menu visibility
    }
  }
}
