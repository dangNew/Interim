import React, { useState, useEffect } from 'react';
import './DigitalClock.css';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const hours = time.getHours() % 12 || 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const period = time.getHours() >= 12 ? 'PM' : 'AM';

  return (
    <div className="digital-clock">
      <h1>THIS IS THE CURRENT TIME.</h1>
      <div className="time-container">
        <div className="time-box hours">
          {hours.toString().padStart(2, '0')}
          <span>HOURS</span>
        </div>
        <div className="time-box minutes">
          {minutes.toString().padStart(2, '0')}
          <span>MINUTE</span>
        </div>
        <div className="time-box seconds">
          {seconds.toString().padStart(2, '0')}
          <span>SECOND</span>
        </div>
        <div className="time-box period">
          {period}
        </div>
      </div>
    </div>
  );
};

export default DigitalClock;
