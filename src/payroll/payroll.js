import React, { useState } from 'react';

const payrollStyles = `
  .payroll-container {
    width: 100%;
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #f9f9f9;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
    font-family: Arial, sans-serif;
  }

  .form-section {
    display: flex;
    justify-content: space-between;
  }

  .left-side, .right-side {
    width: 45%;
  }

  label {
    display: block;
    margin: 10px 0 5px;
    font-family: Arial, sans-serif;
    color: #333;
  }

  input {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .salary-info {
    margin-top: 20px;
    font-family: Arial, sans-serif;
    color: #333;
  }

  .salary-info div {
    margin: 5px 0;
    font-size: 16px;
  }

  button {
    display: block;
    width: 100%;
    padding: 10px;
    margin-top: 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    font-family: Arial, sans-serif;
  }

  button:hover {
    background-color: #45a049;
  }
`;

function Payroll() {
  const [employeeName, setEmployeeName] = useState('');
  const [ratePerHour, setRatePerHour] = useState(0);
  const [hoursPerDay, setHoursPerDay] = useState(0);
  const [daysWorked, setDaysWorked] = useState(0);
  const [grossSalary, setGrossSalary] = useState(0);
  const [taxRate, setTaxRate] = useState(15);
  const [philHealthRate, setPhilHealthRate] = useState(5);
  const [sssRate, setSSSRate] = useState(2);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [netSalary, setNetSalary] = useState(0);

  const calculateSalary = () => {
    const gross = ratePerHour * hoursPerDay * daysWorked;
    setGrossSalary(gross);

    const tax = (gross * taxRate) / 100;
    const philHealth = (gross * philHealthRate) / 100;
    const sss = (gross * sssRate) / 100;
    const total = tax + philHealth + sss;
    setTotalDeduction(total);

    const net = gross - total;
    setNetSalary(net);
  };

  return (
    <div className="payroll-container">
      <style>{payrollStyles}</style>
      <h2>Simple Payroll System</h2>

      <div className="form-section">
        <div className="left-side">
          <label>Employee Name:</label>
          <input 
            type="text" 
            value={employeeName} 
            onChange={(e) => setEmployeeName(e.target.value)} 
          />

          <label>Rate Per Hour:</label>
          <input 
            type="number" 
            value={ratePerHour} 
            onChange={(e) => setRatePerHour(parseFloat(e.target.value))} 
          />

          <label>Hours Per Day:</label>
          <input 
            type="number" 
            value={hoursPerDay} 
            onChange={(e) => setHoursPerDay(parseFloat(e.target.value))} 
          />

          <label>Number of Days Worked:</label>
          <input 
            type="number" 
            value={daysWorked} 
            onChange={(e) => setDaysWorked(parseInt(e.target.value))} 
          />
        </div>

        <div className="right-side">
          <label>Tax Rate (%):</label>
          <input 
            type="number" 
            value={taxRate} 
            onChange={(e) => setTaxRate(parseFloat(e.target.value))} 
          />

          <label>PhilHealth Rate (%):</label>
          <input 
            type="number" 
            value={philHealthRate} 
            onChange={(e) => setPhilHealthRate(parseFloat(e.target.value))} 
          />

          <label>SSS Rate (%):</label>
          <input 
            type="number" 
            value={sssRate} 
            onChange={(e) => setSSSRate(parseFloat(e.target.value))} 
          />
        </div>
      </div>

      <div className="salary-info">
        <div>GROSS SALARY: {grossSalary.toFixed(2)}</div>
        <div>TOTAL DEDUCTION: {totalDeduction.toFixed(2)}</div>
        <div>NET SALARY: {netSalary.toFixed(2)}</div>
      </div>

      <button onClick={calculateSalary}>Compute</button>
    </div>
  );
}

export default Payroll;
