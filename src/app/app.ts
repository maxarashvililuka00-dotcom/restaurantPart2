import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Theme } from './theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('restaurantPart2');
  constructor(public theme: Theme) {}
}