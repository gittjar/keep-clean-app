import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Toilet {
  _id: string;
  name: string;
  location: string;
  toiletId: string;
  lastCleaned: string; // ISO date string
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ToiletService {
  private apiUrl = 'http://localhost:3001/api/toilets';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getToilets(): Observable<Toilet[]> {
    return this.http.get<Toilet[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addToilet(name: string, location: string, toiletId?: string): Observable<Toilet> {
    return this.http.post<Toilet>(this.apiUrl, { name, location, toiletId }, { headers: this.getHeaders() });
  }

  resetTimer(id: string): Observable<{ message: string; lastCleaned: string; toilet: Toilet }> {
    return this.http.put<any>(`${this.apiUrl}/${id}/reset`, {}, { headers: this.getHeaders() });
  }

  updateToilet(id: string, data: Partial<Toilet>): Observable<Toilet> {
    return this.http.put<Toilet>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteToilet(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // PIN-resetointi display-näytöltä (ei vaadi JWT-tokenia)
  pinReset(id: string, username: string, pin: string): Observable<{ message: string; lastCleaned: string; toilet: Toilet }> {
    return this.http.post<any>(`${this.apiUrl}/${id}/pin-reset`, { username, pin });
  }

  // Hae yksittäinen WC-tila julkisesti (display-näyttö)
  getToiletPublic(id: string): Observable<Toilet> {
    return this.http.get<Toilet>(`${this.apiUrl}/${id}/public`);
  }

  // Laske kuinka monta tuntia on kulunut lastCleaned-ajasta
  getElapsedHours(lastCleaned: string): number {
    const ms = Date.now() - new Date(lastCleaned).getTime();
    return ms / (1000 * 60 * 60);
  }
}
