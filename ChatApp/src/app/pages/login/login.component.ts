import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { SocialLoginService } from 'src/app/services/social-login.service';
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
    private httpClient: HttpClient,
    private socialLoginService: SocialLoginService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.signInWithGoogle(user.idToken);
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
