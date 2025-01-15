import React, { useEffect, useState, useRef } from 'react';
import { rentmobileDb } from '../components/firebase.config';
import { collection, getDocs } from 'firebase/firestore';
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
import html2canvas from 'html2canvas';

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Graph = () => {
  const [goodsData, setGoodsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchGoodsData = async () => {
      try {
        const carbonCollection = collection(rentmobileDb, 'appraisals');
        const snapshot = await getDocs(carbonCollection);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setGoodsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGoodsData();
  }, []);

  // Function to get date parts (day, month, year)
  const getDateParts = (dateString) => {
    const date = new Date(dateString);
    return {
      day: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,  // Format: YYYY-MM-DD
      month: `${date.getFullYear()}-${date.getMonth() + 1}`,                  // Format: YYYY-MM
    };
  };

  // Get the current date
  const currentDate = new Date();
  const currentDateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

  // Aggregate goods data based on date (daily or monthly)
  const aggregateAppraisals = (dateRange) => {
    const goodsMap = {};
    goodsData.forEach((good) => {
      const { goods_name, total_amount, quantity, created_date } = good;
      if (goods_name && total_amount && quantity && created_date) {
        const dateParts = getDateParts(created_date);

        // Use the selected date range (day or month)
        const dateKey = dateRange === 'daily' ? dateParts.day : dateParts.month;

        if (!goodsMap[goods_name]) {
          goodsMap[goods_name] = {};
        }
        if (!goodsMap[goods_name][dateKey]) {
          goodsMap[goods_name][dateKey] = { total_amount: 0, quantity: 0 };
        }

        goodsMap[goods_name][dateKey].total_amount += total_amount;
        goodsMap[goods_name][dateKey].quantity += quantity;
      }
    });

    return goodsMap;
  };

  // Handle daily and monthly aggregations
  const dailyAggregatedData = aggregateAppraisals('daily');
  const monthlyAggregatedData = aggregateAppraisals('monthly');

  // Prepare data for the Bar chart (Daily)
  const prepareChartData = (aggregatedData, highlightCurrentDate = false) => {
    const labels = Object.keys(aggregatedData);
    const totalAmountData = labels.map((label) =>
      Object.values(aggregatedData[label]).reduce((sum, item) => sum + item.total_amount, 0)
    );
    const quantityData = labels.map((label) =>
      Object.values(aggregatedData[label]).reduce((sum, item) => sum + item.quantity, 0)
    );
  
    const datasets = [
      {
        label: 'Total Appraisal Value',
        data: totalAmountData,
        backgroundColor: 'rgba(0, 176, 155, 0.8)', // Bright teal
        borderColor: 'rgba(0, 176, 155, 1)',
        borderWidth: 1,
      },
      {
        label: 'Quantity',
        data: quantityData,
        backgroundColor: 'rgba(255, 99, 132, 0.8)', // Bright red
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ];
  
    // Add total appraisal value under each goods name
    const chartDataWithLabels = labels.map((label, index) => ({
      label: `${label} (₱${totalAmountData[index]})`,
      totalAmount: totalAmountData[index],
      quantity: quantityData[index],
    }));
  
    return { labels: chartDataWithLabels.map(item => item.label), datasets };
  };
  // Chart options
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Most Appraised Goods Analysis',
        font: { size: 20, family: 'Arial', weight: '600', color: '#48BF91' },
      },
      legend: {
        labels: {
          color: '#333',
          font: { size: 12, family: 'Arial', weight: '500' },
        },
      },
      tooltip: {
        backgroundColor: '#f5f5f5',
        titleColor: '#48BF91',
        bodyColor: '#333',
        borderColor: '#48BF91',
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += `₱${context.parsed.y}`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#E5E5E5',
        },
        title: {
          display: true,
          text: 'Goods Name',
          color: '#333',
          font: { size: 14, weight: '500' },
        },
        ticks: {
          color: '#333',
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        grid: {
          color: '#E5E5E5',
        },
        title: {
          display: true,
          text: 'Value / Quantity',
          color: '#333',
          font: { size: 14, weight: '500' },
        },
        ticks: {
          color: '#333',
        },
      },
    },
  };

  const exportChart = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'appraisal_chart.png';
        link.click();
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      style={{
        maxWidth: '950px',
        margin: '0 auto',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
        backgroundColor: '#fff',
        border: '2px solid #48BF91', // Added border
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          color: '#48BF91',
          marginBottom: '10px',
          fontFamily: 'Arial, sans-serif',
          fontWeight: '600',
        }}
      >
        Appraisal Analytics: Most Appraised Goods
      </h2>

      {/* Export Button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={exportChart} style={{ padding: '10px 20px', backgroundColor: '#48BF91', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Export Chart
        </button>
      </div>

      {/* Display Daily Data */}
      <h3 style={{ color: '#48BF91', textAlign: 'center', marginBottom: '20px' }}>
        Daily Appraisals
      </h3>
      <div style={{ height: '400px' }} ref={chartRef}>
        <Bar data={prepareChartData(dailyAggregatedData, true)} options={options} />
      </div>

      {/* Display Monthly Data */}
      <h3 style={{ color: '#48BF91', textAlign: 'center', marginTop: '70px', marginBottom: '20px' }}>
        Monthly Appraisals
      </h3>
      <div style={{ height: '400px' }} ref={chartRef}>
        <Bar data={prepareChartData(monthlyAggregatedData)} options={options} />
      </div>
    </div>
  );
};

export default Graph;