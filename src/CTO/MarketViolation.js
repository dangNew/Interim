import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { stallholderDb } from "../components/firebase.config"; // Adjust the path if necessary
import { collection, getDocs, query, where } from "firebase/firestore";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
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

const MarketViolation = () => {
  const [violations, setViolations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateTerm, setDateTerm] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData) {
          setUserLocation(userData.location);
          console.log("User location:", userData.location); // Debugging
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!userLocation) return;
        const violationsQuery = query(
          collection(stallholderDb, "Market_violations"),
          where("stallLocation", "==", userLocation) // Ensure the field name is correct
        );
        console.log("Query:", violationsQuery); // Debugging
        const snapshot = await getDocs(violationsQuery);
        const data = snapshot.docs.map((doc) => {
          const violationData = doc.data();
          const formattedDate = violationData.date.toDate(); // Convert Timestamp to Date
          return { ...violationData, date: formattedDate };
        });
        setViolations(data);
        setFilteredViolations(data);
        console.log("Fetched violations:", data); // Debugging
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchData();
  }, [userLocation]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterViolations(value, dateTerm);
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    const formattedDate = value ? formatDate(new Date(value)) : "";
    setDateTerm(formattedDate);
    setDisplayDate(value);
    filterViolations(searchTerm, formattedDate);
  };

  const filterViolations = (searchValue, dateValue) => {
    const filtered = violations.filter((violation) => {
      const formattedViolationDate = formatDate(violation.date);
      return (
        violation.vendorName &&
        violation.vendorName
          .toLowerCase()
          .includes(searchValue.toLowerCase()) &&
        (!dateValue || formattedViolationDate === dateValue)
      );
    });
    setFilteredViolations(filtered);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        [
          "Date",
          "Stall Location",
          "Stall No",
          "Vendor ID",
          "Vendor Name",
          "Violation Type",
          "Warning",
          "Total Amount",
        ],
      ],
      body: filteredViolations.map((violation) => [
        formatDate(violation.date),
        violation.stallLocation,
        violation.stallNo,
        violation.vendorId,
        violation.vendorName,
        violation.violationType,
        violation.warning,
        violation.dailyPayment,
      ]),
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
        7: { cellWidth: "auto" },
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
    doc.save("market_violations.pdf");
  };

  return (
    <DashboardContainer>
      <HeaderContainer>
        <Title>Market Violations</Title>
      </HeaderContainer>

      <SearchContainer>
        <SearchGroup>
          <SearchbarLabel>Filter by:</SearchbarLabel>
          <SearchBar
            placeholder="Search by vendor name..."
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
        {!loading && !error && filteredViolations.length === 0 && (
          <MessageContainer>No violations found.</MessageContainer>
        )}
        {!loading && !error && filteredViolations.length > 0 && (
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Stall Location</th>
                <th>Stall No</th>
                <th>Vendor ID</th>
                <th>Vendor Name</th>
                <th>Violation Type</th>
                <th>Warning</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredViolations.map((violation, index) => (
                <tr key={index}>
                  <td>{formatDate(violation.date)}</td>
                  <td>{violation.stallLocation}</td>
                  <td>{violation.stallNo}</td>
                  <td>{violation.vendorId}</td>
                  <td>{violation.vendorName}</td>
                  <td>{violation.violationType}</td>
                  <td>{violation.warning}</td>
                  <td>{violation.dailyPayment}</td>
                </tr>
              ))}
            </tbody>
          </Table>
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

export default MarketViolation;
