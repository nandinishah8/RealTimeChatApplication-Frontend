import { Component, OnInit } from '@angular/core';
import { ChannelService } from 'src/app/services/channel.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.css']
})
export class ChannelListComponent implements OnInit {
  userChannels: any[] = [];
channel: any[] = [];

  constructor(private channelService: ChannelService, private http: HttpClient, private UserService: UserService) { }
  url = 'http://localhost:5243/api/Channels';

  // In your ChannelsComponent
  ngOnInit(): void {
    const userId = '81946bd0-64d8-42cf-b743-f2fd7f6ebf39'; // Replace with the actual logged-in user's ID
    // Fetch the user's channels from your backend API
    this.http.get(`http://localhost:5243/api/Channels/UserId?userId=${userId}`).subscribe(
      (response: any) => {
        this.userChannels = response;
      },
      (error) => {
        console.error('Error fetching user channels:', error);
      }
    );
  }
}







