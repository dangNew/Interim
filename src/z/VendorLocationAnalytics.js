import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { rentmobileDb } from '../components/firebase.config';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const VendorLocationAnalytics = () => {
  const [locationData, setLocationData] = useState({});

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const vendorCollection = collection(rentmobileDb, 'Vendorusers');
        const snapshot = await getDocs(vendorCollection);
        const vendors = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const locationCount = vendors.reduce((acc, vendor) => {
          const location = vendor.stallInfo?.location || 'Unknown';
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        }, {});

        setLocationData(locationCount);
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      }
    };

    fetchVendorData();
  }, []);

  const prepareChartData = () => {
    const labels = Object.keys(locationData);
    const data = Object.values(locationData);

    return {
      labels,
      datasets: [
        {
          label: 'Number of Vendors',
          data,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Vendor Distribution by Location',
        font: { size: 16, family: 'Poppins, Arial', weight: '600', color: '#1d3557' },
      },
      legend: {
        labels: {
          color: '#333',
          font: { size: 12, family: 'Poppins, Arial', weight: '400' },
        },
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1d3557',
        bodyColor: '#333',
        borderColor: '#1d3557',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#f0f0f0',
        },
        title: {
          display: true,
          text: 'Location',
          color: '#1d3557',
          font: { size: 12, weight: '500' },
        },
        ticks: {
          color: '#555',
          font: { size: 10 },
        },
      },
      y: {
        grid: {
          color: '#f0f0f0',
        },
        title: {
          display: true,
          text: 'Number of Vendors',
          color: '#1d3557',
          font: { size: 12, weight: '500' },
        },
        ticks: {
          color: '#555',
        },
      },
    },
  };

  return (
    <div style={{ fontFamily: 'Poppins, Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '80vh', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '10px', padding: '10px', background: '#1d3557', color: '#fff', borderRadius: '8px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Vendor Location Analytics</h1>
        <p style={{ margin: 0, fontSize: '14px' }}>Insights into vendor distribution across locations</p>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: '#ffffff',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            border: '1px solid #dee2e6',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              color: '#1d3557',
              marginBottom: '20px',
              fontWeight: '600',
              fontSize: '18px',
            }}
          >
            Vendor Distribution by Location
          </h2>
          <div style={{ height: '320px' }}>
            <Bar data={prepareChartData()} options={options} />
          </div>
        </div>
      </main>
      <footer style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#868e96' }}>
        © 2024 Vendor Analytics Platform
      </footer>
    </div>
  );
};

export default VendorLocationAnalytics;
