import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Toilet } from './models/toilet';

@Injectable({
  providedIn: 'root'
})
export class ToiletlocationService {

  toilet_url = 'https://raw.githubusercontent.com/gittjar/JSON/main/toiletlocation.json';

  constructor(private http: HttpClient) { }

  getToilet(): Observable <Toilet[]>
  {
    return this.http.get<Toilet[]>(this.toilet_url);
  }
}
