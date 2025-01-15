import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import {
  FaSort,
  FaArrowLeft,
  FaExclamationCircle,
  FaUsers,
  FaSearch,
  FaPrint,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaClock,
  FaCheckCircle,
  FaFilter,
} from "react-icons/fa";
import {
  doc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import IntSidenav from "./IntSidenav";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")};
  padding: 2rem;
  width: calc(
    100% - ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")}
  );
  transition: margin-left 0.3s ease, width 0.3s ease;
  overflow-y: auto;
  background-color: #f4f4f9;
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  background-color: #188423;
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: "Inter", sans-serif;
  font-weight: bold;
`;

const StatsContainer = styled.div`
  margin-top: 25px;
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background-color: #fff;
  padding: 2rem;
  color: #000;
  border-radius: 12px;
  border: 1px solid #ddd;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: bold;
  }

  p {
    margin: 10px 0 0;
    font-size: 22px;
    font-weight: bold;
  }

  .icon-container {
    margin-top: 1rem;

    .fading-icon {
      font-size: 48px; /* Increased icon size */
      color: rgb(0, 0, 0);
      opacity: 0.5;
      animation: fade 2s infinite alternate;
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;

    h3 {
      font-size: 1rem;
    }

    p {
      font-size: 1.6rem;
    }
  }
`;

const TransactionManagementContainer = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 12px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

const BillingCycleLabel = styled.div`
  background-color: #eaf4fc;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  color: #2a3f54;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const DatePickerContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #000;
  border-radius: 8px;
  padding: 0.5rem;
  background-color: #fff;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  flex: 1;
  min-width: 200px;

  .react-datepicker__input-container input {
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    font-size: 1rem;
    font-family: inherit;
    color: #333;

    &::placeholder {
      color: #aaa;
      font-style: italic;
    }
  }
`;

const Label = styled.label`
  position: absolute;
  top: -10px;
  left: 12px;
  background: #fff;
  padding: 0 4px;
  font-size: 0.8rem;
  color: #000;
`;

const SearchBarContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #000;
  border-radius: 8px;
  padding: 0.5rem;
  background-color: #fff;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  flex: 1;
  min-width: 200px;

  .react-datepicker__input-container input {
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    font-size: 1rem;
    font-family: inherit;
    color: #333;

    &::placeholder {
      color: #aaa;
      font-style: italic;
    }
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #6c757d;
  font-size: 1.2em;
  margin-right: 10px;
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 1em;
  color: #495057;

  ::placeholder {
    color: #adb5bd;
  }

  &:focus {
    color: #212529;
  }
`;

const YearInputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  flex: 1;
  min-width: 200px;
`;

const YearInput = styled.input`
  border: 1px solid #000;
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 1rem;
  margin-right: 10px;
  width: 100%;
`;

const PrintYearButton = styled.button`
  background-color: #535ebe;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 4px 40px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-right: 10px;

  &:hover {
    background-color: #643ea4;
  }
`;

const PrintButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 4px 35px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #218838;
  }

  svg {
    margin-right: 10px;
  }
`;

const VendorDetailsLabel = styled.div`
  background-color: #eaf4fc;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  color: #2a3f54;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #333333;
  }

  p {
    margin: 0.5rem 0;
    font-size: 1rem;
    color: #555555;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: "Inter", sans-serif;
  font-weight: bold;
  margin-bottom: 1rem;

  &:hover {
    background-color: #218838;
  }

  svg {
    margin-right: 10px;
  }
`;

const fadeAnimation = `
  @keyframes fade {
    0% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const GlobalStyle = createGlobalStyle`
  ${fadeAnimation}
`;

const ViewTransaction = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [billingCycle, setBillingCycle] = useState("");
  const [vendorDetails, setVendorDetails] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const fetchTransactions = async () => {
    try {
      const transactionsCollection = collection(rentmobileDb, "stall_payment");
      const q = query(
        transactionsCollection,
        where("vendorId", "==", vendorId)
      );

      const querySnapshot = await getDocs(q);

      const transactionsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate.seconds * 1000) : null,
          garbageFee: data.garbageFee || "N/A",
          surcharge: data.surcharge || "N/A",
          dailyPayment: data.dailyPayment || "N/A",
          firstName: data.firstName,
          lastName: data.lastName,
          billingCycle: data.billingCycle,
        };
      });

      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchBillingCycle = async () => {
    try {
      const vendorDoc = await getDoc(
        doc(rentmobileDb, "approvedVendors", vendorId)
      );
      if (vendorDoc.exists()) {
        const vendorData = vendorDoc.data();
        setBillingCycle(vendorData.billingCycle);
      } else {
        console.error("Vendor document does not exist");
      }
    } catch (error) {
      console.error("Error fetching billing cycle:", error);
    }
  };

  const fetchVendorDetails = async () => {
    try {
      const vendorDoc = await getDoc(
        doc(rentmobileDb, "approvedVendors", vendorId)
      );
      if (vendorDoc.exists()) {
        const vendorData = vendorDoc.data();
        setVendorDetails({
          stallNumber: vendorData.stallInfo?.stallNumber || "N/A",
          firstName: vendorData.firstName,
          lastName: vendorData.lastName,
          email: vendorData.email,
          contactNumber: vendorData.contactNumber,
          location: vendorData.stallInfo?.location || "N/A",
          billingCycle: vendorData.billingCycle,
        });
      } else {
        console.error("Vendor document does not exist");
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchBillingCycle();
    fetchVendorDetails();
  }, [vendorId]);

  useEffect(() => {
    const fetchUserData = async () => {
      const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
      if (loggedInUserData) {
        const usersCollection = collection(rentmobileDb, "users");
        const userDocs = await getDocs(usersCollection);
        const users = userDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const currentUser = users.find(
          (user) => user.email === loggedInUserData.email
        );
        setLoggedInUser(currentUser || loggedInUserData);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const fetchOverdueCount = async () => {
    try {
      const transactionsCollection = collection(rentmobileDb, "stall_payment");
      const overdueQuery = query(
        transactionsCollection,
        where("vendorId", "==", vendorId),
        where("status", "==", "Overdue")
      );
      const overdueSnapshot = await getDocs(overdueQuery);
      return overdueSnapshot.size;
    } catch (error) {
      console.error("Error fetching overdue transactions:", error);
      return 0;
    }
  };

  const fetchPaidCount = async () => {
    try {
      const transactionsCollection = collection(rentmobileDb, "stall_payment");
      const paidQuery = query(
        transactionsCollection,
        where("vendorId", "==", vendorId),
        where("status", "==", "paid")
      );
      const paidSnapshot = await getDocs(paidQuery);
      return paidSnapshot.size;
    } catch (error) {
      console.error("Error fetching paid transactions:", error);
      return 0;
    }
  };

  const fetchPendingCount = async () => {
    try {
      const transactionsCollection = collection(rentmobileDb, "stall_payment");
      const pendingQuery = query(
        transactionsCollection,
        where("vendorId", "==", vendorId),
        where("status", "==", "Pending")
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      return pendingSnapshot.size;
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
      return 0;
    }
  };

  useEffect(() => {
    const getOverdueCount = async () => {
      const count = await fetchOverdueCount();
      setOverdueCount(count);
    };
    const getPaidCount = async () => {
      const count = await fetchPaidCount();
      setPaidCount(count);
    };
    const getPendingCount = async () => {
      const count = await fetchPendingCount();
      setPendingCount(count);
    };
    getOverdueCount();
    getPaidCount();
    getPendingCount();
  }, [vendorId]);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    let sortedTransactions = [...filteredTransactions];
    sortedTransactions = sortedTransactions.sort((a, b) => {
      if (!a[field] || !b[field]) return 0;
      return order === "asc"
        ? a[field].localeCompare(b[field])
        : b[field].localeCompare(a[field]);
    });
    setFilteredTransactions(sortedTransactions);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMainContentClick = () => {
    setIsSidebarOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = date.toISOString().split("T")[0]; // Format date to YYYY-MM-DD
      await searchTransactionsByDate(formattedDate);
    }
  };

  const searchTransactionsByDate = async (date) => {
    try {
      const transactionsCollection = collection(rentmobileDb, "stall_payment");
      const q = query(
        transactionsCollection,
        where("vendorId", "==", vendorId),
        where("dueDate", "==", date)
      );

      const querySnapshot = await getDocs(q);
      const transactionsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate.seconds * 1000) : null,
          garbageFee: data.garbageFee || "N/A",
          surcharge: data.surcharge || "N/A",
          dailyPayment: data.dailyPayment || "N/A",
          firstName: data.firstName,
          lastName: data.lastName,
          billingCycle: data.billingCycle,
        };
      });

      setFilteredTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching transactions by date:", error);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handlePrintYear = () => {
    const filtered = transactions.filter((transaction) => {
      const year = transaction.dueDate
        ? transaction.dueDate.getFullYear()
        : null;
      return year === parseInt(selectedYear, 10);
    });
    setFilteredTransactions(filtered);
  };

  const handlePrint = () => {
    const printContents = `
      <style>
        body { font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6; }
        th { background-color: #e9ecef; }
        tr:nth-child(even) { background-color: #f2f2e2; }
        tr:nth-child(odd) { background-color: #ffffff; }
      </style>
      <div>
        <h3>Vendor Details</h3>
        <table>
          <tr>
            <td>First Name</td>
            <td>${vendorDetails?.firstName}</td>
            <td>Email</td>
            <td>${vendorDetails?.email}</td>
          </tr>
          <tr>
            <td>Last Name</td>
            <td>${vendorDetails?.lastName}</td>
            <td>Location</td>
            <td>${vendorDetails?.location}</td>
          </tr>
          <tr>
            <td>Billing Cycle</td>
            <td colSpan="3">${vendorDetails?.billingCycle}</td>
          </tr>
        </table>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 10%;">Due Date</th>
            <th style="width: 10%;">Amount</th>
            <th style="width: 10%;">Garbage Fee</th>
            <th style="width: 10%;">Surcharge</th>
            <th style="width: 10%;">Daily Payment</th>
            <th style="width: 10%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredTransactions
            .map(
              (transaction) => `
              <tr>
                <td style="width: 10%;">${
                  transaction.dueDate
                    ? transaction.dueDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"
                }</td>
                <td style="width: 10%;">${transaction.amount || "N/A"}</td>
                <td style="width: 10%;">${transaction.garbageFee}</td>
                <td style="width: 10%;">${transaction.surcharge}</td>
                <td style="width: 10%;">${transaction.dailyPayment}</td>
                <td style="width: 10%;">${transaction.status || "N/A"}</td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
  };

  return (
    <DashboardContainer>
      <GlobalStyle />
      <div ref={sidebarRef}>
        <IntSidenav
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          loggedInUser={loggedInUser}
        />
      </div>
      <MainContent
        isSidebarOpen={isSidebarOpen}
        onClick={handleMainContentClick}
      >
        <AppBar>
          <div className="title">STALLHOLDER TRANSACTION</div>
        </AppBar>
        <br />
        <br />
        <BackButton onClick={handleBack}>
          <FaArrowLeft /> Back
        </BackButton>

        <StatsContainer>
          <StatBox>
            <h3>All Paid</h3>
            <p>{paidCount}</p>
            <div className="icon-container">
              <FaCheckCircle className="fading-icon" />
            </div>
          </StatBox>
          <StatBox bgColor="#11768C">
            <h3>All Overdues</h3>
            <p>{overdueCount}</p>
            <div className="icon-container">
              <FaExclamationCircle className="fading-icon" />
            </div>
          </StatBox>
          <StatBox bgColor="#11768C">
            <h3>All Pending</h3>
            <p>{pendingCount}</p>
            <div className="icon-container">
              <FaClock className="fading-icon" />
            </div>
          </StatBox>
        </StatsContainer>
        <br />

        <h3>Vendor Details</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            padding: "1rem",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              backgroundColor: "#fff",
              borderRadius: "4px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <FaUser style={{ marginRight: "10px", color: "#333" }} />
            <p>
              <strong>Name:</strong>{" "}
              {vendorDetails
                ? `${vendorDetails.firstName} ${vendorDetails.lastName}`
                : "N/A"}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              backgroundColor: "#fff",
              borderRadius: "4px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <FaEnvelope style={{ marginRight: "10px", color: "#333" }} />
            <p>
              <strong>Email:</strong> {vendorDetails?.email}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              backgroundColor: "#fff",
              borderRadius: "4px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <FaPhone style={{ marginRight: "10px", color: "#333" }} />
            <p>
              <strong>Contact Number:</strong> {vendorDetails?.contactNumber}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              backgroundColor: "#fff",
              borderRadius: "4px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              gridColumn: "span 2",
            }}
          >
            <FaMapMarkerAlt style={{ marginRight: "10px", color: "#333" }} />
            <p>
              <strong>Location:</strong> {vendorDetails?.location}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              backgroundColor: "#fff",
              borderRadius: "4px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <FaExclamationCircle
              style={{ marginRight: "10px", color: "#333" }}
            />
            <p>
              <strong>Billing Cycle:</strong> {vendorDetails?.billingCycle}
            </p>
          </div>
        </div>

        <TransactionManagementContainer>
          <FilterContainer>
            <DatePickerContainer>
              <Label>Date</Label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MM/dd/yyyy"
                placeholderText="mm/dd/yyyy"
              />
            </DatePickerContainer>
            <SearchBarContainer>
              <Label>Search</Label>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Search Transactions..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </SearchBarContainer>
            <YearInputContainer>
              <YearInput
                type="number"
                placeholder="Enter Year"
                value={selectedYear}
                onChange={handleYearChange}
              />
              <PrintYearButton onClick={handlePrintYear}>
                Filter Year
              </PrintYearButton>
              <PrintButton onClick={handlePrint}>
                <FaPrint /> Print
              </PrintButton>
            </YearInputContainer>
          </FilterContainer>

          <div id="printable-table">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "1rem",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      width: "10%",
                      padding: "8px",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Transaction ID
                  </th>
                  <th
                    style={{
                      width: "10%",
                      padding: "8px",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Due Date
                  </th>
                  <th
                    style={{
                      width: "10%",
                      padding: "8px",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      width: "10%",
                      padding: "8px",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Garbage Fee
                  </th>
                  <th
                    style={{
                      width: "10%",
                      padding: "8px",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Surcharge
                  </th>
                  <th
                    style={{
                      width: "10%",
                      padding: "8px",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Daily Payment
                  </th>
                  <th
                    style={{
                      width: "10%",
                      padding: "8px",
                      borderBottom: "2px solid #dee2e6",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("status")}
                  >
                    Status <FaSort style={{ marginLeft: "8px" }} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions
                    .filter((transaction) =>
                      transaction.id
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((transaction) => (
                      <tr key={transaction.id}>
                        <td
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {transaction.id}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {transaction.dueDate
                            ? transaction.dueDate.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {transaction.amount || "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {transaction.garbageFee}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {transaction.surcharge}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {transaction.dailyPayment}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          <button
                            style={{
                              padding: "6px 14px",
                              color: "#fff",
                              backgroundColor:
                                transaction.status === "Pending"
                                  ? "red"
                                  : transaction.status === "Overdue"
                                  ? "orange"
                                  : transaction.status === "Paid"
                                  ? "green"
                                  : "#ccc",
                              border: "none",
                              borderRadius: "4px",
                              fontWeight: "bold",
                              cursor: "default",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                            }}
                            disabled
                          >
                            {transaction.status === "Pending" && (
                              <FaClock style={{ marginRight: "5px" }} />
                            )}
                            {transaction.status === "Overdue" && (
                              <FaExclamationCircle
                                style={{ marginRight: "5px" }}
                              />
                            )}
                            {transaction.status === "Paid" && (
                              <FaCheckCircle style={{ marginRight: "5px" }} />
                            )}
                            {transaction.status || "N/A"}
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ padding: "8px", textAlign: "center" }}
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TransactionManagementContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default ViewTransaction;
