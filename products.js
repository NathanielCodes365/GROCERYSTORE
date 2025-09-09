// Fetch all products
async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Display products on shop page
async function displayProducts() {
  const products = await fetchProducts();
  const productsContainer = document.getElementById('products-container');
  
  if (!productsContainer) return;

  productsContainer.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.name}">
      <h3>${product.name}</h3>
      <div class="price">
        $${product.price.toFixed(2)}
        ${product.discount > 0 ? 
          `<span class="discount">${product.discount}% off</span>` : ''}
      </div>
      <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
    </div>
  `).join('');

  // Add event listeners to all add-to-cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-id');
      addToCart(productId);
    });
  });
}

// Initialize shop page
function initShopPage() {
  displayProducts();
  setupSearch();
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-btn');
  
  if (searchInput && searchButton) {
    searchButton.addEventListener('click', async () => {
      const searchTerm = searchInput.value.toLowerCase();
      const products = await fetchProducts();
      const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
      
      displayFilteredProducts(filteredProducts);
    });
  }
}

// Display filtered products
function displayFilteredProducts(products) {
  const productsContainer = document.getElementById('products-container');
  productsContainer.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.name}">
      <h3>${product.name}</h3>
      <div class="price">$${product.price.toFixed(2)}</div>
      <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
    </div>
  `).join('');
}