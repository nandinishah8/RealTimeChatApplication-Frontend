import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
   constructor(private http: HttpClient) { }
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


}

