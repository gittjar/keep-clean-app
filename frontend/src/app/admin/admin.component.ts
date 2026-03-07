import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToiletService, Toilet, AppUser } from '../services/toilet.service';
import { AuthService } from '../services/auth.service';
import {
  faPen, faKey, faSnowflake, faSun, faArrowDown, faArrowUp,
  faTrash, faArrowsRotate, faXmark, faCheck
} from '@fortawesome/free-solid-svg-icons';

export type UserModalType = 'rename' | 'pin' | 'freeze' | 'unfreeze' | 'delete' | 'role';

@Component({
  standalone: false,
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: AppUser[] = [];
  toilets: Toilet[] = [];
  loadingUsers = true;
  loadingToilets = true;

  // Grant panel per toilet
  expandedPerms: { [id: string]: boolean } = {};
  grantUserIdMap: { [id: string]: string } = {};

  activeTab: 'toilets' | 'users' = 'toilets';

  // Käyttäjätoimintojen modal
  modalType: UserModalType | null = null;
  modalUser: AppUser | null = null;
  modalInput = '';
  modalDays = 7;
  modalLoading = false;
  modalError = '';
  modalSuccess = '';

  // Poisto-modaalin monivaiheinen tila
  deleteStep: 'toilets' | 'confirm' = 'confirm';
  userOwnedToilets: Toilet[] = [];
  toiletActionMap: { [id: string]: { action: 'delete' | 'reassign'; newOwnerId: string } } = {};

  // FontAwesome-ikonit
  faPen = faPen;
  faKey = faKey;
  faSnowflake = faSnowflake;
  faSun = faSun;
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;
  faTrash = faTrash;
  faArrowsRotate = faArrowsRotate;
  faXmark = faXmark;
  faCheck = faCheck;

  constructor(
    private toiletService: ToiletService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.toiletService.getAdminUsers().subscribe({
      next: (u) => { this.users = u; this.loadingUsers = false; },
      error: () => this.loadingUsers = false
    });
    this.toiletService.getAdminToilets().subscribe({
      next: (t) => { this.toilets = t; this.loadingToilets = false; },
      error: () => this.loadingToilets = false
    });
  }

  // --- Modal ---
  openModal(type: UserModalType, user: AppUser) {
    this.modalType = type;
    this.modalUser = user;
    this.modalInput = type === 'rename' ? user.username : '';
    this.modalDays = 7;
    this.modalError = '';
    this.modalSuccess = '';
    this.modalLoading = false;

    if (type === 'delete') {
      const owned = this.toilets.filter(t => t.owner._id === user._id);
      this.userOwnedToilets = owned;
      this.toiletActionMap = {};
      owned.forEach(t => {
        this.toiletActionMap[t._id] = { action: 'delete', newOwnerId: '' };
      });
      this.deleteStep = owned.length > 0 ? 'toilets' : 'confirm';
    }
  }

  closeModal() {
    this.modalType = null;
    this.modalUser = null;
    this.modalError = '';
    this.modalSuccess = '';
    this.deleteStep = 'confirm';
    this.userOwnedToilets = [];
    this.toiletActionMap = {};
  }

  submitModal() {
    if (!this.modalUser) return;
    this.modalLoading = true;
    this.modalError = '';

    switch (this.modalType) {
      case 'rename':
        this.toiletService.adminRenameUser(this.modalUser._id, this.modalInput).subscribe({
          next: (u) => {
            const idx = this.users.findIndex(x => x._id === u._id);
            if (idx !== -1) this.users[idx] = u;
            this.modalSuccess = `Käyttäjänimi vaihdettu → ${u.username}`;
            this.modalLoading = false;
            setTimeout(() => this.closeModal(), 1500);
          },
          error: (err) => { this.modalError = err.error?.message || 'Epäonnistui'; this.modalLoading = false; }
        });
        break;

      case 'pin':
        this.toiletService.adminChangePin(this.modalUser._id, this.modalInput).subscribe({
          next: () => {
            this.modalSuccess = 'PIN vaihdettu onnistuneesti';
            this.modalLoading = false;
            setTimeout(() => this.closeModal(), 1500);
          },
          error: (err) => { this.modalError = err.error?.message || 'Epäonnistui'; this.modalLoading = false; }
        });
        break;

      case 'freeze':
        this.toiletService.adminFreezeUser(this.modalUser._id, this.modalDays).subscribe({
          next: (u) => {
            const idx = this.users.findIndex(x => x._id === u._id);
            if (idx !== -1) this.users[idx] = u;
            this.modalSuccess = `Tili jäädytetty ${this.modalDays} päiväksi`;
            this.modalLoading = false;
            setTimeout(() => this.closeModal(), 1500);
          },
          error: (err) => { this.modalError = err.error?.message || 'Epäonnistui'; this.modalLoading = false; }
        });
        break;

      case 'unfreeze':
        this.toiletService.adminFreezeUser(this.modalUser._id, 0).subscribe({
          next: (u) => {
            const idx = this.users.findIndex(x => x._id === u._id);
            if (idx !== -1) this.users[idx] = u;
            this.modalSuccess = 'Jäädytys poistettu';
            this.modalLoading = false;
            setTimeout(() => this.closeModal(), 1500);
          },
          error: (err) => { this.modalError = err.error?.message || 'Epäonnistui'; this.modalLoading = false; }
        });
        break;

      case 'delete': {
        const toiletActions = this.userOwnedToilets.map(t => ({
          toiletId: t._id,
          action: this.toiletActionMap[t._id].action,
          newOwnerId: this.toiletActionMap[t._id].newOwnerId || undefined
        }));
        this.toiletService.adminDeleteUser(this.modalUser._id, toiletActions).subscribe({
          next: () => {
            this.users = this.users.filter(u => u._id !== this.modalUser!._id);
            // Päivitä vessat: poista poistetut, päivitä siirrettyjen omistajat
            const deletedIds = new Set(toiletActions.filter(a => a.action === 'delete').map(a => a.toiletId));
            this.toilets = this.toilets.filter(t => !deletedIds.has(t._id));
            for (const ta of toiletActions.filter(a => a.action === 'reassign')) {
              const t = this.toilets.find(x => x._id === ta.toiletId);
              const newOwner = this.users.find(u => u._id === ta.newOwnerId);
              if (t && newOwner) t.owner = { _id: newOwner._id, username: newOwner.username };
            }
            this.modalSuccess = 'Käyttäjä poistettu';
            this.modalLoading = false;
            setTimeout(() => this.closeModal(), 1400);
          },
          error: (err) => { this.modalError = err.error?.message || 'Epäonnistui'; this.modalLoading = false; }
        });
        break;
      }

      case 'role': {
        const newRole = this.modalUser.role === 'admin' ? 'user' : 'admin';
        this.toiletService.setUserRole(this.modalUser._id, newRole).subscribe({
          next: (u) => {
            const idx = this.users.findIndex(x => x._id === u._id);
            if (idx !== -1) this.users[idx].role = u.role;
            this.modalSuccess = `Rooli muutettu → ${u.role}`;
            this.modalLoading = false;
            setTimeout(() => this.closeModal(), 1200);
          },
          error: (err) => { this.modalError = err.error?.message || 'Epäonnistui'; this.modalLoading = false; }
        });
        break;
      }
    }
  }

  isFrozen(user: AppUser): boolean {
    return !!user.frozenUntil && new Date(user.frozenUntil) > new Date();
  }

  frozenLabel(user: AppUser): string {
    if (!user.frozenUntil) return '';
    const msLeft = new Date(user.frozenUntil).getTime() - Date.now();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    const until = new Date(user.frozenUntil).toLocaleDateString('fi-FI');
    return `${daysLeft} pv jäljellä (asti ${until})`;
  }

  isOwnAccount(user: AppUser): boolean {
    return user._id === this.authService.getUserId();
  }

  get deleteActionsValid(): boolean {
    return this.userOwnedToilets.every(t => {
      const a = this.toiletActionMap[t._id];
      return a && (a.action === 'delete' || (a.action === 'reassign' && !!a.newOwnerId));
    });
  }

  get usersForReassign(): AppUser[] {
    return this.users.filter(u => u._id !== this.modalUser?._id);
  }

  togglePerms(id: string) {
    this.expandedPerms[id] = !this.expandedPerms[id];
    if (!this.grantUserIdMap[id]) this.grantUserIdMap[id] = '';
  }

  getGrantableUsers(toilet: Toilet): AppUser[] {
    const existingIds = new Set([
      toilet.owner._id,
      ...toilet.allowedUsers.map(u => u._id)
    ]);
    return this.users.filter(u => !existingIds.has(u._id));
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

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fi-FI', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
