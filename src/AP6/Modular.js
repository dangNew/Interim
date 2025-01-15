// Modular.js
import React, { useState } from 'react';
import './Modular.css'; // Assuming you have some basic styling in a CSS file

const Modular = () => {
  const [name, setName] = useState('');
  const [people, setPeople] = useState([]);

  const handleAddPerson = () => {
    if (name.trim()) {
      setPeople([...people, name]);
      setName('');
    }
  };

  return (
    <div className="container">
      <h1>JS Tutorials</h1>
      <div className="people-section">
        <h2>People</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <button onClick={handleAddPerson}>Add Person</button>
        <ul>
          {people.map((person, index) => (
            <li key={index}>{person}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Modular;
