import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
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
    <div style={{
      maxWidth: '350px', 
      margin: 'auto', 
      padding: '15px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      backgroundColor: '#f9f9f9',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <h4 style={{ fontSize: '18px', marginBottom: '10px', textAlign: 'center', color: '#333' }}>User Analytics</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={userData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={10} label={{ value: "Users", position: "insideBottom", offset: -5, fontSize: 12 }} />
          <YAxis fontSize={10} label={{ value: "Count", angle: -90, position: "insideLeft", fontSize: 12 }} />
          <Tooltip contentStyle={{ fontSize: 12, backgroundColor: '#fff', borderColor: '#ddd' }} />
          <Legend verticalAlign="top" height={30} iconType="square" />
          <Line type="monotone" dataKey="users" name="Total Users" stroke="#8884d8" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="active" name="Active Users" stroke="#82ca9d" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsDashboard;