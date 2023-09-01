import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import { UserService } from 'src/app/services/user.service';
import { SignalrService } from 'src/app/services/signalr.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { MessageDto } from 'Dto/MessageDto';

import { EditMessageDto } from 'Dto/EditMessageDto';

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
    private changeDetector: ChangeDetectorRef,
    private ngZone: NgZone,
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



  this.signalrService.retrieveMappedObject().subscribe((receivedMessage: MessageDto) => {
      console.log('Received message:', receivedMessage);
    
      this.signalrService.retrieveEditedObject().subscribe((receivedEditedMessage: EditMessageDto) => {
      console.log('Received edited message:', receivedEditedMessage);
     
    });

     // Check if the received message already exists in the messages array
    const existingMessage = this.messages.find(message => message.id === receivedMessage.id);

    if (!existingMessage) {
      this.messages.push(receivedMessage);

      // Sort the messages array by timestamp in descending order
        this.messages.sort((a, b) => b.timestamp - a.timestamp);

      // You may also want to trigger change detection here
        this.changeDetector.detectChanges();
    }
  });
    
    
  this.signalrService.retrieveEditedObject().subscribe((receivedEditedMessage: EditMessageDto) => {
        // Handle received edited messages
        console.log('Received edited message:', receivedEditedMessage);
        // Find the corresponding message in the 'messages' array by 'id'
  
  
    const editedMessageIndex = this.messages.findIndex((m) => m.id === receivedEditedMessage.id);

    if (editedMessageIndex !== -1) {
      // Update the content of the edited message
      this.messages[editedMessageIndex].content = receivedEditedMessage.content;

      // Trigger Angular's change detection to update the UI
      this.changeDetector.detectChanges();
    }
  });
    
    
    this.signalrService.retrieveDeletedObject().subscribe((deletedMessageId: any) => {
    // Find the message by ID and remove it from the 'messages' array
    const index = this.messages.findIndex((message) => message.id === deletedMessageId);
    if (index !== -1) {
      this.messages.splice(index, 1);
    }
  });
    
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
    }
  }

  getMessages(userId: string) {
   
    console.log(userId);

    this.chatService.getMessages(userId).subscribe((res) => {
      console.log('getMessages response:', res);
      this.messages = res;

      
      console.log('getMessages messages:', this.messages);
    });
  }

  sendMessage() {
    if (this.messageContent.trim() === '') {
      // Don't send an empty message
      return;
    }


    this.chatService
      .sendMessage(this.currentReceiverId, this.messageContent.trim())
      .subscribe(
        (response) => {
          this.messageContent = '';
          console.log(response);
          // Handle the response from the backend if needed

          const message = {
            id: response.id,
            receiverId: response.receiverId,
            content: response.content,
          };

          
          this.signalrService.sendMessage(message, response.senderId);
        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
  }

  onContextMenu(event: MouseEvent, message: any) {
    event.preventDefault();
    if (message.senderId !== this.currentReceiverId) {
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
        
        // Create an editMessage object with the edited content
        const editMessage = new EditMessageDto(message.id, message.editedContent);
        console.log(editMessage);
        
        // Send the edited message through SignalR
        this.signalrService.EditMessage(editMessage);
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
    console.log(message);
    console.log(message.senderId == this.currentReceiverId);
    console.log(message.senderId);
    console.log(this.currentReceiverId);
    
    
    
    
    if (message.senderId !== this.currentReceiverId) {
      console.log("hiii");
      message.editMode = true;
      message.editedContent = message.content;
      message.showContextMenu = true; 
    }
  }

  onAcceptDelete(message: any) {
  this.chatService.deleteMessage(message.id).subscribe(
    () => {
      const index = this.messages.findIndex((m) => m.id === message.id);
      if (index !== -1) {
        this.messages.splice(index, 1); // Remove the message from the array
      }

      // Send a delete request using SignalR
      this.signalrService.deleteMessage(message.id);
    },
    (error) => {
      console.error('Error deleting message:', error);
     
    }
  );
}

  onDeclineDelete(message: any) {
  // Revert back to the original content and close the inline editor
  message.deleteMode = false;
  }
  

  onDeleteMessage(message: any) {
  if (message.senderId !== this.currentReceiverId) {
    message.deleteMode = true;
    message.showContextMenu = true; 
  }
}

}
