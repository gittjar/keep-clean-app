import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  pin = '';
  adminCode = '';
  errorMsg = '';
  isRegister = false;
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  submit() {
    this.errorMsg = '';
    this.loading = true;

    const action$ = this.isRegister
      ? this.authService.register(this.username, this.pin, this.adminCode || undefined)
      : this.authService.login(this.username, this.pin);

    action$.subscribe({
      next: (res) => {
        if (res.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Jokin meni pieleen';
        this.loading = false;
      }
    });
  }

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.errorMsg = '';
    this.adminCode = '';
  }
}
