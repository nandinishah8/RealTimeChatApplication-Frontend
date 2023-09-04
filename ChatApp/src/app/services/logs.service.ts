import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  url = 'http://localhost:5243/api/Log';
  constructor(private http: HttpClient, private user: UserService) {}


  
 getLogsByTimeframe(timeframe: string): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.url}`)
      .pipe(map((response: any) => response.logs));
  }

   getLogsCustom(startTime: string, endTime: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}`, {
      params: {
        startTime: startTime,
        endTime: endTime,
      },
    });
  }
}
