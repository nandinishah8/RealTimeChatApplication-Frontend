import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
import { SocialUser } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root',
})
export class SocialLoginService {
  constructor(private httpClient: HttpClient) {}
  url = 'http://localhost:5243/api/SocialLogin';

  sendSocialToken(token: string): Observable<any> {
    const body = {
      TokenId: token,
    };
    // Send the token to the backend
    return this.httpClient.post(this.url, body);
  }
}
