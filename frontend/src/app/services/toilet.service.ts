import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CleaningEntry {
  cleanedAt: string;
  cleanedBy: string;
}

export interface Toilet {
  _id: string;
  name: string;
  location: string;
  toiletId: string;
  lastCleaned: string; // virtual: viimeisin cleanedAt tai createdAt
  cleaningLog: CleaningEntry[];
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

  // Muotoile kulunut aika luettavaksi tekstiksi
  formatElapsed(lastCleaned: string): string {
    const ms = Date.now() - new Date(lastCleaned).getTime();
    const minutes = Math.floor(ms / (1000 * 60));
    const hours   = Math.floor(ms / (1000 * 60 * 60));
    const days    = Math.floor(ms / (1000 * 60 * 60 * 24));
    const weeks   = Math.floor(days / 7);
    const months  = Math.floor(days / 30.44);
    const years   = Math.floor(days / 365.25);

    if (minutes < 60) {
      return `${minutes} min`;
    } else if (hours < 24) {
      const m = minutes % 60;
      return m > 0 ? `${hours}h ${m}min` : `${hours}h`;
    } else if (days < 7) {
      const h = hours % 24;
      return h > 0 ? `${days}pv ${h}h` : `${days}pv`;
    } else if (days < 30) {
      const d = days % 7;
      return d > 0 ? `${weeks}vk ${d}pv` : `${weeks}vk`;
    } else if (months < 12) {
      const w = Math.floor((days - months * 30.44) / 7);
      return w > 0 ? `${months}kk ${Math.round(w)}vk` : `${months}kk`;
    } else {
      const m = months % 12;
      return m > 0 ? `${years}v ${m}kk` : `${years}v`;
    }
  }
}
