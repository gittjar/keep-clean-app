import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToiletService, Toilet, CleaningEntry, AppUser } from '../services/toilet.service';
import { AuthService } from '../services/auth.service';
import {
  faRightFromBracket, faShareNodes, faUser, faClockRotateLeft,
  faChevronUp, faChevronDown, faBroom, faKey, faXmark, faPlus,
  faCircleCheck, faDisplay, faCopy, faTrash, faCheck, faUserShield
} from '@fortawesome/free-solid-svg-icons';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  toilets: Toilet[] = [];
  allUsers: AppUser[] = [];
  loading = true;
  errorMsg = '';

  newName = '';
  newLocation = '';
  newToiletId = '';
  adding = false;
  showAddForm = false;

  username: string | null = null;
  userId: string | null = null;

  expandedHistory: { [id: string]: boolean } = {};
  expandedPermissions: { [id: string]: boolean } = {};
  grantUserIdMap: { [id: string]: string } = {};

  toastMsg = '';
  toastUrl = '';
  toastVisible = false;
  private toastTimer: any;

  // FontAwesome icons
  faRightFromBracket = faRightFromBracket;
  faShareNodes = faShareNodes;
  faUser = faUser;
  faClockRotateLeft = faClockRotateLeft;
  faChevronUp = faChevronUp;
  faChevronDown = faChevronDown;
  faBroom = faBroom;
  faKey = faKey;
  faXmark = faXmark;
  faPlus = faPlus;
  faCircleCheck = faCircleCheck;
  faDisplay = faDisplay;
  faCopy = faCopy;
  faTrash = faTrash;
  faCheck = faCheck;
  faUserShield = faUserShield;

  constructor(
    private toiletService: ToiletService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.userId = this.authService.getUserId();
    this.loadToilets();
    this.toiletService.getUsers().subscribe({ next: (u) => this.allUsers = u });
  }

  loadToilets() {
    this.loading = true;
    this.toiletService.getToilets().subscribe({
      next: (data) => { this.toilets = data; this.loading = false; },
      error: () => { this.errorMsg = 'Tilojen lataus epÃ¤onnistui'; this.loading = false; }
    });
  }

  isOwner(toilet: Toilet): boolean {
    return toilet.owner?._id === this.userId;
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
        toilet.cleaningLog = res.toilet.cleaningLog;
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
    return this.toiletService.formatElapsed(lastCleaned);
  }

  toggleHistory(id: string) {
    this.expandedHistory[id] = !this.expandedHistory[id];
  }

  getRecentHistory(toilet: Toilet): CleaningEntry[] {
    return [...(toilet.cleaningLog || [])].reverse().slice(0, 15);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fi-FI', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // Oikeuksien hallinta
  togglePermissions(id: string) {
    this.expandedPermissions[id] = !this.expandedPermissions[id];
    if (!this.grantUserIdMap[id]) this.grantUserIdMap[id] = '';
  }

  getGrantableUsers(toilet: Toilet): AppUser[] {
    const existingIds = new Set([
      toilet.owner._id,
      ...toilet.allowedUsers.map(u => u._id)
    ]);
    return this.allUsers.filter(u => !existingIds.has(u._id));
  }

  grantAccess(toilet: Toilet) {
    const userId = this.grantUserIdMap[toilet._id];
    if (!userId) return;
    this.toiletService.grantAccess(toilet._id, userId).subscribe({
      next: (res) => {
        toilet.allowedUsers = res.toilet.allowedUsers;
        this.grantUserIdMap[toilet._id] = '';
      },
      error: (err) => alert(err.error?.message || 'MyÃ¶ntÃ¤minen epÃ¤onnistui')
    });
  }

  revokeAccess(toilet: Toilet, targetUserId: string) {
    this.toiletService.revokeAccess(toilet._id, targetUserId).subscribe({
      next: () => {
        toilet.allowedUsers = toilet.allowedUsers.filter(u => u._id !== targetUserId);
      },
      error: (err) => alert(err.error?.message || 'Poistaminen epÃ¤onnistui')
    });
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
      this.showToastMsg('URL kopioitu leikepöydälle!', url);
    });
  }

  showToastMsg(msg: string, url = '') {
    this.toastMsg = msg;
    this.toastUrl = url;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastVisible = false, 3500);
  }
}
