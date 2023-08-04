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

  getLogs(startTime?: string, endTime?: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });
    let params = new HttpParams();

    if (startTime) {
      params = params.set('startTime', startTime);
    }

    if (endTime) {
      params = params.set('endTime', endTime);
    }

    return this.http
      .get<any[]>(this.url, { headers: headers, params: params })
      .pipe(
        map((response: any) => response.logs) // Extract the 'logs' array from the response
      );
  }
}
