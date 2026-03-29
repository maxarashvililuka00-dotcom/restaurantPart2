import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

const API_BASE = 'https://restaurant.stepprojects.ge/api';

const CATEGORIES: Record<number, string> = {
  0: 'All', 1: 'Salads', 2: 'Soups', 3: 'Chicken-Dishes',
  4: 'Beef-Dishes', 5: 'Seafood-Dishes', 6: 'Vegetable-Dishes',
  7: 'Bits&Bites', 8: 'On-The-Side'
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  allProducts: any[] = [];
  activeCategory = 0;
  spiceActive = false;
  spiceFilter = 0;

  ngOnInit() { this.init(); }

  async init() {
    const grid = document.getElementById('productsGrid')!;
    grid.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';
    try {
      const res = await fetch(`${API_BASE}/Products/GetAll`);
      this.allProducts = await res.json();
    } catch { grid.innerHTML = '<div class="loading">❌ Failed to load</div>'; return; }
    this.buildCategoryTabs();
    this.renderProducts();
    this.updateCartBadge();
  }

  buildCategoryTabs() {
    const tabs = document.getElementById('categoryTabs')!;
    tabs.innerHTML = Object.entries(CATEGORIES).map(([id, name]) =>
      `<button class="cat-tab ${id == '0' ? 'active' : ''}" onclick="window['setCategory'](${id}, this)">${name}</button>`
    ).join('');
    (window as any)['setCategory'] = (id: number, el: HTMLElement) => { this.setCategory(id, el); };
  }

  setCategory(id: number, el: HTMLElement) {
    this.activeCategory = +id;
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    this.applyFilters();
  }

  applyFilters() {
    const noNuts = (document.getElementById('noNutsCheck') as HTMLInputElement).checked;
    const vegOnly = (document.getElementById('vegCheck') as HTMLInputElement).checked;
    const filtered = this.allProducts.filter(p => {
      if (this.activeCategory !== 0 && p.categoryId !== this.activeCategory) return false;
      if (noNuts && p.nuts) return false;
      if (vegOnly && !p.vegeterian) return false;
      if (this.spiceActive && p.spiciness !== this.spiceFilter) return false;
      return true;
    });
    this.renderProducts(filtered);
  }

  resetFilters() {
    const slider = document.getElementById('spiceSlider') as HTMLInputElement;
    slider.value = '0'; slider.style.background = '#ddd';
    (document.getElementById('spiceLabel') as HTMLElement).textContent = 'Not Chosen';
    (document.getElementById('noNutsCheck') as HTMLInputElement).checked = false;
    (document.getElementById('vegCheck') as HTMLInputElement).checked = false;
    this.spiceActive = false; this.spiceFilter = 0;
    this.renderProducts();
  }

  renderProducts(list?: any[]) {
    const grid = document.getElementById('productsGrid')!;
    const products = list ?? this.allProducts.filter(p => this.activeCategory === 0 || p.categoryId === this.activeCategory);
    if (!products.length) { grid.innerHTML = '<div class="loading">😕 No dishes found.</div>'; return; }
    grid.innerHTML = products.map(p => `
      <div class="product-card">
        <div class="card-img-wrap"><img src="${p.image}" alt="${p.name}" onerror="this.parentElement.innerHTML='<div style=height:170px;display:flex;align-items:center;justify-content:center;font-size:3rem>🍽️</div>'"></div>
        <div class="card-body">
          <div class="card-name">${p.name}</div>
          <div class="card-spiciness">Spiciness: ${p.spiciness ?? 0}</div>
          <div class="card-price">$${Number(p.price ?? 0).toFixed(2)}</div>
          <div class="card-badges">
            ${p.vegeterian ? '<span class="badge badge-veg">Vegetarian</span>' : ''}
            ${p.nuts ? '<span class="badge badge-nuts">Contains Nuts</span>' : ''}
          </div>
          <button class="add-to-cart-btn" onclick="window['addToCart'](${p.id})">Add to Cart</button>
        </div>
      </div>`).join('');
    (window as any)['addToCart'] = (id: number) => { this.addToCart(id); };
  }

  async updateCartBadge() {
    const badge = document.getElementById('cartBadge')!;
    try {
      const items = await (await fetch(`${API_BASE}/Baskets/GetAll`)).json();
      const total = items.reduce((s: number, i: any) => s + (i.quantity ?? 0), 0);
      badge.textContent = total; badge.style.display = total > 0 ? 'flex' : 'none';
    } catch { badge.style.display = 'none'; }
  }

  async addToCart(productId: number) {
    const product = this.allProducts.find(p => p.id === productId);
    try {
      const items = await (await fetch(`${API_BASE}/Baskets/GetAll`)).json();
      const existing = items.find((i: any) => (i.product?.id ?? i.productId) === productId);
      if (existing) {
        await fetch(`${API_BASE}/Baskets/UpdateBasket`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity: existing.quantity + 1 }) });
      } else {
        await fetch(`${API_BASE}/Baskets/AddToBasket`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity: 1 }) });
      }
      this.showToast(`✅ ${product.name} added!`);
      this.updateCartBadge();
    } catch { this.showToast('❌ Could not add to cart'); }
  }

  showToast(msg: string) {
    const t = document.getElementById('toast')!;
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
}