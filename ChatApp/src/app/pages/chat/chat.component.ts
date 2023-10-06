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
  channels: any[] = [];
  showModal: boolean = false;
  showAddMembersModal: boolean = false; // For showing and hiding the modal
  newChannelName: string = '';
  newChannelDescription: string = '';
  selectedUsers: string[] = [];
  selectedChannel: any = null;
  channelEditForm: FormGroup;
  showEditModal!: boolean;

  

  
  

  constructor(private userService: UserService, private router: Router, private ChatService: ChatService, private SignalrService: SignalrService, private ChannelService: ChannelService, private formBuilder: FormBuilder) {
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

    this.channelEditForm = this.formBuilder.group({
      name: [''],
      description: [''],
    });
  }

  
  ngOnInit(): void {
    // Fetch the list of users
    if (this.currentUserId) {
      this.loadChannels();
    }
    else { }
  
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
    const userId = this.currentUserId;
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
 
    this.router.navigate(['/chat', { outlets: { childPopup: ['chat', channel] } }]);
  }
  
  showAddChannelModal() {
    this.showModal = true;
  }

  hideAddChannelModal() {
    this.showModal = false;
  }

  showAddMembersModals() {
    this.showAddMembersModal = true;
  }

  hideAddMembersModal() {
    this.showAddMembersModal = false;
  }


  

  createChannel() {
    // Get the channel name and description
    const channelName = this.newChannelName;
    const channelDescription = this.newChannelDescription;
    const currentUserId = this.currentUserId;

    // Create a new channel object
    const newChannel = {
      name: channelName,
      description: channelDescription,
      members: [this.currentUserId, ...this.selectedUsers], 
    };

    // Send a request to create the channel
    this.ChannelService.createChannel(newChannel).subscribe(
      (response) => {
        // Handle the success response from the server
        console.log('Channel created successfully:', response);

      
        this.newChannelName = '';
        this.newChannelDescription = '';
        this.selectedUsers = [];

        this.hideAddChannelModal();
        this.loadChannels();
      },
      (error) => {
        // Handle any errors from the server
        console.error('Error creating channel:', error);
      }
    );
   
   
  }


  addMembersToChannel() {
    // Ensure a channel is selected
    if (!this.selectedChannel) {
      console.error('No channel selected to add members to.');
      return;
    }

    // Ensure there are selected users to add
    if (this.selectedUsers.length === 0) {
      console.error('No users selected to add to the channel.');
      return;
    }

    // Call the channel service to add members to the selected channel
    this.ChannelService.addMembersToChannel(this.selectedChannel, this.selectedUsers).subscribe(
      (result) => {
        // Members added to the channel successfully
       
        console.log('Members added to the channel:', result);

        // Clear the selected users and channel after adding them to the channel
        this.selectedUsers = [];
        this.selectedChannel = null;

       
        const updatedChannel = this.channels.find((c) => c.id === this.selectedChannel);
        if (updatedChannel) {
       
          updatedChannel.members = result.members;
        }
      },
      (error) => {
        console.error('Error adding members to the channel:', error);
      }
    );
  }
  
 
  openEditChannelModal(channel: any) {
  
    this.channelEditForm.setValue({
      name: channel.name,
      description: channel.description,
    });

    this.showEditModal = true;
     channel.editMode = true;
  }

 
  deleteChannel(channelId: number) {

   
    this.ChannelService.deleteChannel(channelId).subscribe(
      (response) => {
        
        console.log('Channel deleted successfully:', response);

       
        this.channels = this.channels.filter((channel) => channel.channelId !== channelId);
      },
      (error) => {
        // Handle error
        console.error('Error deleting channel:', error);
      }
    );
  }

 

saveEditedChannel(channel: any) {
  
  channel.editMode = false;
}

  submitEditChannel(channel: any) {
    if (this.channelEditForm.valid) {
      const { name, description } = this.channelEditForm.value;
    
      this.ChannelService.updateChannel(channel.channelId, name, description).subscribe(
        (response) => {
          
          console.log('Channel updated successfully:', response);
          this.showEditModal = false; 
          this.loadChannels();
        },
        (error) => {
          
          console.error('Error updating channel:', error);
        }
      );
    }
  }
  
}


 
