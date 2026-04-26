import { Injectable } from '@angular/core';

export type Lang = 'en' | 'ka';

@Injectable({
  providedIn: 'root'
})
export class Translate {
  currentLang: Lang = 'en';

  toggle() {
    this.currentLang = this.currentLang === 'en' ? 'ka' : 'en';
  }

  t(key: string): string {
    return this.translations[this.currentLang][key] ?? key;
  }

  translations: Record<Lang, Record<string, string>> = {
    en: {
      home: 'Home',
      login: 'Login',
      logout: 'Logout',
      cart: 'Cart',
      hero_title: 'Fast And Efficient, Online Ordering You Must Try.',
      categories: 'Categories',
      filter: 'Filter',
      spiciness: 'Spiciness',
      not_chosen: 'Not Chosen',
      no_nuts: 'No Nuts',
      vegetarian_only: 'Vegetarian Only',
      reset: 'RESET',
      add_to_cart: 'Add to Cart',
      loading: 'Loading...',
      no_dishes: 'No dishes found.',
      vegetarian: 'Vegetarian',
      contains_nuts: 'Contains Nuts',
      spiciness_label: 'Spiciness',
      footer: 'All rights reserved.',
      cart_title: 'Cart',
      product: 'Product',
      qty: 'Qty',
      price: 'Price',
      total: 'Total',
      checkout: 'PROCEED TO CHECKOUT',
      cart_empty: 'Your cart is empty 🛒',
      grand_total: 'Total',
      welcome: 'Welcome Back 🍽',
      login_subtitle: 'Login to continue your order',
      email: 'Email',
      password: 'Password',
      no_account: "Don't have an account?",
      sign_up: 'Sign Up',
      create_account: 'Create Account 🍽',
      signup_subtitle: 'Sign up to start ordering',
      first_name: 'First Name',
      last_name: 'Last Name',
      age: 'Age',
      confirm_password: 'Confirm Password',
      address: 'Address',
      phone: 'Phone',
      zipcode: 'Zipcode',
      gender: 'Gender',
      have_account: 'Already have an account?',
      back_home: '← Back to Home',
    },
    ka: {
      home: 'მთავარი',
      login: 'შესვლა',
      logout: 'გასვლა',
      cart: 'კალათა',
      hero_title: 'სწრაფი და ეფექტური, ონლაინ შეკვეთა რომელიც უნდა სცადო.',
      categories: 'კატეგორიები',
      filter: 'ფილტრი',
      spiciness: 'სიმწარე',
      not_chosen: 'არჩეული არ არის',
      no_nuts: 'თხილის გარეშე',
      vegetarian_only: 'მხოლოდ ვეგეტარიანული',
      reset: 'გასუფთავება',
      add_to_cart: 'კალათაში დამატება',
      loading: 'იტვირთება...',
      no_dishes: 'კერძი ვერ მოიძებნა.',
      vegetarian: 'ვეგეტარიანული',
      contains_nuts: 'შეიცავს თხილს',
      spiciness_label: 'სიმწარე',
      footer: 'ყველა უფლება დაცულია.',
      cart_title: 'კალათა',
      product: 'პროდუქტი',
      qty: 'რაოდენობა',
      price: 'ფასი',
      total: 'სულ',
      checkout: 'შეკვეთის განთავსება',
      cart_empty: 'კალათა ცარიელია 🛒',
      grand_total: 'სულ',
      welcome: 'კეთილი დაბრუნება 🍽',
      login_subtitle: 'შედი შეკვეთის გასაგრძელებლად',
      email: 'იმეილი',
      password: 'პაროლი',
      no_account: 'არ გაქვს ანგარიში?',
      sign_up: 'რეგისტრაცია',
      create_account: 'ანგარიშის შექმნა 🍽',
      signup_subtitle: 'დარეგისტრირდი შეკვეთის დასაწყებად',
      first_name: 'სახელი',
      last_name: 'გვარი',
      age: 'ასაკი',
      confirm_password: 'პაროლის დადასტურება',
      address: 'მისამართი',
      phone: 'ტელეფონი',
      zipcode: 'საფოსტო კოდი',
      gender: 'სქესი',
      have_account: 'უკვე გაქვს ანგარიში?',
      back_home: '← მთავარზე დაბრუნება',
    }
  };
}