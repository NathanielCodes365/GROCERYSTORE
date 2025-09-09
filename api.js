const API_BASE = 'http://localhost:3001/api';

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`);
  return await response.json();
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await response.json();
}