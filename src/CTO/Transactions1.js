import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { stallholderDb } from "../components/firebase.config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import ctoImage from "../images/unnamed.png";
import cebuMarketImage from "../images/cebumarket.png";
import { FaDownload } from "react-icons/fa";

// Styled components
const DashboardContainer = styled.div`
  padding: 50px;
  background-color: #f9f9f9;
`;

const themeColors = {
  primary: "#4CAF50",
  secondary: "#388E3C",
  lightGray: "#F4F4F4",
  darkGray: "#333333",
  white: "#FFFFFF",
};

const DownloadButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #4caf50;
  color: white;
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;

  &:hover {
    background-color: #45a049;
  }
`;

const FiltersRightSide = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  align-items: center;
`;

const FilterOption = styled.span`
  font-size: 16px;
  color: ${(props) => (props.active ? "#4caf50" : "#333")};
  cursor: pointer;
  font-weight: ${(props) => (props.active ? "bold" : "normal")};

  &:hover {
    color: #4caf50;
    font-weight: bold;
  }
`;

const SearchbarLabel = styled.label`
  margin-right: 10px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 26px;
  font-weight: bold;
`;

const TableContainer = styled.div`
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;

  th,
  td {
    padding: 12px;
    text-align: left;
    border: 1px solid #ddd;
  }

  th {
    background-color: #4caf50;
    color: white;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
`;

const TotalContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const SearchBar = styled.input`
  width: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
`;

const DateInput = styled.input`
  width: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderText = styled.h2`
  font-size: 18px;
  color: #333;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const DateTotalHeader = styled.h3`
  background-color: ${themeColors.lightGray};
  padding: 12px;
  margin: 0;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  color: ${themeColors.darkGray};
`;

const MessageContainer = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 18px;
  color: #333;
`;

const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const TransactionCTO = () => {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateTerm, setDateTerm] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [unitFilter, setUnitFilter] = useState("All");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [adminLocation, setAdminLocation] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
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

    const fetchStats = async () => {
      if (!adminLocation) return;
      setLoading(true);
      setError(null);
      try {
        const paymentsQuery = query(
          collection(stallholderDb, "stall_payment"),
          where("status", "in", ["Paid", "paid"])
        );

        const paymentsSnapshot = await getDocs(paymentsQuery);

        const paymentsData = paymentsSnapshot.docs.map((doc) => {
          const data = doc.data();
          const paymentDate =
            data.paymentDate instanceof Object
              ? data.paymentDate.toDate()
              : new Date(data.paymentDate);
          return {
            name: `${data.firstName} ${data.lastName}`,
            paymentDate,
            totalAmountDue: data.totalAmountDue,
            referenceNumber: doc.id,
            vendorID: data.vendorId,
            paidBy: data.paidBy || "gcash", // Default to 'gcash' if paidBy is missing
          };
        });

        const approvedVendorsQuery = query(
          collection(stallholderDb, "approvedVendors")
        );
        const approvedVendorsSnapshot = await getDocs(approvedVendorsQuery);

        const approvedVendorsData = approvedVendorsSnapshot.docs.reduce(
          (acc, doc) => {
            const data = doc.data();
            acc[doc.id] = {
              location: data.stallInfo?.location || "Unknown",
              billingCycle: data.billingCycle || "N/A",
            };
            return acc;
          },
          {}
        );

        const combinedData = paymentsData.map((payment) => ({
          ...payment,
          location:
            approvedVendorsData[payment.vendorID]?.location || "Unknown",
          billingCycle:
            approvedVendorsData[payment.vendorID]?.billingCycle || "Unknown",
        }));

        const filteredData = combinedData.filter(
          (transaction) => transaction.location === adminLocation
        );

        filteredData.sort((a, b) => b.paymentDate - a.paymentDate);

        setRecentTransactions(filteredData);
        setFilteredTransactions(filteredData);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
        setError("Error fetching transaction data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminLocation().then(fetchStats);
  }, [adminLocation]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterTransactions(value, dateTerm, unitFilter, filter);
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    const formattedDate = value ? formatDate(new Date(value)) : "";
    setDateTerm(formattedDate);
    setDisplayDate(value);
    filterTransactions(searchTerm, formattedDate, unitFilter, filter);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    filterTransactions(searchTerm, dateTerm, unitFilter, newFilter);
  };

  const filterTransactions = (
    searchValue,
    dateValue,
    unitValue,
    filterValue
  ) => {
    let filtered = recentTransactions.filter((transaction) => {
      const formattedTransactionDate = formatDate(transaction.paymentDate);
      return (
        transaction.name &&
        transaction.name.toLowerCase().includes(searchValue.toLowerCase()) &&
        (!dateValue || formattedTransactionDate === dateValue) &&
        (unitValue === "All" || transaction.location === unitValue)
      );
    });

    if (filterValue === "Daily") {
      filtered = filtered.filter(
        (transaction) => transaction.billingCycle.toLowerCase() === "daily"
      );
    } else if (filterValue === "Weekly") {
      filtered = filtered.filter(
        (transaction) => transaction.billingCycle.toLowerCase() === "weekly"
      );
    } else if (filterValue === "Monthly") {
      filtered = filtered.filter(
        (transaction) => transaction.billingCycle.toLowerCase() === "monthly"
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleNameClick = (vendorId) => {
    navigate("/stallholder-payment", { state: { vendorId } });
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
          reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
          };
          reader.onerror = () => {
            reject(new Error("Failed to read image"));
          };
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

    const groupedTransactions = filteredTransactions.reduce(
      (groups, transaction) => {
        const dateKey = formatDate(transaction.paymentDate);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(transaction);
        return groups;
      },
      {}
    );

    const groupedTotalAmounts = Object.entries(groupedTransactions).map(
      ([date, transactions]) => {
        const total = transactions.reduce(
          (sum, transaction) => sum + (transaction.totalAmountDue || 0),
          0
        );
        return { date, totalAmount: total.toFixed(2) }; // Ensure two decimal points
      }
    );

    doc.autoTable({
      head: [
        [
          "Date",
          "Billing Cycle",
          "Vendor ID",
          "Name",
          "Location",
          "Amount",
          "Reference Number",
          "Mode of Payment",
        ],
      ],
      body: groupedTotalAmounts.flatMap(({ date, totalAmount }, index) => [
        [
          {
            content: `Date: ${date} - Total: ₱${totalAmount}`,
            colSpan: 8,
            styles: { halign: "left", fontStyle: "bold" },
          },
        ],
        ...groupedTransactions[date].map((transaction) => [
          "",
          transaction.billingCycle || "N/A",
          transaction.vendorID || "N/A",
          transaction.name || "N/A",
          transaction.location || "N/A",
          `₱${(transaction.totalAmountDue || 0).toFixed(2)}`, // Ensure two decimal points
          transaction.referenceNumber || "N/A",
          transaction.paidBy || "gcash", // Default to 'gcash' if paidBy is missing
        ]),
      ]),
      startY: 60,
      theme: "grid",
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontSize: 10,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 10,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto" },
        2: { cellWidth: "auto" },
        3: { cellWidth: "auto" },
        4: { cellWidth: "auto" },
        5: { cellWidth: "auto" },
        6: { cellWidth: "auto" },
        7: { cellWidth: "auto" }, // Add column style for the new column
      },
      styles: {
        overflow: "linebreak",
        cellPadding: 2,
      },
      margin: { top: 10, left: 10, right: 10, bottom: 10 },
      didDrawPage: (data) => {
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    const totalAmount = filteredTransactions.reduce((sum, transaction) => {
      const amount = transaction.totalAmountDue || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    doc.text(
      `Total Amount: ₱${totalAmount.toFixed(2)}`,
      105,
      doc.autoTable.previous.finalY + 10,
      { align: "center" }
    );

    doc.save("transaction_history.pdf");
  };

  const groupTransactionsByDate = () => {
    return filteredTransactions.reduce((groups, transaction) => {
      const dateKey = formatDate(transaction.paymentDate);
      if (!groups[dateKey]) {
        groups[dateKey] = { transactions: [], total: 0 };
      }
      groups[dateKey].transactions.push(transaction);
      groups[dateKey].total += transaction.totalAmountDue || 0;
      return groups;
    }, {});
  };

  const groupedTransactions = groupTransactionsByDate();

  return (
    <DashboardContainer>
      <HeaderContainer>
        <Title>Stall Holder Payments History</Title>
      </HeaderContainer>

      <SearchContainer>
        <FiltersRightSide>
          <FilterOption
            active={filter === "All"}
            onClick={() => handleFilterChange("All")}
          >
            All
          </FilterOption>
          <FilterOption
            active={filter === "Daily"}
            onClick={() => handleFilterChange("Daily")}
          >
            Daily
          </FilterOption>
          <FilterOption
            active={filter === "Weekly"}
            onClick={() => handleFilterChange("Weekly")}
          >
            Weekly
          </FilterOption>
          <FilterOption
            active={filter === "Monthly"}
            onClick={() => handleFilterChange("Monthly")}
          >
            Monthly
          </FilterOption>
        </FiltersRightSide>
        <SearchGroup>
          <SearchbarLabel>Filter by:</SearchbarLabel>
          <SearchBar
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <DateInput
            type="date"
            value={displayDate}
            onChange={handleDateChange}
          />
        </SearchGroup>
      </SearchContainer>

      <TableContainer>
        {loading && <MessageContainer>Loading...</MessageContainer>}
        {error && <MessageContainer>{error}</MessageContainer>}
        {!loading && !error && filteredTransactions.length === 0 && (
          <MessageContainer>No transactions found.</MessageContainer>
        )}
        {!loading && !error && filteredTransactions.length > 0 && (
          <>
            {Object.entries(groupedTransactions).map(
              ([date, { transactions, total }]) => (
                <div key={date}>
                  <DateTotalHeader>
                    {date} <span>Total: ₱{total.toFixed(2)}</span>{" "}
                    {/* Ensure two decimal points */}
                  </DateTotalHeader>
                  <Table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Name</th>
                        <th>Billing Cycle</th>
                        <th>Amount</th>
                        <th>Transaction ID</th>
                        <th>Mode of Payment</th> {/* Add the new table head */}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td>{formatDate(transaction.paymentDate)}</td>
                          <td>{transaction.location}</td>
                          <td
                            onClick={() =>
                              handleNameClick(transaction.vendorID)
                            }
                          >
                            {transaction.name}
                          </td>
                          <td>{transaction.billingCycle}</td>
                          <td>
                            ₱{(transaction.totalAmountDue || 0).toFixed(2)}
                          </td>{" "}
                          {/* Ensure two decimal points */}
                          <td>{transaction.referenceNumber}</td>
                          <td>{transaction.paidBy || "gcash"}</td>{" "}
                          {/* Add the new table data with default 'gcash' */}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )
            )}
          </>
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

export default TransactionCTO;
