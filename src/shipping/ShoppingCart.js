// src/components/ShoppingCart.js
import React, { useState } from 'react';
import StandardShipping from '../shipping/StandardShipping';
import ExpressShipping from '../shipping/ExpressShipping';
import OvernightShipping from '../shipping/OvernightShipping';

const ShoppingCart = () => {
  const [cart, setCart] = useState({ items: [1, 2, 3] }); // Example items
  const [shippingMethod, setShippingMethod] = useState('Standard');

  const getShippingStrategy = (method) => {
    switch (method) {
      case 'Standard':
        return new StandardShipping();
      case 'Express':
        return new ExpressShipping();
      case 'Overnight':
        return new OvernightShipping();
      default:
        return new StandardShipping();
    }
  };

  const calculateShipping = () => {
    const strategy = getShippingStrategy(shippingMethod);
    return strategy.calculate(cart);
  };

  return (
    <div>
      <h2>Shopping Cart</h2>
      <div>
        <label>
          <input
            type="radio"
            name="shippingMethod"
            value="Standard"
            checked={shippingMethod === 'Standard'}
            onChange={(e) => setShippingMethod(e.target.value)}
          />
          Standard Shipping
        </label>
        <label>
          <input
            type="radio"
            name="shippingMethod"
            value="Express"
            checked={shippingMethod === 'Express'}
            onChange={(e) => setShippingMethod(e.target.value)}
          />
          Express Shipping
        </label>
        <label>
          <input
            type="radio"
            name="shippingMethod"
            value="Overnight"
            checked={shippingMethod === 'Overnight'}
            onChange={(e) => setShippingMethod(e.target.value)}
          />
          Overnight Shipping
        </label>
      </div>
      <p>Shipping Cost: ${calculateShipping()}</p>
    </div>
  );
};

export default ShoppingCart;
 