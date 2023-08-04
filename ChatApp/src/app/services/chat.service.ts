import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient, private user: UserService) {}
  url = 'http://localhost:5243/api/Messages';

  sendMessage(receiverId: number, content: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });
    const body = {
      receiverId: receiverId,
      content: content,
    };
    return this.http.post(this.url, body, { headers: headers }).pipe(
      map((response: any) => {
        console.log('sendMessage response:', response);
        return response.messages;
      })
    );
  }

  getMessages(id: number): Observable<any[]> {
    let token = localStorage.getItem('auth_token');
    console.log(token);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    console.log(id);

    return this.http
      .get<any[]>(`http://localhost:5243/api/Messages/${id}`, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          console.log('getMessages response:', response);
          return response.messages;
        })
      );
  }

  editMessage(messageId: number, content: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });
    // const body = { message: content };

    return this.http.put<any>(
      `${this.url}/${messageId}`,
      { content: content },
      {
        headers: headers,
      }
    );
  }

  // Method to delete a message
  deleteMessage(messageId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });

    return this.http.delete<any>(`${this.url}/${messageId}`, {
      headers: headers,
    });
  }
}
