import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
   constructor(private http: HttpClient) { }
  url = 'http://localhost:5243/api';
   
  getChannels(userId: string): Observable<any[]> {
  const params = new HttpParams().set('userId', userId);
  return this.http.get<any[]>(`http://localhost:5243/api/Channels/UserId?userId=${userId}`);
}

  // Fetch channel details by ID
  getChannelDetails(channelId: number): Observable<any> {
    return this.http.get<any>(`${this.url}/channels/${channelId}`);
  }

  // Add members to a channel
  addMembersToChannel(channelId: number, memberIds: string[]): Observable<any> {
    return this.http.post(`${this.url}/channels/${channelId}/addMembers`, memberIds);
  }

}

