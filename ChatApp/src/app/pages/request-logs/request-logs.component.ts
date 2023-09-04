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
    if (this.selectedTimeframe === 'custom') {
      if (this.customStartTime && this.customEndTime) {
        this.logsService
          .getLogsCustom(this.customStartTime, this.customEndTime)
          .subscribe((logs) => (this.logs = logs));
      }
    } else {
      this.logsService
        .getLogsByTimeframe(this.selectedTimeframe)
        .subscribe((logs) => (this.logs = logs));
    }
  }

  toggleColumn(column: string): void {
    this.showColumns[column] = !this.showColumns[column];
  }
}
