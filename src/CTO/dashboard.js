import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faFileInvoice,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { stallholderDb } from "../components/firebase.config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Styled components
const DashboardContainer = styled.div`
  padding: 50px;
  background-color: #f9f9f9;
`;

const DashboardTitle = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  flex: 1;
  margin: 0 10px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
`;

const StatTitle = styled.div`
  color: #4caf50;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatTitleSmall = styled.div`
  font-size: 14px;
  margin-bottom: 5px;
`;

const StatTitleLarge = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

const StatValue = styled.p`
  font-size: 24px;
  margin-top: 10px;
  color: #333;
`;

const TableContainer = styled.div`
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  th {
    background-color: #4caf50;
    color: white;
  }
  tr.data-row {
    background-color: white;
    color: black;
  }
  tr.section-header {
    background-color: #f1f1f1;
    color: black;
  }
`;

const SearchBar = styled.input`
  width: 50%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const FilterContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  gap: 15px;
  align-items: center;
`;

const FilterLabel = styled.span`
  font-weight: bold;
  color: #333;
`;

const FilterButton = styled.div`
  padding: 8px 12px;
  border-radius: 4px;
  color: #4caf50;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.3s ease;
  &:hover {
    color: #388e3c;
  }
  &.active {
    color: #388e3c;
  }
`;

const Message = styled.div`
  text-align: center;
  font-size: 18px;
  color: #888;
  margin-top: 20px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 18px;
  color: #333;
  margin-top: 20px;
`;

const ChartContainer = styled.div`
  margin-top: 20px;
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  position: relative;
  padding-top: 30%; /* 16:9 Aspect Ratio */
`;

const ChartWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

// Get today's date
const today = new Date();
today.setHours(0, 0, 0, 0); // Set time to midnight

const DashboardCTO = () => {
  const [stats, setStats] = useState({
    totalAppraisals: 0,
    totalAmbulant: 0,
    totalStallHolders: 0,
    recentViolations: 0,
    weeklyAppraisals: 0,
    weeklyAmbulant: 0,
    weeklyStallHolders: 0,
    monthlyAppraisals: 0,
    monthlyAmbulant: 0,
    monthlyStallHolders: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [adminLocation, setAdminLocation] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch admin location from Firestore
    const fetchAdminLocation = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData && userData.email) {
          const adminQuery = query(
            collection(stallholderDb, "admin_users"),
            where("email", "==", userData.email)
          );
          const adminSnapshot = await getDocs(adminQuery);
          if (!adminSnapshot.empty) {
            const adminData = adminSnapshot.docs[0].data();
            setAdminLocation(adminData.location);
          }
        }
      } catch (error) {
        console.error("Error fetching admin location:", error);
      }
    };

    fetchAdminLocation();
  }, []);

  useEffect(() => {
    // Function to fetch stats from Firestore
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Query to fetch payments that are not overdue
        const paymentsQuery = query(
          collection(stallholderDb, "stall_payment"),
          where("status", "!=", "Overdue")
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);

        // Map the fetched payments to a structured format
        const paymentsData = paymentsSnapshot.docs
          .map((doc) => ({
            payor: `${doc.data().firstName} ${doc.data().lastName}`,
            payment_date: doc.data().paymentDate?.toDate(),
            total_amount: doc.data().totalAmountDue || 0,
            referenceNumber: doc.id,
            status: doc.data().status,
            type: "Stall Holder",
            vendorId: doc.data().vendorId,
          }))
          .filter((transaction) => transaction.status !== "Overdue");

        // Fetch ambulant payments
        const ambulantSnapshot = await getDocs(
          collection(stallholderDb, "payment_ambulant")
        );
        const ambulantData = ambulantSnapshot.docs.map((doc) => ({
          payor: doc.data().zone,
          payment_date: doc.data().date?.toDate(),
          total_amount: doc.data().total_amount || 0,
          referenceNumber: doc.id,
          type: "Ambulant Vendor",
        }));

        // Fetch appraisals
        const appraisalsSnapshot = await getDocs(
          collection(stallholderDb, "appraisals")
        );
        const appraisalsData = appraisalsSnapshot.docs.map((doc) => ({
          payor: doc.data().goods_name,
          payment_date: doc.data().created_date?.toDate(),
          total_amount: doc.data().total_amount || 0,
          referenceNumber: doc.id,
          type: "Appraisal",
          appraisal_assign: doc.data().appraisal_assign,
        }));

        // Fetch approved vendors
        const approvedVendorsQuery = query(
          collection(stallholderDb, "approvedVendors")
        );
        const approvedVendorsSnapshot = await getDocs(approvedVendorsQuery);
        const approvedVendorsData = approvedVendorsSnapshot.docs.reduce(
          (acc, doc) => {
            const data = doc.data();
            acc[doc.id] = {
              location: data.stallInfo.location,
            };
            return acc;
          },
          {}
        );

        // Combine all data and filter by admin location
        const combinedData = [
          ...paymentsData,
          ...ambulantData,
          ...appraisalsData,
        ].map((transaction) => ({
          ...transaction,
          location:
            transaction.type === "Stall Holder"
              ? approvedVendorsData[transaction.vendorId]?.location
              : transaction.type === "Appraisal"
              ? transaction.appraisal_assign
              : transaction.location,
        }));

        const filteredData = combinedData.filter(
          (transaction) => transaction.location === adminLocation
        );
        setRecentTransactions(filteredData);
        setFilteredTransactions(filteredData);

        // Function to calculate totals
        const calculateTotals = (data, type) => {
          const total = data.reduce((sum, t) => sum + t.total_amount, 0);
          const weekly = data
            .filter((t) => {
              const transactionDate = new Date(t.payment_date);
              const startOfWeek = new Date(today);
              startOfWeek.setDate(today.getDate() - today.getDay());
              return transactionDate >= startOfWeek && transactionDate <= today;
            })
            .reduce((sum, t) => sum + t.total_amount, 0);
          const monthly = data
            .filter((t) => {
              const transactionDate = new Date(t.payment_date);
              const startOfMonth = new Date(
                today.getFullYear(),
                today.getMonth(),
                1
              );
              return (
                transactionDate >= startOfMonth && transactionDate <= today
              );
            })
            .reduce((sum, t) => sum + t.total_amount, 0);
          return { total, weekly, monthly };
        };

        // Calculate totals for each category
        const appraisalsTotals = calculateTotals(
          filteredData.filter((t) => t.type === "Appraisal"),
          "Appraisal"
        );
        const ambulantTotals = calculateTotals(
          filteredData.filter((t) => t.type === "Ambulant Vendor"),
          "Ambulant Vendor"
        );
        const stallHoldersTotals = calculateTotals(
          filteredData.filter((t) => t.type === "Stall Holder"),
          "Stall Holder"
        );

        // Update stats state
        setStats({
          totalAppraisals: appraisalsTotals.total,
          totalAmbulant: ambulantTotals.total,
          totalStallHolders: stallHoldersTotals.total,
          weeklyAppraisals: appraisalsTotals.weekly,
          weeklyAmbulant: ambulantTotals.weekly,
          weeklyStallHolders: stallHoldersTotals.weekly,
          monthlyAppraisals: appraisalsTotals.monthly,
          monthlyAmbulant: ambulantTotals.monthly,
          monthlyStallHolders: stallHoldersTotals.monthly,
          recentViolations: 0, // This will be updated in fetchViolations
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Function to fetch violations from Firestore
    const fetchViolations = async () => {
      try {
        // Query to fetch payments that are overdue
        const paymentsQuery = query(
          collection(stallholderDb, "stall_payment"),
          where("status", "==", "Overdue")
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);

        // Map the fetched payments to a structured format
        const paymentsData = paymentsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.dueDate
              ? data.dueDate.toDate().toLocaleDateString()
              : "N/A",
            vendorID: data.vendorId,
          };
        });

        console.log("Fetched overdue payments:", paymentsData); // Debugging log

        // Fetch approved vendors
        const approvedVendorsQuery = query(
          collection(stallholderDb, "approvedVendors")
        );
        const approvedVendorsSnapshot = await getDocs(approvedVendorsQuery);

        const approvedVendorsData = approvedVendorsSnapshot.docs.reduce(
          (acc, doc) => {
            const data = doc.data();
            acc[doc.id] = {
              location: data.stallInfo.location,
            };
            return acc;
          },
          {}
        );

        console.log("Approved vendors data:", approvedVendorsData); // Debugging log

        // Combine all data and filter by admin location
        const combinedData = paymentsData.map((payment) => ({
          ...payment,
          location: approvedVendorsData[payment.vendorID]?.location || "N/A",
        }));

        console.log("Combined data:", combinedData); // Debugging log

        const filteredData = combinedData.filter(
          (transaction) => transaction.location === adminLocation
        );

        console.log("Filtered data:", filteredData); // Debugging log

        setStats((prevStats) => ({
          ...prevStats,
          recentViolations: filteredData.length,
        }));
      } catch (error) {
        console.error("Error fetching violations:", error);
      }
    };

    fetchStats();
    fetchViolations();
  }, [adminLocation]);

  useEffect(() => {
    // Filter transactions based on search term and transaction filter
    const filtered = recentTransactions.filter((t) => {
      const transactionDate = new Date(t.payment_date);
      transactionDate.setHours(0, 0, 0, 0); // Set time to midnight
      const matchesSearch = t.type
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        transactionFilter === "All" || t.type === transactionFilter;
      return (
        transactionDate.getTime() === today.getTime() &&
        matchesSearch &&
        matchesType
      );
    });
    setFilteredTransactions(filtered);
  }, [searchTerm, transactionFilter, recentTransactions]);

  // Compute the total amounts for each category based on the filtered transactions
  const computeTotals = (type) => {
    return filteredTransactions
      .filter((transaction) => transaction.type === type)
      .reduce((sum, transaction) => sum + transaction.total_amount, 0);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleFilterChange = (filter) => {
    setTransactionFilter(filter);
  };

  const handleStatCardClick = (path) => {
    navigate(path);
  };

  // Data for the chart
  const chartData = {
    labels: ["Appraisal", "Ambulant Vendor", "Stall Holder"],
    datasets: [
      {
        label: "Daily Total",
        data: [
          computeTotals("Appraisal"),
          computeTotals("Ambulant Vendor"),
          computeTotals("Stall Holder"),
        ],
        backgroundColor: ["#4caf50", "#ff9800", "#f44336"],
      },
      {
        label: "Weekly Total",
        data: [
          stats.weeklyAppraisals,
          stats.weeklyAmbulant,
          stats.weeklyStallHolders,
        ],
        backgroundColor: ["#8bc34a", "#ffb74d", "#e57373"],
      },
      {
        label: "Monthly Total",
        data: [
          stats.monthlyAppraisals,
          stats.monthlyAmbulant,
          stats.monthlyStallHolders,
        ],
        backgroundColor: ["#66bb6a", "#ffa726", "#ef5350"],
      },
    ],
  };

  // Options for the chart
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Total Amounts by Category",
        font: {
          size: 20,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
        },
      },
    },
  };

  return (
    <DashboardContainer>
      <DashboardTitle>Dashboard</DashboardTitle>
      {loading ? (
        <LoadingMessage>Loading...</LoadingMessage>
      ) : (
        <>
          <StatsContainer>
            {[
              {
                title: "Appraisal",
                value: computeTotals("Appraisal"),
                icon: faUsers,
                redirectPath: "/historyAppraisal",
              },
              {
                title: "Ambulant",
                value: computeTotals("Ambulant Vendor"),
                icon: faFileInvoice,
                redirectPath: "/ambulantHistory",
              },
              {
                title: "Stall Holder",
                value: computeTotals("Stall Holder"),
                icon: faFileInvoice,
                redirectPath: "/stallHistory",
              },
              {
                title: "Violations",
                value: stats.recentViolations,
                icon: faExclamationTriangle,
                redirectPath: "/listViolators",
              },
            ].map(({ title, value, icon, redirectPath }, index) => (
              <StatCard
                key={index}
                onClick={() => handleStatCardClick(redirectPath)} // Navigate to the respective page
              >
                <StatTitle>
                  <FontAwesomeIcon icon={icon} size="2x" />
                  <StatTitleSmall>Total Amount</StatTitleSmall>
                  <StatTitleLarge>{title}</StatTitleLarge>
                </StatTitle>
                <StatValue>
                  {title === "Violations"
                    ? value
                    : `₱${Number(value).toFixed(2)}`}
                </StatValue>
              </StatCard>
            ))}
          </StatsContainer>

          <ChartContainer>
            <ChartWrapper>
              <Bar data={chartData} options={chartOptions} />
            </ChartWrapper>
          </ChartContainer>

          <FilterContainer>
            <SearchBar
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <FilterLabel>Filter: </FilterLabel>
            <FilterButton
              className={transactionFilter === "All" ? "active" : ""}
              onClick={() => handleFilterChange("All")}
            >
              All
            </FilterButton>
            <FilterButton
              className={transactionFilter === "Appraisal" ? "active" : ""}
              onClick={() => handleFilterChange("Appraisal")}
            >
              Appraisal
            </FilterButton>
            <FilterButton
              className={
                transactionFilter === "Ambulant Vendor" ? "active" : ""
              }
              onClick={() => handleFilterChange("Ambulant Vendor")}
            >
              Ambulant
            </FilterButton>
            <FilterButton
              className={transactionFilter === "Stall Holder" ? "active" : ""}
              onClick={() => handleFilterChange("Stall Holder")}
            >
              Stall Holder
            </FilterButton>
          </FilterContainer>

          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Reference Number</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={index} className="data-row">
                    <td>{transaction.type}</td>
                    <td>{transaction.payment_date?.toLocaleDateString()}</td>
                    <td>{transaction.payor}</td>
                    <td>₱{transaction.total_amount.toFixed(2)}</td>
                    <td>{transaction.referenceNumber}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>

          {filteredTransactions.length === 0 && (
            <Message>No transactions found for today.</Message>
          )}
        </>
      )}
    </DashboardContainer>
  );
};

export default DashboardCTO;
