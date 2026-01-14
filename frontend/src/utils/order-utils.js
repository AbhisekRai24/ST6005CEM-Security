// utils/order-utils.js
export function generateOrderId() {
  // Simple unique ID: timestamp + random string
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}