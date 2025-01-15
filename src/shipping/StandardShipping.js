    // src/shipping/StandardShipping.js
class StandardShipping {
    calculate(cart) {
      return cart.items.length * 5; // $5 per item
    }
  }
  
  export default StandardShipping;
  