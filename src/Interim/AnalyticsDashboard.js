import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { interimDb } from '../components/firebase.config'; 

const AnalyticsDashboard = () => {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const querySnapshot = await getDocs(collection(interimDb, 'users'));
      const users = querySnapshot.docs.map((doc) => doc.data());
      
      // Process data for chart
      const data = users.map((user, index) => ({
        name: `User ${index + 1}`,
        users: users.length,
        active: user.status === 'Active' ? 1 : 0,
      }));

      setUserData(data);
    };

    fetchUserData();
  }, []);

  return (
    <div>
      <h3>User Analytics</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={userData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="users" stroke="#8884d8" />
          <Line type="monotone" dataKey="active" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsDashboard;
