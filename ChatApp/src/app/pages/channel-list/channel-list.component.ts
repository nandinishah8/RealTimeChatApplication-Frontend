import { Component, OnInit } from '@angular/core';
import { ChannelService } from 'src/app/services/channel.service';

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.css']
})
export class ChannelListComponent implements OnInit {
  channels: any[] = [];

 constructor(private channelService: ChannelService) {}

  ngOnInit(): void {
    // Fetch the list of channels when the component initializes
    this.channelService.getChannels().subscribe(
      (channels) => {
        this.channels = channels;
      },
      (error) => {
        console.error('Error fetching channels:', error);
      }
    );
  }
}








