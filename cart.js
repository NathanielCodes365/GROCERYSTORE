// Get current cart from localStorage
function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Add product to cart
function addToCart(productId, quantity = 1) {
  if (!checkAuth()) {
    alert('Please login to add items to cart');
    window.location.href = 'index.html';
    return;
  }

  const cart = getCart();
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  saveCart(cart);
  updateCartCount();
  alert('Item added to cart!');
}

// Remove item from cart
function removeFromCart(productId) {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.productId !== productId);
  saveCart(updatedCart);
  displayCartItems();
}

// Update item quantity in cart
function updateCartItemQuantity(productId, newQuantity) {
  if (newQuantity < 1) return;

  const cart = getCart();
  const item = cart.find(item => item.productId === productId);

  if (item) {
    item.quantity = newQuantity;
    saveCart(cart);
    displayCartItems();
  }
}

// Update cart count in header
function updateCartCount() {
  const cart = getCart();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(element => {
    element.textContent = cartCount;
  });
}

// Display cart items on cart page
async function displayCartItems() {
  const cart = getCart();
  const cartItemsContainer = document.getElementById('cart-items');
  const cartSummary = document.getElementById('cart-summary');
  
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
    cartSummary.innerHTML = '';
    return;
  }

  // Fetch product details for all items in cart
  const products = await fetchProducts();
  let subtotal = 0;

  cartItemsContainer.innerHTML = cart.map(item => {
    const product = products.find(p => p.id == item.productId);
    if (!product) return '';
    
    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="cart-item">
        <img src="${product.imageUrl || 'https://via.placeholder.com/80'}" alt="${product.name}">
        <div class="item-details">
          <h4>${product.name}</h4>
          <div class="item-price">$${product.price.toFixed(2)}</div>
          <div class="item-quantity">
            <button class="quantity-btn" data-id="${product.id}" data-action="decrease">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" data-id="${product.id}" data-action="increase">+</button>
          </div>
        </div>
        <div class="item-total">$${itemTotal.toFixed(2)}</div>
        <button class="remove-item" data-id="${product.id}">&times;</button>
      </div>
    `;
  }).join('');

  // Add event listeners to quantity buttons
  document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-id');
      const action = e.target.getAttribute('data-action');
      const item = cart.find(item => item.productId === productId);
      
      if (item) {
        const newQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
        updateCartItemQuantity(productId, newQuantity);
      }
    });
  });

  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-id');
      removeFromCart(productId);
    });
  });

  // Display cart summary
  const deliveryFee = 2.99;
  const total = subtotal + deliveryFee;

  cartSummary.innerHTML = `
    <h3>Order Summary</h3>
    <div class="summary-row">
      <span>Subtotal:</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Delivery:</span>
      <span>$${deliveryFee.toFixed(2)}</span>
    </div>
    <div class="summary-row total">
      <span>Total:</span>
      <span>$${total.toFixed(2)}</span>
    </div>
    <button id="checkout-btn" class="btn">Proceed to Checkout</button>
  `;

  document.getElementById('checkout-btn')?.addEventListener('click', checkout);
}

async function checkout() {
  if (!checkAuth()) {
    alert('Please login to checkout');
    window.location.href = 'index.html';
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart,
        total: calculateCartTotal()
      })
    });

    if (!response.ok) {
      throw new Error('Checkout failed');
    }

    localStorage.removeItem('cart');
    updateCartCount();
    alert('Order placed successfully!');
    window.location.href = 'orders.html';
  } catch (error) {
    alert(error.message);
  }
}

// Calculate cart total
function calculateCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0) + 2.99;
}

function initCartPage() {
  requireAuth();
  displayCartItems();
  updateCartCount();
}