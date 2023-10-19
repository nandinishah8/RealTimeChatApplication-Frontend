import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';
import { SignalrService } from './signalr.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
   constructor(private http: HttpClient, private SignalrService: SignalrService, private UserService: UserService) { }
  url = 'http://localhost:5243/api';
   
  getChannels(): Observable<any[]> {
 const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('JWT token not found.');
  }
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<any[]>(`http://localhost:5243/api/Channels/UserId`, {headers: headers});
  }
  
  createChannel(newChannel: any): Observable<any> {
    const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    // Send a POST request to create a new channel
    return this.http.post(`http://localhost:5243/api/Channels`, newChannel, { headers: headers});
  }

  // Fetch channel details by ID
  getChannelDetails(channelId: any): Observable<any> {
    return this.http.get<any>(`${this.url}/Channels/${channelId}`);
  }

  // Add members to a channel
 addMembersToChannel(channelId: any, memberIds: string[]): Observable<any> {
  const body = {
    channelId: channelId,
    userIds: memberIds
  };
  
  return this.http.post(`http://localhost:5243/api/Channels/addMembers`, body);
  }
  
 getMembersInChannel(channelId: any): Observable<any[]> {

  return this.http.get<any[]>(`http://localhost:5243/api/Channels/members/${channelId}`);
  }
  
  updateChannel(channelId: any, name: string, description: string): Observable<any> {
 
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('JWT token not found.');
    }
    
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });
    
    const body = {
   name: name,
  description: description,
  };

  return this.http.put<any>(`http://localhost:5243/api/Channels/${channelId}`, body, { headers });
}


  // Delete a channel
  deleteChannel(channelId: any): Observable<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('JWT token not found.');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete<any>(`${this.url}/channels/${channelId}`, { headers });
  }


  deleteMembersFromChannel(channelId: any, memberIds: string[]): Observable<any> {
  const token = localStorage.getItem('auth_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  const options = {
    headers: headers,
    body: memberIds,  
  };

  return this.http.delete<any>(`http://localhost:5243/api/Channels/${channelId}/members`, options);
  }
  
  sendMessageToChannel(channelId: string, content: string): Observable<any> {
     const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const body = {
     
      ChannelId: channelId,
      Content: content,
    };

    return this.http.post<any>(`http://localhost:5243/api/Messages/Channels/messages`, body, { headers: headers });
  }

 
  receiveChannelMessages(channelId:any): Observable<any> {
    return this.SignalrService.receiveChannelMessages();
  }

  getMessages(channelId: any) {
    return this.http.get<any>(`http://localhost:5243/api/Messages/${channelId}/messages`, channelId);
  }

  EditChannelMessage(messageId: number, content: string) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
   

    return this.http.put<any>(
      `http://localhost:5243/api/Messages/(channelid)?id=${messageId}`,
      { id: messageId,content:content }, {headers:headers}
    );
  }
     
  

    deleteMessage(channelId: any, messageId: any): Observable<any> {
    const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
       'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(`http://localhost:5243/api/Messages/channelMessage?id=${channelId}&channelId=${messageId}`, { headers });
  }




}





