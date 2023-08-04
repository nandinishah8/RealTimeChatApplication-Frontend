import { Component, OnInit } from '@angular/core';
import { Router, Route } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
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
export class RegisterComponent {
  registrationForm!: FormGroup;

  constructor(
    private user: UserService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.registrationForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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
}
