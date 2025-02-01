import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4081", "#8884d8"];

const PieChartComponent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, "vendor_numbers"));
        const aggregatedData = querySnapshot.docs.reduce((acc, doc) => {
          const date = doc.id; // Assuming the document ID is the date
          const value = doc.data().current_vendor_number;
          if (acc[date]) {
            acc[date].value += value;
          } else {
            acc[date] = { name: date, value: value };
          }
          return acc;
        }, {});
        const dataArray = Object.values(aggregatedData);
        console.log("Fetched Data:", dataArray); // Debugging log
        setData(dataArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <PieChart width={600} height={500}>
      <Pie
        data={data}
        cx={300}
        cy={200}
        outerRadius={200}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default PieChartComponent;
