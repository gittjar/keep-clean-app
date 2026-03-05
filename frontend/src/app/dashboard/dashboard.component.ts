import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToiletService, Toilet, CleaningEntry, AppUser } from '../services/toilet.service';
import { AuthService } from '../services/auth.service';
import {
  faRightFromBracket, faShareNodes, faUser, faClockRotateLeft,
  faChevronUp, faChevronDown, faBroom, faKey, faXmark, faPlus,
  faCircleCheck, faDisplay, faCopy, faTrash, faCheck, faUserShield,
  faTableCells, faList, faArrowUp, faArrowDown, faFilter, faSliders,
  faSort, faClock, faLocationDot, faHashtag, faTag, faUsers
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

  // Näkymä ja lajittelu
  viewMode: 'card' | 'list' = 'card';
  sortBy: 'lastCleaned' | 'name' | 'location' | 'toiletId' | 'status' = 'lastCleaned';
  sortAsc = true;
  showFilterPanel = false;
  activeLocations: Set<string> = new Set();

  get uniqueLocations(): string[] {
    return [...new Set(this.toilets.map(t => t.location))].sort();
  }

  get filteredSorted(): Toilet[] {
    let result = this.toilets.slice();

    // Sijainnin suodatus
    if (this.activeLocations.size > 0) {
      result = result.filter(t => this.activeLocations.has(t.location));
    }

    // Lajittelu
    result.sort((a, b) => {
      let val = 0;
      switch (this.sortBy) {
        case 'lastCleaned':
          val = new Date(a.lastCleaned).getTime() - new Date(b.lastCleaned).getTime();
          break;
        case 'name':
          val = a.name.localeCompare(b.name, 'fi');
          break;
        case 'location':
          val = a.location.localeCompare(b.location, 'fi');
          break;
        case 'toiletId':
          val = (a.toiletId || '').localeCompare(b.toiletId || '', 'fi');
          break;
        case 'status':
          // oma ensin tai jaettu ensin
          const aOwn = this.isOwner(a) ? 0 : 1;
          const bOwn = this.isOwner(b) ? 0 : 1;
          val = aOwn - bOwn;
          break;
      }
      return this.sortAsc ? val : -val;
    });

    return result;
  }

  setSortBy(key: 'lastCleaned' | 'name' | 'location' | 'toiletId' | 'status') {
    if (this.sortBy === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortBy = key;
      this.sortAsc = true;
    }
  }

  toggleLocation(loc: string) {
    if (this.activeLocations.has(loc)) {
      this.activeLocations.delete(loc);
    } else {
      this.activeLocations.add(loc);
    }
    this.activeLocations = new Set(this.activeLocations); // trigger change detection
  }

  isLocationActive(loc: string): boolean {
    return this.activeLocations.has(loc);
  }

  clearFilters() {
    this.activeLocations = new Set();
  }

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
  faTableCells = faTableCells;
  faList = faList;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faFilter = faFilter;
  faSliders = faSliders;
  faSort = faSort;
  faClock = faClockRotateLeft;
  faLocationDot = faLocationDot;
  faHashtag = faHashtag;
  faTag = faTag;
  faUsers = faUsers;

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
      error: () => { this.errorMsg = 'Tilojen lataus epäonnistui'; this.loading = false; }
    });
  }

  isLongAgo(lastCleaned: string): boolean {
    const hours = (Date.now() - new Date(lastCleaned).getTime()) / (1000 * 60 * 60);
    return hours > 24;
  }

  getLocationCount(loc: string): number {
    return this.toilets.filter(t => t.location === loc).length;
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
      error: (err) => alert(err.error?.message || 'Myöntäminen epäonnistui')
    });
  }

  revokeAccess(toilet: Toilet, targetUserId: string) {
    this.toiletService.revokeAccess(toilet._id, targetUserId).subscribe({
      next: () => {
        toilet.allowedUsers = toilet.allowedUsers.filter(u => u._id !== targetUserId);
      },
      error: (err) => alert(err.error?.message || 'Poistaminen epäonnistui')
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
