import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToiletService, Toilet } from '../services/toilet.service';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  toilets: Toilet[] = [];
  loading = true;
  errorMsg = '';

  // Uuden WC-tilan lomake
  newName = '';
  newLocation = '';
  newToiletId = '';
  adding = false;
  showAddForm = false;

  username: string | null = null;

  constructor(
    private toiletService: ToiletService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.loadToilets();
  }

  loadToilets() {
    this.loading = true;
    this.toiletService.getToilets().subscribe({
      next: (data) => { this.toilets = data; this.loading = false; },
      error: () => { this.errorMsg = 'Tilojen lataus epäonnistui'; this.loading = false; }
    });
  }

  addToilet() {
    if (!this.newName || !this.newLocation) return;
    this.adding = true;
    this.toiletService.addToilet(this.newName, this.newLocation, this.newToiletId).subscribe({
      next: (t) => {
        this.toilets.push(t);
        this.newName = '';
        this.newLocation = '';
        this.newToiletId = '';
        this.adding = false;
        this.showAddForm = false;
      },
      error: () => { this.adding = false; }
    });
  }

  resetTimer(toilet: Toilet) {
    this.toiletService.resetTimer(toilet._id).subscribe({
      next: (res) => {
        toilet.lastCleaned = res.lastCleaned;
      }
    });
  }

  deleteToilet(id: string) {
    if (!confirm('Poistetaanko WC-tila?')) return;
    this.toiletService.deleteToilet(id).subscribe({
      next: () => { this.toilets = this.toilets.filter(t => t._id !== id); }
    });
  }

  getElapsed(lastCleaned: string): string {
    const totalMinutes = Math.floor(this.toiletService.getElapsedHours(lastCleaned) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}min sitten`;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToDisplay(toilet: Toilet) {
    this.router.navigate(['/display', toilet._id]);
  }

  copyDisplayUrl(toilet: Toilet) {
    const url = `${window.location.origin}/display/${toilet._id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert(`URL kopioitu:\n${url}`);
    });
  }
}
