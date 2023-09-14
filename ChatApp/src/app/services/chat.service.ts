import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { UserService } from './user.service';
import { map, switchMap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient, private user: UserService) {}
  url = 'http://localhost:5243/api/Messages';

  sendMessage(receiverId: string, content: string): Observable<any> {
    debugger
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });
    const body = {
      "receiverId": receiverId,
      "content": content,
    };
   
    return this.http.post<any>(`${this.url}`, body, { headers: headers });
  }

  
 getMessages(
  userId: string,
  sort: string,
  order: string,
  count: number,
  before: string,
  after: string
): Observable<any[]> {
    let token = localStorage.getItem('auth_token');
    console.log(token);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    let params = new HttpParams()
      .set('sort', sort)
      .set('order', order)
      .set('count', count.toString());

    if (before) {
      params = params.set('before', before);
    }

    if (after) {
      params = params.set('after', after);
    }

    console.log(userId);
    return this.http
      .get<any[]>(`http://localhost:5243/api/Messages?UserId=${userId}`, {
        headers: headers,
        params: params
      })
      .pipe(
        map((response: any) => {
        console.log('getMessages response:', response);
        // Mark incoming messages as seen
        const messages = response.messages.map((message: any) => {
          if (message.receiverId !== userId && !message.seen) {
            this.markAllMessagesAsRead(message.receiverId).subscribe(
              () => {
                message.seen = true;
              },
              (error) => {
                console.error('Error marking message as seen:', error);
              }
            );
          }
          return message;
        });
        return messages;
      })
    );
  }

  searchMessages(query: string): Observable<any[]>
  {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });

    const params = new HttpParams().set('result', query);

    return this.http.get<any[]>(`${this.url}/search/${query}`, {
      headers: headers,
      params: params,
    });
  }

  editMessage(messageId: number, content: string): Observable<any>
  {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });
   

    return this.http.put<any>(
      `${this.url}/${messageId}`,
      { content: content },
      {
        headers: headers,
      }
    );
  }

  // Method to delete a message
  deleteMessage(messageId: number): Observable<any>
  {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });

    return this.http.delete<any>(`${this.url}/${messageId}`, {
      headers: headers,
    });
  }

  // markMessageAsSeen(currentUserId: string, receiverId: string, messageId: string): Observable<any>
  // {
  //    // const url = `${this.url}/mark-seen`;
  //     const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${this.user.getToken()}`,
  //   });

  //   // Create a request body with the required data
  //   const request = {
  //     CurrentUserId: currentUserId,
  //     ReceiverId: receiverId,
  //     MessageId: messageId,
  //   };

  //    // return this.http.post<any>(url, request);
  //    return this.http.post<any>(this.url,request);
  // }

  markAllMessagesAsRead(receiverId: string): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.user.getToken()}`,
  });

  return this.http.post<any>(`${this.url}/mark-all-as-read/${receiverId}`, null, { headers: headers });
  }
  
  getUnreadMessageCount(userId: any): Observable<number>
  {
    // Replace this with your API endpoint to fetch the unread message count
     return this.http.get<number>(`${this.url}/unread-counts/${userId}`);
  }
}
