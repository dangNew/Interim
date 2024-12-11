import React, { useState, useEffect } from "react";
import { stallholderDb } from "../components/firebase.config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FaDownload } from "react-icons/fa";
import ctoImage from "../images/unnamed";
import cebuMarketImage from "../images/cebumarket";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// Styled components
const DashboardContainer = styled.div`
  padding: 50px 80px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

// Define theme colors
const themeColors = {
  primary: "#4CAF50", // Green
  secondary: "#388E3C", // Darker Green
  lightGray: "#F4F4F4", // Light Gray for background
  darkGray: "#333333", // Dark Gray for text
  white: "#FFFFFF",
};

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: ${themeColors.darkGray};
  font-size: 26px;
  font-weight: bold;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
`;

const TableContainer = styled.div`
  margin: 0;
`;

const FilterOption = styled.span`
  font-size: 16px;
  color: ${(props) => (props.active ? "#45a049" : "#333")};
  cursor: pointer;
  font-weight: ${(props) => (props.active ? "bold" : "normal")};

  &:hover {
    color: #45a049;
    font-weight: bold;
  }
`;

const DateInputWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
`;

const FiltersRightSide = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  align-items: center;
`;

const SearchBar = styled.input`
  width: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 10px; /* Add margin to create spacing */
`;

const DateInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  width: 200px;
  font-size: 16px;
`;

const DateInputLabel = styled.label`
  margin-right: 10px;
`;

const DownloadButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #4caf50;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: #45a049;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  padding: 0;
  border: 1px solid #ddd;
  margin: 10px 0px;
`;

const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
  background-color: #4caf50;
  color: white;
  font-weight: bold;
`;

const TableRow = styled.tr`
  cursor: pointer;
  &:hover {
    background-color: #f1f1f1;
  }
`;

const TableData = styled.td`
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: #333;
`;

const NoDataMessage = styled.p`
  text-align: center;
  color: #888;
  font-size: 18px;
  margin-top: 20px;
`;

const DateTotalHeader = styled.h3`
  background-color: ${themeColors.lightGray};
  padding: 10px;
  margin: 0;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  color: ${themeColors.darkGray};
  margin: 20px 0px;
`;

const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const AmbulantHistory = () => {
  const [recentTransactions, setRecentTransactions] = useState([]);
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
          console.log("Admin location fetched:", adminData.location); // Debugging
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

  const fetchAmbulantLocations = async () => {
    try {
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
      console.log("Ambulant locations:", collectorData); // Debugging
    } catch (error) {
      console.error("Error fetching ambulant locations:", error);
      setError("Error fetching ambulant locations. Please try again later.");
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await fetchAdminLocation();
        await fetchAmbulantLocations();

        const ambulantQuery = query(
          collection(stallholderDb, "payment_ambulant"),
          where("location", "==", adminLocation)
        );
        const ambulantSnapshot = await getDocs(ambulantQuery);

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

        setRecentTransactions(combinedData);
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
  }, [adminLocation]);

  useEffect(() => {
    filterTransactions(dateTerm, filter);
  }, [searchTerm, dateTerm, filter, adminLocation]);

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
    let filtered = recentTransactions;

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
        console.log(
          "Filtering transaction:",
          transaction,
          "Collector location:",
          collectorLocation,
          "Admin location:",
          adminLocation
        ); // Debugging
        return (
          collectorLocation &&
          collectorLocation !== "N/A" &&
          collectorLocation === adminLocation
        );
      });
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

  // Group items by `createdDate`
  const groupedItems = filteredTransactions.reduce((groups, item) => {
    const dateKey = item.date ? formatDate(item.date) : "Unknown Date";
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {});

  // Calculate total amount for each grouped date
  const groupedTotalAmounts = Object.entries(groupedItems).map(
    ([date, dateItems]) => {
      const total = dateItems
        .reduce((sum, item) => sum + item.total_amount, 0)
        .toFixed(2);
      return { date, totalAmount: total };
    }
  );

  const handleCellClick = (transaction) => {
    navigate(`/transaction-details/${transaction.date}`);
  };

  return (
    <DashboardContainer>
      <HeaderContainer>
        <Title>Ambulant Vendor Payment History</Title>
      </HeaderContainer>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <FiltersContainer>
        <FiltersRightSide>
          <FilterOption
            active={filter === "All"}
            onClick={() => handleFilterChange("All")}
          >
            All
          </FilterOption>
          <FilterOption
            active={filter === "Recent"}
            onClick={() => handleFilterChange("Recent")}
          >
            Recent
          </FilterOption>
          <FilterOption
            active={filter === "This Week"}
            onClick={() => handleFilterChange("This Week")}
          >
            This Week
          </FilterOption>
        </FiltersRightSide>

        <DateInputWrapper>
          <DateInputLabel>Filter by:</DateInputLabel>
          <SearchBar
            placeholder="Search by collector name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <DateInput
            type="date"
            value={displayDate}
            onChange={handleDateChange}
          />
        </DateInputWrapper>
      </FiltersContainer>

      <TableContainer>
        {loading ? (
          <LoadingMessage>Loading...</LoadingMessage>
        ) : noData ? (
          <NoDataMessage>No Data Available</NoDataMessage>
        ) : (
          Object.entries(groupedItems).map(([date, dateItems]) => {
            const totalAmount = groupedTotalAmounts.find(
              (item) => item.date === date
            )?.totalAmount;
            return (
              <div key={date}>
                <DateTotalHeader>
                  {date} <span>Total: ₱{totalAmount}</span>
                </DateTotalHeader>

                <Table>
                  <thead>
                    <TableRow>
                      <TableHeader>Zone</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Space Rate</TableHeader>
                      <TableHeader>No. of Ticket</TableHeader>
                      <TableHeader>Amount</TableHeader>
                      <TableHeader>Reference Number</TableHeader>
                      <TableHeader>Collector</TableHeader>
                      <TableHeader>Location</TableHeader>
                    </TableRow>
                  </thead>
                  <tbody>
                    {dateItems.map((item, index) => (
                      <TableRow
                        key={index}
                        onClick={() => handleCellClick(item)}
                      >
                        <TableData>{item.zone}</TableData>
                        <TableData>{formatDate(item.date)}</TableData>
                        <TableData>{item.space_rate}</TableData>
                        <TableData>{item.number_of_tickets}</TableData>
                        <TableData>₱{item.total_amount.toFixed(2)}</TableData>
                        <TableData>{item.referenceNumber}</TableData>
                        <TableData>
                          {collectors[item.collector] || "N/A"}
                        </TableData>
                        <TableData>
                          {collectorLocations[item.collector + "_location"] ||
                            "N/A"}
                        </TableData>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </div>
            );
          })
        )}
      </TableContainer>

      <FiltersRightSide>
        <DownloadButton onClick={generatePDF}>
          <FaDownload /> Download PDF
        </DownloadButton>
      </FiltersRightSide>
    </DashboardContainer>
  );
};

export default AmbulantHistory;
