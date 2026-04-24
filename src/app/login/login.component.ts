import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../auth';
import { Theme } from '../theme';

const AUTH_BASE = 'https://api.everrest.educata.dev/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  activePanel: 'signin' | 'signup' = 'signin';

  siEmail = '';
  siPassword = '';
  siError = '';

  suFirstName = '';
  suLastName = '';
  suAge: number | null = null;
  suEmail = '';
  suPassword = '';
  suConfirm = '';
  suAddress = '';
  suPhone = '';
  suZipcode = '';
  suGender: 'MALE' | 'FEMALE' | 'OTHER' = 'MALE';
  suError = '';
  suSuccess = '';

  loading = false;

 
constructor(
  private router: Router, 
  private cdr: ChangeDetectorRef, 
  private auth: Auth,
  public theme: Theme
) {}

  goHome() {
    this.router.navigate(['/']);
  }

  showPanel(panel: 'signin' | 'signup') {
    this.activePanel = panel;
    this.siError = '';
    this.suError = '';
    this.suSuccess = '';
  }

  handleSignIn() {
    this.siError = '';
    if (!this.siEmail || !this.siPassword) {
      this.siError = '⚠️ შეავსე ყველა ველი.';
      return;
    }
    this.loading = true;
    fetch(`${AUTH_BASE}/sign_in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.siEmail, password: this.siPassword }),
    })
      .then(res => res.json())
      .then(data => {
        this.loading = false;
        if (data.access_token) {
          this.auth.setToken(data.access_token);
          this.router.navigate(['/']);
        } else {
          this.siError = '❌ არასწორი იმეილი ან პაროლი.';
        }
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.loading = false;
        this.siError = '❌ შეცდომა, სცადე თავიდან.';
        this.cdr.detectChanges();
      });
  }

  handleSignUp() {
    this.suError = '';
    this.suSuccess = '';
    if (!this.suFirstName || !this.suLastName || !this.suEmail || !this.suPassword || !this.suConfirm) {
      this.suError = '⚠️ შეავსე ყველა სავალდებულო ველი.';
      return;
    }
    if (this.suPassword.length < 6) {
      this.suError = '⚠️ პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს.';
      return;
    }
    if (this.suPassword !== this.suConfirm) {
      this.suError = '❌ პაროლები არ ემთხვევა.';
      return;
    }
    this.loading = true;
    fetch(`${AUTH_BASE}/sign_up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: this.suFirstName,
        lastName: this.suLastName,
        age: this.suAge ?? 18,
        email: this.suEmail,
        password: this.suPassword,
        address: this.suAddress,
        phone: this.suPhone,
        zipcode: this.suZipcode,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + this.suEmail,
        gender: this.suGender,
      }),
    })
      .then(res => res.json())
      .then(data => {
        this.loading = false;
        if (data.email || data.id) {
          this.suSuccess = '✅ ანგარიში შეიქმნა! შედი სისტემაში.';
          setTimeout(() => this.showPanel('signin'), 1500);
        } else {
          this.suError = '❌ ' + (data.message ?? 'შეცდომა რეგისტრაციისას.');
        }
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.loading = false;
        this.suError = '❌ შეცდომა, სცადე თავიდან.';
        this.cdr.detectChanges();
      });
  }
}