import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Theme {
  isDark = false;

  toggle() {
    this.isDark = !this.isDark;
    document.body.classList.toggle('dark', this.isDark);
  }
}