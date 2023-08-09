import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { SocialUser } from '@abacritt/angularx-social-login';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  private accessToken = '';
  socialuser!: SocialUser;
  loggedIn!: boolean;

  constructor(
    private user: UserService,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: SocialAuthService,
    private httpClient: HttpClient
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      console.log(user.idToken);
    });
  }

  form = {
    email: '',
    password: '',
  };

  emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  loginUser() {
    this.user.login(this.loginForm.value).subscribe(
      (response) => {
        console.log('Login successfull', response);
        this.user.saveToken(response.token);
        this.router.navigateByUrl('/chat');
      },
      (error) => {
        console.error('Login failed:', error.error);
      }
    );
  }
  getControl(name: any): AbstractControl | null {
    return this.loginForm.get(name);
  }

  refreshToken(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }

  getAccessToken(): void {
    this.authService
      .getAccessToken(GoogleLoginProvider.PROVIDER_ID)
      .then((accessToken) => (this.accessToken = accessToken));
  }

  getGoogleCalendarData(): void {
    if (!this.accessToken) return;

    this.httpClient
      .get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
      .subscribe((events) => {
        alert('Look at your console');
        console.log('events', events);
      });
  }

  refreshAccessToken(): void {
    this.authService.refreshAccessToken(GoogleLoginProvider.PROVIDER_ID);
  }
}
