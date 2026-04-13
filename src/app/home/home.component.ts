import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../auth';

const API_BASE = 'https://restaurant.stepprojects.ge/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];
  activeCategory = 0;

  spiceActive = false;
  spiceFilter = 0;
  noNuts = false;
  vegOnly = false;

  cartCount = 0;
  toastMsg = '';
  toastVisible = false;
  loading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public auth: Auth
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.updateCartBadge();
  }

  loadCategories() {
    fetch(`${API_BASE}/Categories/GetAll`)
      .then(res => res.json())
      .then((data: any[]) => {
        this.categories = [{ id: 0, name: 'All' }, ...data];
        this.cdr.detectChanges();
      });
  }

  loadProducts() {
    this.loading = true;
    fetch(`${API_BASE}/Products/GetAll`)
      .then(res => res.json())
      .then((data: any) => {
        this.allProducts = Array.isArray(data) ? data : [];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  setCategory(id: number) {
    this.activeCategory = id;
    this.applyFilters();
  }

  onSpiceChange(val: number) {
    this.spiceFilter = val;
    this.spiceActive = val > 0;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.allProducts.filter((p) => {
      if (this.activeCategory !== 0 && p.categoryId !== this.activeCategory) return false;
      if (this.noNuts && p.nuts) return false;
      if (this.vegOnly && !p.vegeterian) return false;
      if (this.spiceActive && p.spiciness !== this.spiceFilter) return false;
      return true;
    });
    this.cdr.detectChanges();
  }

  resetFilters() {
    this.spiceFilter = 0;
    this.spiceActive = false;
    this.noNuts = false;
    this.vegOnly = false;
    this.applyFilters();
  }

  getSpicePercent(): string {
    return ((this.spiceFilter / 4) * 100) + '%';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  addToCart(product: any) {
    fetch(`${API_BASE}/Baskets/GetAll`)
      .then(res => res.json())
      .then((items: any[]) => {
        const existing = items.find(
          (i: any) => (i.product?.id ?? i.productId) === product.id
        );
        const body = existing
          ? { productId: product.id, quantity: existing.quantity + 1 }
          : { productId: product.id, quantity: 1 };
        const method = existing ? 'PUT' : 'POST';
        const url = existing
          ? `${API_BASE}/Baskets/UpdateBasket`
          : `${API_BASE}/Baskets/AddToBasket`;

        return fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      })
      .then(() => {
        this.showToast(`✅ ${product.name} added!`);
        this.updateCartBadge();
      })
      .catch(() => this.showToast('❌ Could not add to cart'));
  }

  updateCartBadge() {
    fetch(`${API_BASE}/Baskets/GetAll`)
      .then(res => res.json())
      .then((items: any[]) => {
        this.cartCount = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.cartCount = 0;
        this.cdr.detectChanges();
      });
  }

  showToast(msg: string) {
    this.toastMsg = msg;
    this.toastVisible = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 2500);
  }
}