// src/shipping/OvernightShipping.js
class OvernightShipping {
    calculate(cart) {
      return cart.items.length * 20; // $20 per item
    }
  }
  
  export default OvernightShipping;
  