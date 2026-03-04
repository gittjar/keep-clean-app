import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToiletService, Toilet, AppUser } from '../services/toilet.service';
import { AuthService } from '../services/auth.service';

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

  toggleRole(user: AppUser) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Muutetaanko ${user.username} rooliksi "${newRole}"?`)) return;
    this.toiletService.setUserRole(user._id, newRole).subscribe({
      next: (updated) => {
        user.role = updated.role;
      },
      error: (err) => alert(err.error?.message || 'Muutos epäonnistui')
    });
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
