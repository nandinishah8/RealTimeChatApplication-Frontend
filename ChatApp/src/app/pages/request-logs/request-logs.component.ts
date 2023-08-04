import { Component } from '@angular/core';
import { LogsService } from 'src/app/services/logs.service';

@Component({
  selector: 'app-request-logs',
  templateUrl: './request-logs.component.html',
  styleUrls: ['./request-logs.component.css'],
})
export class RequestLogsComponent {
  logs: any[] = [];
  selectedTimeframe: string = 'last5mins';
  customStartTime: string = '';
  customEndTime: string = '';
  showColumns: any = {
    id: true,
    timestamp: true,
    ipAddress: true,
    username: true,
    requestBody: true,
  };

  constructor(private logsService: LogsService) {}

  ngOnInit(): void {
    this.getLogs();
  }

  getLogs(): void {
    if (this.selectedTimeframe === 'last5mins') {
      const now = new Date().getTime();
      const startTime = new Date(now - 5 * 60 * 1000).toISOString();
      const endTime = new Date(now).toISOString();
      this.logsService
        .getLogs(startTime, endTime)
        .subscribe((logs) => (this.logs = logs));
    } else if (this.selectedTimeframe === 'last10mins') {
      const now = new Date().getTime();
      const startTime = new Date(now - 10 * 60 * 1000).toISOString();
      const endTime = new Date(now).toISOString();
      this.logsService
        .getLogs(startTime, endTime)
        .subscribe((logs) => (this.logs = logs));
    } else if (this.selectedTimeframe === 'last30mins') {
      const now = new Date().getTime();
      const startTime = new Date(now - 30 * 60 * 1000).toISOString();
      const endTime = new Date(now).toISOString();
      this.logsService
        .getLogs(startTime, endTime)
        .subscribe((logs) => (this.logs = logs));
    } else if (this.selectedTimeframe === 'custom') {
      this.logsService
        .getLogs(this.customStartTime, this.customEndTime)
        .subscribe((logs) => (this.logs = logs));
    }
  }

  toggleColumn(column: string): void {
    this.showColumns[column] = !this.showColumns[column];
  }
}
