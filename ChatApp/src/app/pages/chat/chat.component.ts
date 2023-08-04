import { Component, OnInit } from '@angular/core';
import { Router, Route } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  users: any[] = [];
  currentReceiver: any;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.retrieveUsers().subscribe((res) => {
      console.log(res);
      this.users = res;
      this.currentReceiver = res[0];
    });
  }

  onUserClick(user: any) {
    console.log(user);

    this.currentReceiver = user;
  }

  showMessage(id: any) {
    this.router.navigate(['/chat', { outlets: { childPopup: ['user', id] } }]);
  }
}
