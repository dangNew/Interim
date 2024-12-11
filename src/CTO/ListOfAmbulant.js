import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { stallholderDb } from "../components/firebase.config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import ctoImage from "../images/unnamed.png";
import cebuMarketImage from "../images/cebumarket.png";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaDownload } from "react-icons/fa";

// Styled components
const DashboardContainer = styled.div`
  padding: 50px;
  background-color: #f9f9f9;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
  font-weight: bold;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #333;
`;

const FiltersContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const FilterButton = styled.button`
  padding: 8px 12px;
  border: none;
  background: none;
  color: #4caf50;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.3s ease;
  &:hover {
    color: #388e3c;
  }
  &.active {
    color: #388e3c; /* Green when active */
  }
`;

const DateInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  width: 150px;
  margin-left: auto;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border: none;
  background-color: #4caf50;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #45a049;
  }
`;

const TableContainer = styled.div`
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th,
  td {
    padding: 12px;
    text-align: left;
    border: 1px solid #ddd;
  }

  th {
    background-color: #4caf50;
    color: white;
    font-weight: bold;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
`;

const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const ListsOfAmbulant = () => {
  const { collector } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [dateTerm, setDateTerm] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [collectors, setCollectors] = useState({});
  const [collectorLocations, setCollectorLocations] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [adminLocation, setAdminLocation] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

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
        } else {
          setError("Admin location not found. Please contact support.");
        }
      } else {
        setError("No admin user data available. Please log in again.");
      }
    } catch (error) {
      console.error("Error fetching admin location:", error);
      setError("Error fetching admin location. Please try again later.");
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await fetchAdminLocation();

        const ambulantQuery = query(
          collection(stallholderDb, "payment_ambulant")
        );
        const ambulantSnapshot = await getDocs(ambulantQuery);

        const collectorQuery = query(
          collection(stallholderDb, "ambulant_collector")
        );
        const collectorSnapshot = await getDocs(collectorQuery);

        const collectorData = collectorSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          acc[data.collector] = `${data.firstName} ${data.lastName}`;
          acc[data.collector + "_location"] = data.location; // Store location
          return acc;
        }, {});

        setCollectors(collectorData);
        setCollectorLocations(collectorData);

        const ambulantData = ambulantSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              zone: data.zone,
              date:
                data.date instanceof Object
                  ? data.date.toDate()
                  : new Date(data.date),
              space_rate: data.space_rate,
              number_of_tickets: data.number_of_tickets,
              total_amount: data.total_amount,
              referenceNumber: doc.id,
              collector: data.collector,
            };
          })
          .filter((transaction) => {
            return (
              transaction.zone !== "N/A" && transaction.total_amount !== "N/A"
            );
          });

        const combinedData = [...ambulantData];
        combinedData.sort((a, b) => b.date - a.date);

        setTransactions(combinedData);
        setFilteredTransactions(combinedData);

        if (combinedData.length === 0) {
          setNoData(true);
        } else {
          setNoData(false);
        }
      } catch (error) {
        console.error("Error fetching transaction data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    filterTransactions(dateTerm, filter);
  }, [searchTerm, dateTerm, filter, adminLocation, collector]);

  const handleDateChange = (e) => {
    const value = e.target.value;
    const formattedDate = value ? formatDate(new Date(value)) : "";
    setDateTerm(formattedDate);
    setDisplayDate(value);
  };

  const handleFilterChange = (filter) => {
    setFilter(filter);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const filterTransactions = (dateValue, filterType) => {
    let filtered = transactions;

    if (dateValue) {
      filtered = filtered.filter(
        (transaction) => formatDate(transaction.date) === dateValue
      );
    }

    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    switch (filterType) {
      case "Recent":
        filtered = filtered.filter(
          (transaction) =>
            transaction.date >= oneWeekAgo && transaction.date <= today
        );
        break;
      case "This Week":
        const startOfWeek = new Date();
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        filtered = filtered.filter(
          (transaction) =>
            transaction.date >= startOfWeek && transaction.date <= endOfWeek
        );
        break;
      case "All":
      default:
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter((transaction) =>
        collectors[transaction.collector]
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (adminLocation) {
      filtered = filtered.filter((transaction) => {
        const collectorLocation =
          collectorLocations[transaction.collector + "_location"];
        return (
          collectorLocation &&
          collectorLocation !== "N/A" &&
          collectorLocation === adminLocation
        );
      });
    }

    if (collector) {
      filtered = filtered.filter(
        (transaction) => collectors[transaction.collector] === collector
      );
    }

    setFilteredTransactions(filtered);
  };

  const generatePDF = async () => {
    const doc = new jsPDF();

    const loadImageAsBase64 = async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Failed to read image"));
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error loading image:", error);
        return null;
      }
    };

    const ctoImageBase64 = await loadImageAsBase64(ctoImage);
    const cebuMarketImageBase64 = await loadImageAsBase64(cebuMarketImage);

    if (ctoImageBase64) doc.addImage(ctoImageBase64, "PNG", 20, 10, 30, 30);
    if (cebuMarketImageBase64)
      doc.addImage(cebuMarketImageBase64, "PNG", 160, 10, 30, 30);

    doc.setFontSize(12);
    doc.text("Republic of the Philippines", 105, 15, { align: "center" });
    doc.text("City of Cebu", 105, 20, { align: "center" });
    doc.text("OFFICE OF THE CITY ADMINISTRATION", 105, 25, { align: "center" });
    doc.text("CITY TREASURER'S OFFICE", 105, 30, { align: "center" });

    doc.setFontSize(14);
    doc.text("Transaction History", 105, 50, { align: "center" });

    doc.autoTable({
      head: [
        [
          "Zone",
          "Date",
          "Space Rate",
          "No. of Ticket",
          "Amount",
          "Reference Number",
          "Collector",
          "Location",
        ],
      ],
      body: filteredTransactions.map((transaction) => [
        transaction.zone || "N/A",
        formatDate(transaction.date),
        transaction.space_rate || "N/A",
        transaction.number_of_tickets || "N/A",
        transaction.total_amount || "0",
        transaction.referenceNumber || "N/A",
        collectors[transaction.collector] || "N/A",
        collectorLocations[transaction.collector + "_location"] || "N/A",
      ]),
      startY: 60,
      theme: "grid",
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontSize: 12,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 10,
        halign: "center",
      },
    });

    doc.save("ambulant_transaction_history.pdf");
  };

  const handleCellClick = (transaction) => {
    navigate(`/transaction-details/${transaction.date}`);
  };

  return (
    <DashboardContainer>
      <HeaderContainer>
        <BackButton onClick={handleBackClick}>
          <FaArrowLeft /> Back
        </BackButton>
        <DownloadButton onClick={generatePDF}>
          <FaDownload style={{ marginRight: "8px" }} /> Download PDF
        </DownloadButton>
      </HeaderContainer>
      <HeaderContent>
        <img
          src={ctoImage}
          alt="CTO Logo"
          style={{ width: "80px", height: "80px", marginRight: "30px" }}
        />
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
            Republic of the Philippines
          </p>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
            City of Cebu
          </p>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
            OFFICE OF THE CITY ADMINISTRATION
          </p>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
            CITY TREASURER'S OFFICE
          </p>
        </div>
        <img
          src={cebuMarketImage}
          alt="Cebu Market Logo"
          style={{ width: "80px", height: "80px", marginLeft: "30px" }}
        />
      </HeaderContent>
      <Title>Transaction History for {collector}</Title>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <FiltersContainer>
        <FilterButton
          active={filter === "All"}
          onClick={() => handleFilterChange("All")}
        >
          All
        </FilterButton>
        <FilterButton
          active={filter === "Recent"}
          onClick={() => handleFilterChange("Recent")}
        >
          Recent
        </FilterButton>
        <FilterButton
          active={filter === "This Week"}
          onClick={() => handleFilterChange("This Week")}
        >
          This Week
        </FilterButton>
        <DateInput
          type="date"
          value={displayDate}
          onChange={handleDateChange}
        />
      </FiltersContainer>
      <TableContainer>
        {loading ? (
          <p>Loading...</p>
        ) : noData ? (
          <p>No Data Available</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Zone</th>
                <th>Date</th>
                <th>Space Rate</th>
                <th>No. of Ticket</th>
                <th>Amount</th>
                <th>Reference Number</th>
                <th>Collector</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((item, index) => (
                <tr key={index} onClick={() => handleCellClick(item)}>
                  <td>{item.zone}</td>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.space_rate}</td>
                  <td>{item.number_of_tickets}</td>
                  <td>₱{item.total_amount.toFixed(2)}</td>
                  <td>{item.referenceNumber}</td>
                  <td>{collectors[item.collector] || "N/A"}</td>
                  <td>
                    {collectorLocations[item.collector + "_location"] || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableContainer>
    </DashboardContainer>
  );
};

export default ListsOfAmbulant;
