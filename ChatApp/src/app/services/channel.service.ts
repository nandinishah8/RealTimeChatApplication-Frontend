import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
   constructor(private http: HttpClient) { }
  url = 'http://localhost:5243/api';
   getChannels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/channels`);
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

