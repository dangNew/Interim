// src/shipping/ExpressShipping.js
class ExpressShipping {
    calculate(cart) {
      return cart.items.length * 10; // $10 per item
    }
  }
  
  export default ExpressShipping;
  