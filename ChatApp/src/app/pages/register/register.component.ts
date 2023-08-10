import { Component, OnInit } from '@angular/core';
import { Router, Route } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { SocialUser } from '@abacritt/angularx-social-login';
import { SocialLoginService } from 'src/app/services/social-login.service';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;
  private accessToken = '';
  socialuser!: SocialUser;
  loggedIn!: boolean;

  constructor(
    private user: UserService,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: SocialAuthService,
    private socialLoginService: SocialLoginService,
    private httpClient: HttpClient
  ) {
    this.registrationForm = this.formBuilder.group({
      name: ['', Validators.required],
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
    name: '',
    email: '',
    password: '',
  };

  emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  registerUser() {
    console.log(this.registrationForm.value);

    this.user.signup(this.registrationForm.value).subscribe((res) => {
      this.router.navigateByUrl('/');
    });
  }

  getControl(name: any): AbstractControl | null {
    return this.registrationForm.get(name);
  }

  refreshToken(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }

  getAccessToken(): void {
    this.authService
      .getAccessToken(GoogleLoginProvider.PROVIDER_ID)
      .then((accessToken) => (this.accessToken = accessToken));
  }

  signInWithGoogle(token: string): void {
    this.socialLoginService.sendSocialToken(token).subscribe(
      (response) => {
        console.log('Social token sent successfully to the backend:', response);

        if (response && response.token) {
          // Store the token and user profile in local storage
          localStorage.setItem('token', response.token);
          localStorage.setItem('userProfile', JSON.stringify(response.profile));

          // Redirect to the chat route
          this.router.navigate(['/chat']);
        }
      },
      (error) => {
        console.error('Error sending social token to the backend:', error);
      }
    );
  }
}
