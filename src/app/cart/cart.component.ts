import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

const API_BASE = 'https://restaurant.stepprojects.ge/api';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  loading = true;
  cartCount = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.renderCart();
  }

  renderCart() {
    this.loading = true;
    fetch(`${API_BASE}/Baskets/GetAll`)
      .then(res => res.json())
      .then((items: any[]) => {
        this.cartItems = Array.isArray(items) ? items : [];
        this.cartCount = this.cartItems.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
        this.loading = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  getPrice(item: any): number {
    return item.product?.price ?? item.price ?? 0;
  }

  getName(item: any): string {
    return item.product?.name ?? item.name ?? '';
  }

  getImage(item: any): string {
    return item.product?.image ?? item.image ?? '';
  }

  getId(item: any): number {
    return item.product?.id ?? item.productId;
  }

  getTotal(item: any): number {
    return this.getPrice(item) * item.quantity;
  }

  getGrandTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + this.getTotal(item), 0);
  }

  updateQty(item: any, newQty: number) {
    const id = this.getId(item);
    if (newQty <= 0) {
      fetch(`${API_BASE}/Baskets/DeleteProduct/${id}`, { method: 'DELETE' })
        .then(() => this.renderCart());
    } else {
      fetch(`${API_BASE}/Baskets/UpdateBasket`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, quantity: newQty }),
      }).then(() => this.renderCart());
    }
  }

  removeItem(item: any) {
    fetch(`${API_BASE}/Baskets/DeleteProduct/${this.getId(item)}`, { method: 'DELETE' })
      .then(() => this.renderCart());
  }

  checkout() {
    if (!this.cartItems.length) {
      alert('კალათა ცარიელია!');
      return;
    }
    const deletes = this.cartItems.map(item =>
      fetch(`${API_BASE}/Baskets/DeleteProduct/${this.getId(item)}`, { method: 'DELETE' })
    );
    Promise.all(deletes).then(() => {
      alert('🎉 შეკვეთა განთავსდა!');
      this.renderCart();
    });
  }
}