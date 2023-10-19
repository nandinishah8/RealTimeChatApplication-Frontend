import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, Route } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { ChatService } from '../../services/chat.service';
import { SignalrService } from '../../services/signalr.service';
import { ChannelService } from 'src/app/services/channel.service';
import jwt_decode from 'jwt-decode';
import { ChangeDetectorRef } from '@angular/core';


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
  showAddMembersModal: boolean = false; 
  newChannelName: string = '';
  newChannelDescription: string = '';
  selectedUsers: string[] = [];
  selectedChannel: any = null;
  channelEditForm: FormGroup;
  showEditModal!: boolean;
  channelId: string = '';
  
  

  
  

  constructor(private userService: UserService, private router: Router, private ChatService: ChatService, private SignalrService: SignalrService, private ChannelService: ChannelService, private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) {
    const token = localStorage.getItem('auth_token');
    console.log('JWT Token:', token);

    if (token) {
      try {
       
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
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

      this.SignalrService.getNewChannelsObservable().subscribe((newChannel) => {
      console.log('New channel received:', newChannel);
      
        this.channels.push(newChannel);
        this.cdr.detectChanges();
      });
    
   this.SignalrService.receiveUpdatedChannel().subscribe((updatedChannel: any) => {
 
  console.log('Received updated channel:', updatedChannel);
     const index = this.channels.findIndex((channel) => channel.channelId === updatedChannel.channelId);
     
   

  if (index !== -1) {
    this.channels[index] = updatedChannel;
  }

 
  console.log('Channels:', this.channels);

 
  this.cdr.detectChanges();
   });
    
    this.SignalrService.receiveDeletedChannel().subscribe((channelId: any) => {
 
      console.log('Received deleted channel:', channelId);
      const index = this.channels.findIndex((channel) => channel.channelId === channelId);
      if (index !== -1) {
         
        this.channels.splice(index, 1);
  }

    }
    );
  
  
  }

  
  ngOnInit(): void {
    
    if (this.currentUserId) {
      this.loadChannels();
    }
    else { }
  
    this.userService.retrieveUsers().subscribe(
      (res) => {
        this.users = res.map((user) => ({ ...user, userId: user.id }));
        this.loadChannels();
       
      }),

     
      this.users.forEach((user) => {
         
        this.showMessage(user.id);
      });
    (error: any) => {
      console.error('Error fetching users:', error);
    }
      ;
  }

  loadChannels() {
   
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

   
    const newChannel = {
      name: channelName,
      description: channelDescription,
      members: [this.currentUserId, ...this.selectedUsers], 
    };

    
    this.ChannelService.createChannel(newChannel).subscribe(
      (response) => {
       
        console.log('Channel created successfully:', response);

      
        this.newChannelName = '';
        this.newChannelDescription = '';
        this.selectedUsers = [];

        this.hideAddChannelModal();
        this.loadChannels();
      },
      (error) => {
        
        console.error('Error creating channel:', error);
      }
    );
   
   
  }


  addMembersToChannel() {
    
    if (!this.selectedChannel) {
      console.error('No channel selected to add members to.');
      return;
    }

    
    if (this.selectedUsers.length === 0) {
      console.error('No users selected to add to the channel.');
      return;
    }

    
    this.ChannelService.addMembersToChannel(this.selectedChannel, this.selectedUsers).subscribe(
      (result) => {
      
       
        console.log('Members added to the channel:', result);

      
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

    this.selectedChannel = channel;
    this.showEditModal = true;
    channel.editMode = true;
  }


 
  deleteChannel(channelId: number) {

   
    this.ChannelService.deleteChannel(channelId).subscribe(
      (response) => {
        
        console.log('Channel deleted successfully:', response);

       
        this.SignalrService.deleteChannel(channelId);
        this.channels = this.channels.filter((channel) => channel.channelId !== channelId);
        console.log(channelId);
        this.cdr.detectChanges();
      },
      (error) => {
      
        console.error('Error deleting channel:', error);
      }
    );
  }

  
  submitEditChannel(channel: any) {
    console.log(channel);
  if (this.selectedChannel) {
    const { name, description } = this.selectedChannel;

    this.ChannelService.updateChannel(this.selectedChannel.channelId, name, description).subscribe(
      (response) => {
        console.log('Channel updated successfully:', response);

        
        this.SignalrService.editChannel(this.selectedChannel.channelId, {
          name: name,
          description: description,
        });

        
        this.showEditModal = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error updating channel:', error);
      }
    );
  }
}

  
}


 
