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
  showBackTop = false;

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

    this.route.queryParams.subscribe(params => {
      this.activeCategory = params['category'] ? +params['category'] : 0;
      this.spiceFilter = params['spiciness'] ? +params['spiciness'] : 0;
      this.spiceActive = this.spiceFilter > 0;
      this.noNuts = params['noNuts'] === 'true';
      this.vegOnly = params['vegOnly'] === 'true';
      this.fetchFiltered();
    });

    window.addEventListener('scroll', () => {
      this.showBackTop = window.scrollY > 300;
      this.cdr.detectChanges();
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleLang() {
    this.tr.toggle();
    this.cdr.detectChanges();
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
        this.filteredProducts = this.allProducts;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  fetchFiltered() {
    this.loading = true;
    const params: string[] = [];

    if (this.activeCategory !== 0) params.push(`categoryId=${this.activeCategory}`);
    if (this.spiceActive) params.push(`spiciness=${this.spiceFilter}`);
    if (this.noNuts) params.push(`noNuts=true`);
    if (this.vegOnly) params.push(`vegeterian=true`);

    if (params.length === 0) {
      this.filteredProducts = this.allProducts;
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const url = `${API_BASE}/Products/GetFiltered?${params.join('&')}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.filteredProducts = Array.isArray(data) ? data : [];
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
    this.updateQueryParams();
  }

  onSpiceChange(val: number) {
    this.spiceFilter = val;
    this.spiceActive = val > 0;
    this.updateQueryParams();
  }

  applyFilters() {
    this.updateQueryParams();
  }

  resetFilters() {
    this.spiceFilter = 0;
    this.spiceActive = false;
    this.noNuts = false;
    this.vegOnly = false;
    this.router.navigate(['/']);
  }

  updateQueryParams() {
    const params: any = {};
    if (this.activeCategory !== 0) params['category'] = this.activeCategory;
    if (this.spiceFilter > 0) params['spiciness'] = this.spiceFilter;
    if (this.noNuts) params['noNuts'] = 'true';
    if (this.vegOnly) params['vegOnly'] = 'true';

    this.router.navigate(['/'], {
      queryParams: params,
      replaceUrl: true
    });
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