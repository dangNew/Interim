import React, { useState } from 'react';

const ATMSystem = () => {
  // State to manage customers
  const [customers, setCustomers] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  // Add customer
  const addCustomer = () => {
    if (customerName && !customers[customerName]) {
      setCustomers({
        ...customers,
        [customerName]: { balance: 0 }
      });
      setCustomerName('');
      setMessage(`Customer ${customerName} added!`);
    } else {
      setMessage('Customer already exists or invalid name.');
    }
  };

  // Handle selecting a customer
  const selectCustomer = (e) => {
    setSelectedCustomer(e.target.value);
    setMessage('');
  };

  // Check balance
  const checkBalance = () => {
    if (selectedCustomer) {
      setMessage(`Balance: $${customers[selectedCustomer].balance}`);
    } else {
      setMessage('Please select a customer.');
    }
  };

  // Deposit money
  const depositMoney = () => {
    if (selectedCustomer && amount > 0) {
      setCustomers({
        ...customers,
        [selectedCustomer]: {
          balance: customers[selectedCustomer].balance + parseFloat(amount)
        }
      });
      setMessage(`Deposited $${amount} to ${selectedCustomer}'s account.`);
      setAmount('');
    } else {
      setMessage('Please enter a valid amount and select a customer.');
    }
  };

  // Withdraw money
  const withdrawMoney = () => {
    if (selectedCustomer && amount > 0 && customers[selectedCustomer].balance >= amount) {
      setCustomers({
        ...customers,
        [selectedCustomer]: {
          balance: customers[selectedCustomer].balance - parseFloat(amount)
        }
      });
      setMessage(`Withdrew $${amount} from ${selectedCustomer}'s account.`);
      setAmount('');
    } else {
      setMessage('Invalid amount or insufficient balance.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>ATM System</h2>

      <div>
        <input
          type="text"
          placeholder="Add Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <button onClick={addCustomer}>Add Customer</button>
      </div>

      {Object.keys(customers).length > 0 && (
        <>
          <div style={{ marginTop: '20px' }}>
            <select onChange={selectCustomer} value={selectedCustomer || ''}>
              <option value="" disabled>Select Customer</option>
              {Object.keys(customers).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button onClick={checkBalance}>Check Balance</button>
          </div>

          <div style={{ marginTop: '10px' }}>
            <input
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={depositMoney}>Deposit</button>
            <button onClick={withdrawMoney}>Withdraw</button>
          </div>
        </>
      )}

      <div style={{ marginTop: '20px', color: 'blue' }}>{message}</div>
    </div>
  );
};

export default ATMSystem;
