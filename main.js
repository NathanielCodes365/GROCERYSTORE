// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// DOM Elements
const navLinks = document.querySelectorAll('nav a');
const currentPath = window.location.pathname.split('/').pop();

// Highlight current page in navigation
navLinks.forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('active');
  }
});

// Initialize modules based on current page
document.addEventListener('DOMContentLoaded', () => {
  switch(currentPath) {
    case 'index.html':
      initHomePage();
      break;
    case 'shop.html':
      initShopPage();
      break;
    case 'offers.html':
      initOffersPage();
      break;
    case 'cart.html':
      initCartPage();
      break;
    case 'orders.html':
      initOrdersPage();
      break;
  }
});

// Check if user is logged in
function checkAuth() {
  return localStorage.getItem('token') !== null;
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!checkAuth()) {
    window.location.href = 'index.html';
  }
}

// Display user info in header
function displayUserInfo() {
  const token = localStorage.getItem('token');
  if (token) {
    const userInfo = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('user-greeting').textContent = `Hi, ${userInfo.name}`;
  }
}

// Initialize offers page
function initOffersPage() {
  displaySpecialOffers();
  updateCartCount();
}

// Display special offers
async function displaySpecialOffers() {
  const products = await fetchProducts();
  const offersContainer = document.getElementById('offers-container');
  
  if (!offersContainer) return;

  // Get products with discounts
  const discountedProducts = products.filter(product => product.discount > 0);

  if (discountedProducts.length === 0) {
    offersContainer.innerHTML = '<p>No special offers available at the moment.</p>';
    return;
  }

  offersContainer.innerHTML = discountedProducts.map(product => `
    <div class="offer-card">
      <div class="offer-badge">${product.discount}% OFF</div>
      <img src="${product.imageUrl || 'https://via.placeholder.com/200'}" alt="${product.name}">
      <div class="offer-details">
        <h3>${product.name}</h3>
        <div class="price">
          <span class="current-price">$${product.price.toFixed(2)}</span>
          <span class="original-price">$${(product.price * (1 + product.discount/100)).toFixed(2)}</span>
        </div>
        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    </div>
  `).join('');
}