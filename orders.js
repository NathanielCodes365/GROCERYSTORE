// Fetch user's order history
async function fetchOrders() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// Display order history
async function displayOrders() {
  const orders = await fetchOrders();
  const ordersContainer = document.getElementById('orders-container');
  
  if (!ordersContainer) return;

  if (orders.length === 0) {
    ordersContainer.innerHTML = '<p>You have no orders yet.</p>';
    return;
  }

  ordersContainer.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <h3>Order #${order.id}</h3>
          <p class="order-date">${new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
      </div>
      
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <img src="${item.product.imageUrl || 'https://via.placeholder.com/60'}" alt="${item.product.name}">
            <div class="item-info">
              <h4>${item.product.name}</h4>
              <p>${item.quantity} × $${item.product.price.toFixed(2)}</p>
            </div>
            <div class="item-total">$${(item.quantity * item.product.price).toFixed(2)}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="order-footer">
        <div class="order-total">
          <span>Total:</span>
          <span>$${order.totalAmount.toFixed(2)}</span>
        </div>
        <button class="btn reorder-btn" data-id="${order.id}">Reorder</button>
      </div>
    </div>
  `).join('');

  // Add event listeners to reorder buttons
  document.querySelectorAll('.reorder-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const orderId = e.target.getAttribute('data-id');
      reorder(orderId);
    });
  });
}

// Reorder function
async function reorder(orderId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/reorder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to reorder');
    }

    alert('Items added to cart!');
    window.location.href = 'cart.html';
  } catch (error) {
    alert(error.message);
  }
}

// Initialize orders page
function initOrdersPage() {
  requireAuth();
  displayOrders();
}