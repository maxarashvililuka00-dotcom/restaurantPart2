import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../auth';
import { Theme } from '../theme';
import { Translate } from '../translate';

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
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public auth: Auth,
    public theme: Theme,
    public tr: Translate
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.updateCartBadge();

    this.route.params.subscribe(params => {
      this.activeCategory = params['id'] ? +params['id'] : 0;
      this.applyFilters();
    });
  }

  loadCategories() {
    this.http.get<any[]>(`${API_BASE}/Categories/GetAll`).subscribe({
      next: (data) => {
        this.categories = [{ id: 0, name: 'All' }, ...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Categories error:', err),
    });
  }

  loadProducts() {
    this.loading = true;
    this.http.get<any[]>(`${API_BASE}/Products/GetAll`).subscribe({
      next: (data) => {
        this.allProducts = Array.isArray(data) ? data : [];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setCategory(id: number) {
    this.activeCategory = id;
    this.router.navigate(id === 0 ? ['/'] : ['/category', id]);
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
    this.http.get<any[]>(`${API_BASE}/Baskets/GetAll`).subscribe({
      next: (items) => {
        const existing = items.find(
          (i: any) => (i.product?.id ?? i.productId) === product.id
        );
        if (existing) {
          this.http.put(`${API_BASE}/Baskets/UpdateBasket`, {
            productId: product.id,
            quantity: existing.quantity + 1,
          }).subscribe({
            next: () => {
              this.showToast(`✅ ${product.name} added!`);
              this.updateCartBadge();
            },
            error: () => this.showToast('❌ Could not add to cart'),
          });
        } else {
          this.http.post(`${API_BASE}/Baskets/AddToBasket`, {
            productId: product.id,
            quantity: 1,
          }).subscribe({
            next: () => {
              this.showToast(`✅ ${product.name} added!`);
              this.updateCartBadge();
            },
            error: () => this.showToast('❌ Could not add to cart'),
          });
        }
      },
      error: () => this.showToast('❌ Could not add to cart'),
    });
  }

  updateCartBadge() {
    this.http.get<any[]>(`${API_BASE}/Baskets/GetAll`).subscribe({
      next: (items) => {
        this.cartCount = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
        this.cdr.detectChanges();
      },
      error: () => (this.cartCount = 0),
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