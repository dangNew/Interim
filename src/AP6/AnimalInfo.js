// src/AnimalInfo.js
import React, { useState } from 'react';

const AnimalInfo = () => {
  const [animals, setAnimals] = useState([]);

  const fetchAnimalInfo = () => {
    const newAnimals = [
      { name: 'Meowsy', type: 'cat' },
      { name: 'Barky', type: 'dog' },
      { name: 'Purrpaws', type: 'cat' }
    ];
    setAnimals(newAnimals);
  };

  return (
    <div>
      <h1>JSON and AJAX</h1>
      <button onClick={fetchAnimalInfo}>Fetch Info for 3 New Animals</button>
      <ul>
        {animals.map((animal, index) => (
          <li key={index}>{animal.name} is a {animal.type}</li>
        ))}
      </ul>
    </div>
  );
};

export default AnimalInfo;
