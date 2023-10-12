import { Component, OnInit, ChangeDetectorRef, NgZone, Input } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { SignalrService } from '../../services/signalr.service';
import { ChannelService } from '../../services/channel.service';
import * as signalR from '@microsoft/signalr';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { EditMessageDto } from 'Dto/EditMessageDto';
import { MessageDto } from 'Dto/MessageDto';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-chat-channel',
  templateUrl: './chat-channel.component.html',
  styleUrls: ['./chat-channel.component.css']
})
export class ChatChannelComponent implements OnInit {
  currentUserId: string;
  senderId!: string;
  currentReceiverId: string = '';
  currentReceiver: any = {};
  outgoingMessages: any[] = [];
  incomingMessages: any[] = [];
  messages: any[] = [];
  channelMessages: any;
  messageContent: string = '';
  selectedSort: string = 'timestamp';
  selectedOrder: string = 'desc';
  selectedCount: number = 10;
  selectedBefore: string = '';
  selectedAfter: string = '';
  searchQuery: string = '';
  unreadMessageCount: number = 0;
  messageId!: string;
  showUserList: boolean = false;
  channelUsers: any[] = [];
  @Input() selectedChannel: any;
  selectedUsers: any;
  channelMembers: any;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private chatService: ChatService,
    private signalrService: SignalrService,
    private changeDetector: ChangeDetectorRef,
    private ChannelService: ChannelService,
    private ngZone: NgZone,
    private http: HttpClient
  ) {
    this.currentUserId = this.userService.getLoggedInUser().toString();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const channelId = params['channelId'];
      this.currentReceiverId = channelId;

      console.log('currentReceiverId:', this.currentReceiverId);

      this.getchannelMessages(channelId);
      this.decode_token();

      // this.getMessages(
      //   this.currentReceiverId,
      //   this.selectedSort,
      //   this.selectedOrder,
      //   this.selectedCount,
      //   this.selectedBefore,
      //   this.selectedAfter
      // )
      this.fetchChannelMembers();
    });


    this.signalrService.retrieveMappedObject().subscribe((receivedMessage: MessageDto) => {
      console.log('Received message:', receivedMessage);
      this.changeDetector.detectChanges();


    
      
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

    this.signalrService.receiveChannelMessages().subscribe((receivedMessage: any) => {
      console.log('Received channel message:', receivedMessage);

  
      if (receivedMessage.channelId === this.currentReceiverId) {
  
        if (receivedMessage.senderId !== this.currentUserId) {
      
          this.messages.push({
            id: receivedMessage.id,
            channelId: receivedMessage.channelId,
            content: receivedMessage.content,
            senderId: receivedMessage.senderId,
          });
          this.changeDetector.detectChanges();
          this.channelMessages.push(receivedMessage);
        }
      }
    });

    this.signalrService
    .receiveDeletedChannelMessage()
    .subscribe((deletedMessageId: any) => {
      // Handle the deleted message here
      console.log(`Received deleted message with ID ${deletedMessageId}`);
      this.changeDetector.detectChanges();
    });

    
};
      


    

  

  getchannelMessages(channelId: any) {
    this.ChannelService.getMessages(channelId).subscribe((res) => {
      console.log(res);
      this.channelMessages = res;
    });
    console.log(channelId);
  }

  // getMessages(
  //   userId: string,
  //   sort: string,
  //   order: string,
  //   count: number,
  //   before: string,
  //   after: string
  // ) {
   
  //   this.chatService
  //     .getMessages(userId, sort, order, count, before, after)
  //     .subscribe((res) => {
  //       this.messages = res;

  //       console.log('getMessages messages:', this.messages);
 
  //     });
  // }


  applyFilters(): void {

    // this.getMessages(
    //   this.currentReceiverId,
    //   this.selectedSort,
    //   this.selectedOrder,
    //   this.selectedCount,
    //   this.selectedBefore,
    //   this.selectedAfter
    // );
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

  

  onContextMenu(event: MouseEvent, message: any) {
    event.preventDefault();
    if (message.senderId !== this.currentReceiverId) {
      message.isEvent = !message.isEvent;
    }
    this.sendMessageToChannel();
  }


  onAcceptEdit(message: any) {
    
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
        
      }
    );
  }


  onDeclineEdit(message: any) {
    // Revert back to original content and close the inline editor
    message.editMode = false;
  }

  onEditMessage(message: any) {
    if (message.senderId !== this.currentReceiverId) {
      message.editMode = true;
      message.editedContent = message.content;
      message.showContextMenu = true;
    }
  }

 onAcceptDelete(message: any) {
  // Check if the sender is the current user
  this.ChannelService.deleteMessage(this.currentReceiverId, message.id).subscribe(
    () => {
      // Remove the deleted message from the UI
      const index = this.messages.findIndex((m) => m.id === message.id);
      if (index !== -1) {
        this.messages.splice(index, 1);
        this.changeDetector.detectChanges();
      }

      // Send a delete request using SignalR
      this.signalrService.deleteChannelMessage(message.id);
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
    if (message.senderId === this.currentUserId) {
      message.deleteMode = true;
      message.showContextMenu = true;
    }
  }

 
  toggleUserList() {
    this.showUserList = !this.showUserList;

    if (this.showUserList) {
      // Fetch and display members when user list is opened
      this.fetchChannelMembers();
    }
  }

  fetchChannelMembers() {

    this.ChannelService.getMembersInChannel(this.currentReceiverId).subscribe(
      (members) => {
        this.channelUsers = members;
      },
      (error) => {
        console.error('Error fetching channel members:', error);
      }
    );
  }

  
  deleteMembersFromChannel(channelId: any, memberIds: string[]) {
    this.ChannelService.deleteMembersFromChannel(channelId, memberIds).subscribe(
      (response) => {
        console.log("Members deleted from the channel successfully.");
   
        //  this.removeDeletedMembersFromList(memberIds);
        this.fetchChannelMembers();
      },
      (error) => {
        console.error("Error deleting members from the channel:", error);
     
      }
    );
  }
  
  sendMessageToChannel() {
    if (this.messageContent.trim() === '') {
      // Don't send an empty message
      return;
    }

    this.ChannelService.sendMessageToChannel(this.currentReceiverId, this.messageContent).subscribe(
      (response) => {
        this.messageContent = '';
        console.log(response);
        if (response) {
          this.signalrService.sendChannelMessage(response);
          // this.messages.push(response); 
          // this.changeDetector.detectChanges();
         
          this.messages.push({
            id: response.id,
            channelId: response.channelId,
            content: response.content,
          });
          
          this.changeDetector.detectChanges();
        } else {
      
          console.error('Error sending message:', response.error);
        }
      },
      (error) => {
        console.error('Error sending message:', error);
      }
    );
  }
  
  decode_token() {
    const token = localStorage.getItem("auth_token");
    if (token) {
      const decodedToken: any = jwt_decode(token);
      console.log(decodedToken, "is the");
     const userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      console.log("The userId id", userId);
      this.currentUserId = userId;
    }

  }


  deleteChannelMessage(message: any) {
     
    // Check if the sender is the current user
    if (message.senderId === this.currentUserId) {

       message.deleteMode = true;
       message.showContextMenu = true;
      // Call the service to delete the message
      this.ChannelService.deleteMessage(this.currentReceiverId, message.id).subscribe(
        () => {
          // Remove the deleted message from the UI
          const index = this.messages.findIndex((m) => m.id === message.id);
          if (index !== -1) {
            this.messages.splice(index, 1);
          }
          this.changeDetector.detectChanges();
          // Send a delete request using SignalR
          this.signalrService.deleteChannelMessage(message.id);
        },
        (error) => {
          console.error('Error deleting message:', error);
        }
      );
    }
  }

  

}






  
  


