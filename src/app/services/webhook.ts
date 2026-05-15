import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class WebhookService {
  private webhookUrl = 'http://localhost:5678/webhook-test/add-to-cart';

  constructor(private http: HttpClient) {}

  submitForm(data: any) {
    return this.http.post(this.webhookUrl, data);
  }
}