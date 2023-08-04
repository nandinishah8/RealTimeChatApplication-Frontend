import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
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
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(
    private user: UserService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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
}
