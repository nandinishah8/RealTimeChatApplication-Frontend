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
   selectedSort: string = 'timestamp'; 
  selectedOrder: string = 'desc'; 
   selectedCount: number = 10; 
  selectedBefore: string = '';
  selectedAfter: string = ''; 
  searchQuery: string = '';

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

      this.getMessages(
      this.currentReceiverId,
      this.selectedSort,
      this.selectedOrder,
      this.selectedCount,
      this.selectedBefore,
      this.selectedAfter
    );

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

    
    const existingMessage = this.messages.find(message => message.id === receivedMessage.id);

    if (!existingMessage) {
      this.messages.push(receivedMessage);

      
        this.messages.sort((a, b) => b.timestamp - a.timestamp);
        this.changeDetector.detectChanges();
    }
  });
    
    
  this.signalrService.retrieveEditedObject().subscribe((receivedEditedMessage: EditMessageDto) => {
        console.log('Received edited message:', receivedEditedMessage);
  
  
    const editedMessageIndex = this.messages.findIndex((m) => m.id === receivedEditedMessage.id);

    if (editedMessageIndex !== -1) {
      this.messages[editedMessageIndex].content = receivedEditedMessage.content;
      this.changeDetector.detectChanges();
    }
  });
    
    
    this.signalrService.retrieveDeletedObject().subscribe((deletedMessageId: any) => {
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

  getMessages(
    userId: string,
    sort: string,
    order: string,
    count: number,
    before: string,
    after: string
  ) {
    // Modify your getMessages function to accept filter parameters and send them to the chatService
    this.chatService
      .getMessages(userId, sort, order, count, before, after)
      .subscribe((res) => {
        this.messages = res;

        console.log('getMessages messages:', this.messages);
      });
  }

  
  applyFilters(): void {
    // Call the getMessages function with the selected filter options
    this.getMessages(
      this.currentReceiverId,
      this.selectedSort,
      this.selectedOrder,
      this.selectedCount,
      this.selectedBefore,
      this.selectedAfter
    );
  }

  searchMessages(): void {
    if (this.searchQuery.trim() === '') {
      // Don't search with an empty query
      return;
    }

    this.chatService.searchMessages(this.searchQuery).subscribe((res) => {
      this.messages = res;

      console.log('Search results:', this.messages);
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
