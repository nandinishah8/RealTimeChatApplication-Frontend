import { Component, OnInit } from '@angular/core';
import { Router, Route } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { ChatService } from '../../services/chat.service';
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
  

  constructor(private userService: UserService, private router: Router, private ChatService: ChatService) {}

  ngOnInit(): void {


    console.log('Initializing component...');

    
      
    this.userService.retrieveUsers().subscribe(
      (res) => {
        console.log('Received users:', res);
        console.log('Is res an array?', Array.isArray(res));

        this.users = res; 
        console.log('this.users:', this.users);

        if (Array.isArray(this.users)) {
          console.log('this.users is an array:', this.users);

          this.currentReceiver = this.users[0];

          this.users.forEach((user) => {
            console.log('User name:', user.name);
            console.log('User email:', user.email);

           
        });
      } else {
        console.error('this.users is not an array.');
      }
    },
    (error) => {
      console.error('Error fetching users:', error);
    }
  );
}
 

  onUserClick(user: any) {
    console.log(user);

    this.currentReceiver = user;
  }

  showMessage(id: string) {
    this.router.navigate(['/chat', { outlets: { childPopup: ['user', id] } }]);
    
  }



}
