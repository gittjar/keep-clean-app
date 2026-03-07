import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CleaningEntry {
  cleanedAt: string;
  cleanedBy: string;
}

export interface ToiletUser {
  _id: string;
  username: string;
}

export interface Toilet {
  _id: string;
  name: string;
  location: string;
  toiletId: string;
  lastCleaned: string;
  cleaningLog: CleaningEntry[];
  owner: ToiletUser;
  allowedUsers: ToiletUser[];
  createdAt: string;
}

export interface AppUser {
  _id: string;
  username: string;
  role: string;
  createdAt?: string;
  frozenUntil?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ToiletService {
  private apiUrl = 'http://localhost:3001/api/toilets';
  private usersUrl = 'http://localhost:3001/api/users';
  private adminUrl = 'http://localhost:3001/api/admin';

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

  pinReset(id: string, username: string, pin: string): Observable<{ message: string; lastCleaned: string; toilet: Toilet }> {
    return this.http.post<any>(`${this.apiUrl}/${id}/pin-reset`, { username, pin });
  }

  getToiletPublic(id: string): Observable<Toilet> {
    return this.http.get<Toilet>(`${this.apiUrl}/${id}/public`);
  }

  // Oikeuksien hallinta
  grantAccess(toiletId: string, userId: string): Observable<{ message: string; toilet: Toilet }> {
    return this.http.post<any>(`${this.apiUrl}/${toiletId}/grant`, { userId }, { headers: this.getHeaders() });
  }

  revokeAccess(toiletId: string, targetUserId: string): Observable<{ message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${toiletId}/revoke/${targetUserId}`, { headers: this.getHeaders() });
  }

  // Käyttäjät (kirjautuneen käyttäjän saatavilla)
  getUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.usersUrl, { headers: this.getHeaders() });
  }

  // Admin-reitit
  getAdminUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.adminUrl}/users`, { headers: this.getHeaders() });
  }

  getAdminToilets(): Observable<Toilet[]> {
    return this.http.get<Toilet[]>(`${this.adminUrl}/toilets`, { headers: this.getHeaders() });
  }

  setUserRole(userId: string, role: string): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.adminUrl}/users/${userId}/role`, { role }, { headers: this.getHeaders() });
  }

  // Admin: käyttäjähallinta
  adminRenameUser(id: string, username: string): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.adminUrl}/users/${id}/username`, { username }, { headers: this.getHeaders() });
  }

  adminChangePin(id: string, pin: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.adminUrl}/users/${id}/pin`, { pin }, { headers: this.getHeaders() });
  }

  adminFreezeUser(id: string, days: number): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.adminUrl}/users/${id}/freeze`, { days }, { headers: this.getHeaders() });
  }

  adminDeleteUser(id: string, toiletActions: { toiletId: string; action: 'delete' | 'reassign'; newOwnerId?: string }[] = []): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminUrl}/users/${id}`, {
      headers: this.getHeaders(),
      body: { toiletActions }
    });
  }

  getElapsedHours(lastCleaned: string): number {
    const ms = Date.now() - new Date(lastCleaned).getTime();
    return ms / (1000 * 60 * 60);
  }

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
