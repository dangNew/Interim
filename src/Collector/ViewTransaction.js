import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { FaSort, FaArrowLeft, FaExclamationCircle, FaUsers, FaSearch } from "react-icons/fa";
import { doc, collection, getDocs, getDoc, query, where } from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import SidenavCollector from "./SidenavCollector";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")};
  padding-left: 10px;
  background-color: #fff;
  padding: 2rem;
  width: calc(
    100% - ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")}
  );
  transition: margin-left 0.3s ease, width 0.3s ease;
  overflow-y: auto;
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
  font-family: "Helvetica";
  font-weight: bold;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 50px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background-color: ${({ bgColor }) => bgColor || "#ffffff"};
  padding: 0.5rem; /* Minimal padding */
  border-radius: 8px; /* Smaller border radius */
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Lighter shadow */
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Subtle hover effect */
  }

  h3 {
    margin-bottom: 0.2rem; /* Minimal margin */
    font-size: 0.8rem; /* Smaller font size */
    font-weight: 500;
    color: ${({ textColor }) => textColor || "#333"};
  }

  p {
    font-size: 1.2rem; /* Compact font size */
    margin: 0;
    font-weight: 600;
    color: ${({ textColor }) => textColor || "#444"};
  }

  .icon-container {
    margin-top: 0.5rem; /* Compact spacing */
    font-size: 18px; /* Smaller icon size */
    color: ${({ iconColor }) => iconColor || "#888"};
  }

  @media (max-width: 768px) {
    padding: 0.4rem;

    h3 {
      font-size: 0.7rem;
    }

    p {
      font-size: 1rem;
    }

    .icon-container {
      font-size: 16px;
    }
  }
`;


const BillingCycleLabel = styled.div`
  background-color: #eaf4fc; /* Soft pastel blue */
  padding: 0.7rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #2a3f54; /* Darker text for contrast */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Softer shadow */
  font-weight: 500; /* Medium weight for better emphasis */
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
`;

const SearchBarContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #7a4cdb; /* Purple border */
  border-radius: 8px;
  padding: 0.5rem;
  background-color: #faf8ff; /* Light purple background */
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  width: 100%;
  margin-left: 20px; /* Add margin to separate from DatePickerContainer */

  .react-datepicker__input-container input {
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    font-size: 1rem;
    font-family: inherit;
    color: #333;

    &::placeholder {
      color: #aaa; /* Placeholder color */
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

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);
  position: relative;

  h3 {
    margin-bottom: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;

    th,
    td {
      padding: 15px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }

    th {
      background-color: #e9ecef;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    tr:nth-child(odd) {
      background-color: #ffffff;
    }
  }
`;

const DatePickerContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #7a4cdb; /* Purple border */
  border-radius: 8px;
  padding: 0.5rem;
  background-color: #faf8ff; /* Light purple background */
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  width: 100%;

  .react-datepicker__input-container input {
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    font-size: 1rem;
    font-family: inherit;
    color: #333;

    &::placeholder {
      color: #aaa; /* Placeholder color */
      font-style: italic;
    }
  }
`;

const Label = styled.label`
  position: absolute;
  top: -10px;
  left: 12px;
  background: #faf8ff; /* Match the container background */
  padding: 0 4px;
  font-size: 0.8rem;
  color: #7a4cdb; /* Purple text */
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

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
`;

const YearInputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const YearInput = styled.input`
  border: 1px solid #7a4cdb;
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 1rem;
  margin-right: 10px;
`;

const PrintYearButton = styled.button`
  background-color: #7a4cdb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #643ea4;
  }
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
        };
      });

      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchBillingCycle = async () => {
    try {
      const vendorCollection = collection(rentmobileDb, "vendors");
      const vendorDoc = await getDoc(doc(vendorCollection, vendorId));
      if (vendorDoc.exists()) {
        const vendorData = vendorDoc.data();
        setBillingCycle(vendorData.billingCycle);
        setVendorDetails({
          stallNumber: vendorData.stallNumber,
          name: `${vendorData.firstName} ${vendorData.lastName}`,
          contactNumber: vendorData.contactNumber,
        });
      } else {
        console.error("Vendor document does not exist");
      }
    } catch (error) {
      console.error("Error fetching billing cycle:", error);
    }
  };

  const fetchVendorName = async () => {
    try {
      const stallPaymentCollection = collection(rentmobileDb, "stall_payment");
      const q = query(
        stallPaymentCollection,
        where("vendorId", "==", vendorId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setVendorDetails((prevDetails) => ({
          ...prevDetails,
          name: `${data.firstName} ${data.lastName}`,
        }));
      }
    } catch (error) {
      console.error("Error fetching vendor name:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchBillingCycle();
    fetchVendorName();
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

    let sortedTransactions = [...transactions];
    sortedTransactions = sortedTransactions.sort((a, b) => {
      if (!a[field] || !b[field]) return 0;
      return order === "asc"
        ? a[field].localeCompare(b[field])
        : b[field].localeCompare(a[field]);
    });
    setTransactions(sortedTransactions);
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handlePrintYear = () => {
    alert(`Selected Year: ${selectedYear}`);
  };

  return (
    <DashboardContainer>
       <GlobalStyle />
      <div ref={sidebarRef}>
        <SidenavCollector
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
          <div className="title">View Stallholder History Payment</div>
        </AppBar>
        <br></br>
        <br></br>
        <BackButton onClick={handleBack}>
          <FaArrowLeft /> Back
        </BackButton>

        <StatsContainer>
  <StatBox bgColor="#EAF8F1" textColor="#2E7D32" iconColor="#66BB6A">
    <h3>All Paid</h3>
    <p>{paidCount}</p>
    <div className="icon-container">
      <FaUsers className="fading-icon" />
    </div>
  </StatBox>
  <StatBox bgColor="#FFF5F5" textColor="#C62828" iconColor="#EF5350">
    <h3>All Overdues</h3>
    <p>{overdueCount}</p>
    <div className="icon-container">
      <FaUsers className="fading-icon" />
    </div>
  </StatBox>
</StatsContainer>


        <br></br>

        {pendingCount > 0 && (
          <div
            className="stat-box pending"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #f6d365, #fda085)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "12px",
              padding: "16px",
              color: "#333",
              maxWidth: "500px",
              margin: "0 auto",
              textAlign: "center",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <div
              className="stat-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h3
                className="stat-title"
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  margin: "0",
                  color: "#333",
                }}
              >
                Pending Transactions
              </h3>
              <div
                className="icon-container"
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "50%",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaExclamationCircle
                  className="fading-icon"
                  style={{
                    fontSize: "24px",
                    color: "#ff6b6b",
                    animation: "fade 2s infinite",
                  }}
                />
              </div>
            </div>
            <p
              className="stat-count"
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                margin: "0",
                color: "#333",
              }}
            >
              {pendingCount}
            </p>
          </div>
        )}

        <style>
          {`
            @keyframes fade {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.5;
              }
            }
          `}
        </style>
        <br></br>

        <BillingCycleLabel>Billing Cycle: Monthly</BillingCycleLabel>

        <FormContainer>
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
          </FilterContainer>

          <YearInputContainer>
            <YearInput
              type="number"
              placeholder="Enter Year"
              value={selectedYear}
              onChange={handleYearChange}
            />
            <PrintYearButton onClick={handlePrintYear}>
              Print Year
            </PrintYearButton>
          </YearInputContainer>

          <h3>Transactions for Vendor ID: {vendorId}</h3>
          <table>
            <thead>
              <tr>
                <th style={{ width: "10%" }}>Transaction ID</th>
                <th style={{ width: "10%" }}>Due Date</th>
                <th style={{ width: "10%" }}>Amount</th>
                <th style={{ width: "10%" }}>Garbage Fee</th>
                <th style={{ width: "10%" }}>Surcharge</th>
                <th style={{ width: "10%" }}>Daily Payment</th>
                <th
                  style={{ width: "10%" }}
                  onClick={() => handleSort("status")}
                >
                  Status <FaSort style={{ marginLeft: "8px" }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions
                  .filter((transaction) =>
                    transaction.id
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((transaction) => (
                    <tr key={transaction.id}>
                      <td style={{ width: "10%" }}>{transaction.id}</td>
                      <td style={{ width: "10%" }}>
                        {transaction.dueDate
                          ? transaction.dueDate.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td style={{ width: "10%" }}>
                        {transaction.amount || "N/A"}
                      </td>
                      <td style={{ width: "10%" }}>{transaction.garbageFee}</td>
                      <td style={{ width: "10%" }}>{transaction.surcharge}</td>
                      <td style={{ width: "10%" }}>
                        {transaction.dailyPayment}
                      </td>
                      <td style={{ width: "10%" }}>
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
                          }}
                          disabled
                        >
                          {transaction.status || "N/A"}
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="7">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default ViewTransaction;
