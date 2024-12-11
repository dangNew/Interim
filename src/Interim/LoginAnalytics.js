import React, { useEffect, useState } from 'react';
import { rentmobileDb } from '../components/firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const LoginAnalytics = () => {
  const [loginData, setLoginData] = useState([]);

  useEffect(() => {
    const fetchLoginData = async () => {
      const usersCollection = collection(rentmobileDb, 'admin_users');
      const snapshot = await getDocs(usersCollection);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const logins = users.filter(user => user.createdAt);
      setLoginData(logins);
    };
    fetchLoginData();
  }, []);

  const parseCreatedAt = (createdAt) => {
    if (createdAt && createdAt.seconds) return new Date(createdAt.seconds * 1000);
    if (typeof createdAt === 'string') {
      const date = new Date(createdAt);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  };

  const getWeekNumber = (date) => {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startDate.getDay() + 1) / 7);
  };

  const processData = () => {
    const counts = { daily: {}, weekly: {}, monthly: {} };
    loginData.forEach(user => {
      const date = parseCreatedAt(user.createdAt);
      if (!date) return;
      const day = date.toISOString().split('T')[0];
      const week = `${date.getFullYear()}-W${getWeekNumber(date)}`;
      const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
      counts.daily[day] = (counts.daily[day] || 0) + 1;
      counts.weekly[week] = (counts.weekly[week] || 0) + 1;
      counts.monthly[month] = (counts.monthly[month] || 0) + 1;
    });
    return counts;
  };

  const aggregatedData = processData();

  const data = {
    labels: Object.keys(aggregatedData.daily),
    datasets: [
      {
        label: 'Daily Logins',
        data: Object.values(aggregatedData.daily),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        pointBackgroundColor: '#4caf50',
        fill: true,
      },
      {
        label: 'Weekly Logins',
        data: Object.values(aggregatedData.weekly),
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.2)',
        pointBackgroundColor: '#ff9800',
        fill: true,
      },
      {
        label: 'Monthly Logins',
        data: Object.values(aggregatedData.monthly),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        pointBackgroundColor: '#2196f3',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'User Login Trends',
        font: { size: 18 },
      },
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Logins' } },
    },
  };

  return (
    <div
  style={{
    maxWidth: '100%',
    width: '100%',
    marginLeft: '20px',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    border: '2px solid #4caf50', // Added border
  }}
>

      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>User Login Analytics</h2>
      <div style={{ height: '390px', position: 'relative' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LoginAnalytics;
