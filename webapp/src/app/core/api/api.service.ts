import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';

  constructor(private httpClient: HttpClient) {
  }

  get<T>(path: string): Observable<T> {
    return this.httpClient.get<T>(this.apiUrl + path);
  }

  post<T, R>(path: string, data: R): Observable<T> {
    return this.httpClient.post<T>(this.apiUrl + path, data);
  }

  put<T, R>(path: string, data: R): Observable<T> {
    return this.httpClient.put<T>(this.apiUrl + path, data);
  }

  delete<T>(path: string): Observable<T> {
    return this.httpClient.delete<T>(this.apiUrl + path);
  }
}
