import React, { useEffect, useState } from 'react';
import { interimDb } from '../components/firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement, // Important for rendering data points on the chart
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
      const usersCollection = collection(interimDb, 'users');
      const snapshot = await getDocs(usersCollection);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log('Fetched users:', users);

      // Filter users with a valid createdAt timestamp
      const logins = users.filter(user => user.createdAt);
      setLoginData(logins);
    };

    fetchLoginData();
  }, []);

  const processData = () => {
    const counts = {
      daily: {},
      weekly: {},
      monthly: {},
    };

    loginData.forEach(user => {
      const date = parseCreatedAt(user.createdAt); // Parse the createdAt timestamp
      if (!date) return; // Skip if parsing fails

      const day = date.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
      const week = `${date.getFullYear()}-W${getWeekNumber(date)}`; // Get week number
      const month = `${date.getFullYear()}-${date.getMonth() + 1}`; // Get month in YYYY-MM format

      // Increment the counts
      counts.daily[day] = (counts.daily[day] || 0) + 1;
      counts.weekly[week] = (counts.weekly[week] || 0) + 1;
      counts.monthly[month] = (counts.monthly[month] || 0) + 1;
    });

    console.log('Aggregated counts:', counts); // Debug log to check aggregated data
    return counts;
  };

  const parseCreatedAt = (createdAt) => {
    // Check if createdAt is a Firestore Timestamp
    if (createdAt && createdAt.seconds) {
      return new Date(createdAt.seconds * 1000); // Convert seconds to milliseconds
    }

    // If createdAt is a string, convert it to a Date object
    if (typeof createdAt === 'string') {
      const date = new Date(createdAt);
      return isNaN(date.getTime()) ? null : date; // Return null if date is invalid
    }

    return null; // Return null for unexpected types
  };

  const getWeekNumber = (date) => {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startDate.getDay() + 1) / 7);
  };

  const aggregatedData = processData();

  const data = {
    labels: Object.keys(aggregatedData.daily), // Daily labels for the x-axis
    datasets: [
      {
        label: 'Daily Logins',
        data: Object.values(aggregatedData.daily),
        fill: false,
        borderColor: 'green',
      },
      {
        label: 'Monthly Logins',
        data: Object.values(aggregatedData.monthly),
        fill: false,
        borderColor: 'blue',
      },
      {
        label: 'Weekly Logins',
        data: Object.values(aggregatedData.weekly),
        fill: false,
        borderColor: 'orange',
      },
    ],
  };

  return (
    <div>
      <h2>User Logins Analytics</h2>
      <Line data={data} />
    </div>
  );
};

export default LoginAnalytics;
