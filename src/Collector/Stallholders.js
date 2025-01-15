import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaCalendarAlt, FaSignOutAlt } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import SidenavCollector from "./SidenavCollector";
import ModalPayment from "./ModalPayment";
import MarkAsPaidModal from "./MarkAsPaidModal";
import OverdueModal from "./OverdueModal"; // Import the OverdueModal component

const ROWS_PER_PAGE = 10;

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const ToggleButton = styled.div`
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? "none" : "block")};
  position: absolute;
  top: 5px;
  left: 15px;
  font-size: 1.8rem;
  color: #333;
  cursor: pointer;
  z-index: 200;
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
  font-family: "Inter", sans-serif;
  font-weight: bold;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 1000px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background: ${({ bgColor }) => bgColor || "#f8f9fa"};
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.15);
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
  }

  p {
    font-size: 2rem;
    margin: 0;
    font-weight: bold;
    color: #333;
  }

  .icon-container {
    margin-top: 1rem;
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

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 20px;
  margin-bottom: 20px;
  margin-top: -25px;
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? "flex" : "none")};
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
`;

const SearchBarCont = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  padding-left: 100px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ced4da;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ButtonContainer = ({ children }) => (
  <div style={{ display: "flex", gap: "10px" }}>{children}</div>
);

const FormContainer = styled.div`
  padding: 40px;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  max-width: 1200px;
  margin: auto;

  h3 {
    font-size: 22px;
    color: #000;
    font-weight: 700;
    margin-bottom: 25px;
  }
`;

const UnitFilterContainer = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;

  .select-container {
    flex: 1;
  }

  .search-container {
    flex: 1;
    max-width: 300px;
    display: flex;
    position: relative;
  }
  .filter-container {
    margin-left: 10px;
  }

  .filter-button {
    padding: 12px 20px;
    font-size: 12px;
    border: 1px solid #ddd;
    border-radius: 12px;
    background-color: #3498db;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #2980b9;
    }

    &:active {
      background-color: #2471a3;
    }
  }

  select {
    padding: 12px 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 15px;
    font-weight: bold;
    color: #333;
    outline: none;
    transition: all 0.3s;

    &:hover,
    &:focus {
      border-color: #2ecc71;
      box-shadow: 0 0 6px rgba(46, 204, 113, 0.4);
    }
  }

  .search-container input {
    padding: 12px 15px;
    font-size: 12px;
    border: 1px solid #ddd;
    border-radius: 10px;
    width: 100%;
    transition: all 0.3s;
    outline: none;
    font-weight: bold;
    padding-left: 30px;

    &:focus {
      border-color: #3498db;
      box-shadow: 0 0 5px rgba(52, 152, 219, 0.4);
    }

    &::placeholder {
      color: #bbb;
    }
  }

  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #888;
    font-size: 18px;
  }
`;

const TableContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

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
      font-size: 12px;
      min-height: 40px; /* Set a minimum height for table cells */
      vertical-align: middle; /* Ensure vertical alignment */
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

    .actions {
      display: flex;
      gap: 5px;
    }

    .action-button {
      display: flex;
      align-items: center;
      border: none;
      background: none;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #0056b3;
      }

      .icon {
        font-size: 24px;
        color: black;
      }
    }
  }
`;

const FilterButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  button {
    padding: 10px 20px;
    font-size: 14px;
    border: 1px solid #ddd;
    border-radius: 12px;
    background-color:rgb(0, 255, 34); /* Primary blue color */
    color: #fff;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #0056b3; /* Darker blue on hover */
    }

    &:active {
      background-color: #004494; /* Even darker blue on active */
    }
  }
`;

const ToggleButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  button {
    padding: 10px 20px;
    font-size: 14px;
    border: 1px solid #ddd;
    border-radius: 12px;
    background-color: ${(props) =>
      props.active
        ? "#023D54"
        : "#9A6735"}; /* Dark Blue for active, Brown for default */
    color: ${(props) =>
      props.active
        ? "#ffff66"
        : "#fff"}; /* Yellow text for active, White for default */
    cursor: pointer;
    transition: all 0.3s;
    width: 150px;

    &:hover {
      background-color: ${(props) =>
        props.active
          ? "#022F42"
          : "#81542C"}; /* Darker Blue and Brown on hover */
    }

    &:active {
      background-color: ${(props) =>
        props.active
          ? "#021E2D"
          : "#684322"}; /* Even darker shades for active */
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(2, 61, 84, 0.4); /* Subtle blue focus ring */
    }
  }
`;

const StatusButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const StatusButton = styled.button`
  padding: 10px 20px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background-color: ${(props) =>
    props.status === "Pending"
      ? "#f39c12"
      : props.status === "Overdue"
      ? "#e74c3c"
      : props.status === "paid"
      ? "#28a745"
      : "#3498db"};
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: ${(props) =>
      props.status === "Pending"
        ? "#d68910"
        : props.status === "Overdue"
        ? "#c0392b"
        : props.status === "paid"
        ? "#218838"
        : "#2980b9"};
  }

  &:active {
    background-color: ${(props) =>
      props.status === "Pending"
        ? "#b9770e"
        : props.status === "Overdue"
        ? "#a93226"
        : props.status === "paid"
        ? "#1e7e34"
        : "#2471a3"};
  }
`;

const MarkAsPaidButton = styled.button`
  padding: 6px 14px; /* Reduced padding */
  font-size: 12px; /* Smaller font size */
  border: 1px solid #ddd;
  border-radius: 8px; /* Slightly smaller radius */
  background-color: ${(props) => (props.disabled ? "#cccccc" : "#28a745")};
  color: #fff;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#cccccc" : "#218838")};
  }

  &:active {
    background-color: ${(props) => (props.disabled ? "#cccccc" : "#1e7e34")};
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stallHolders, setStallHolders] = useState([]);
  const [totalDailyRent, setTotalDailyRent] = useState(0);
  const [dailyCollectionCount, setDailyCollectionCount] = useState(0);
  const [weeklyCollectionCount, setWeeklyCollectionCount] = useState(0);
  const [monthlyCollectionCount, setMonthlyCollectionCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("Select Unit");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMarkAsPaidModalOpen, setIsMarkAsPaidModalOpen] = useState(false);
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false); // State for OverdueModal
  const [selectedStallHolder, setSelectedStallHolder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [dueDate, setDueDate] = useState(null);
  const [totalAmountDue, setTotalAmountDue] = useState(null);
  const [garbageFee, setGarbageFee] = useState(null);
  const [surcharge, setSurcharge] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [overduePayments, setOverduePayments] = useState([]); // State for overdue payments
  const [activeButton, setActiveButton] = useState(null); // State to manage active button

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const fetchStallholders = async (billingCycle = null, searchTerm = "") => {
    try {
      const stallPaymentCollection = collection(rentmobileDb, "stall_payment");
      let q;
      if (billingCycle && searchTerm) {
        q = query(
          stallPaymentCollection,
          where("billingCycle", "==", billingCycle),
          where("status", "in", ["Pending", "Overdue", "paid"]),
          where("firstName", ">=", searchTerm),
          where("lastName", ">=", searchTerm)
        );
      } else if (billingCycle) {
        q = query(
          stallPaymentCollection,
          where("billingCycle", "==", billingCycle),
          where("status", "in", ["Pending", "Overdue", "paid"])
        );
      } else if (searchTerm) {
        q = query(
          stallPaymentCollection,
          where("status", "in", ["Pending", "Overdue", "paid"]),
          where("firstName", ">=", searchTerm),
          where("lastName", ">=", searchTerm)
        );
      } else {
        q = query(
          stallPaymentCollection,
          where("status", "in", ["Pending", "Overdue", "paid"])
        );
      }
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        vendorId: doc.data().vendorId || "",
        email: doc.data().email || "",
        firstName: doc.data().firstName || "",
        lastName: doc.data().lastName || "",
        billingCycle: doc.data().billingCycle || "",
        stallInfo: doc.data().stallInfo || {},
        status: doc.data().status || "Unpaid",
        totalAmountDue: doc.data().totalAmountDue || 0,
        total: doc.data().total || 0,
        dueDate: doc.data().dueDate || null,
        garbageFee: doc.data().garbageFee || 0,
        surcharge: doc.data().surcharge || 0,
        paidBy: doc.data().paidBy || "N/A", // Add the paidBy field
      }));

      const aggregatedData = data.reduce((acc, curr) => {
        const existingVendor = acc.find(
          (vendor) => vendor.vendorId === curr.vendorId
        );
        if (existingVendor) {
          if (!existingVendor.status.includes(curr.status)) {
            existingVendor.status.push(curr.status);
          }
          if (curr.status === "Overdue") {
            existingVendor.totalAmountDue += curr.totalAmountDue;
            existingVendor.overdueCount =
              (existingVendor.overdueCount || 0) + 1;
          }
          if (curr.status === "Pending") {
            existingVendor.total += curr.total;
          }
        } else {
          acc.push({
            ...curr,
            status: [curr.status],
            totalAmountDue: curr.status === "Overdue" ? curr.totalAmountDue : 0,
            total: curr.status === "Pending" ? curr.total : 0,
            overdueCount: curr.status === "Overdue" ? 1 : 0,
          });
        }
        return acc;
      }, []);

      setStallHolders(aggregatedData);
    } catch (error) {
      console.error("Error fetching stallholders:", error);
    }
  };

  const fetchDailyCollectionCount = async () => {
    try {
      const q = query(
        collection(rentmobileDb, "approvedVendors"),
        where("billingCycle", "==", "Daily")
      );
      const querySnapshot = await getDocs(q);
      const dailyVendors = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDailyCollectionCount(dailyVendors.length);
    } catch (error) {
      console.error("Error fetching daily collection count:", error);
    }
  };

  const fetchWeeklyCollectionCount = async () => {
    try {
      const q = query(
        collection(rentmobileDb, "approvedVendors"),
        where("billingCycle", "==", "Weekly")
      );
      const querySnapshot = await getDocs(q);
      const weeklyVendors = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWeeklyCollectionCount(weeklyVendors.length);
    } catch (error) {
      console.error("Error fetching weekly collection count:", error);
    }
  };

  const fetchMonthlyCollectionCount = async () => {
    try {
      const q = query(
        collection(rentmobileDb, "approvedVendors"),
        where("billingCycle", "==", "Monthly")
      );
      const querySnapshot = await getDocs(q);
      const monthlyVendors = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMonthlyCollectionCount(monthlyVendors.length);
    } catch (error) {
      console.error("Error fetching monthly collection count:", error);
    }
  };

  const fetchOverdueCount = async () => {
    try {
      const q = query(
        collection(rentmobileDb, "stall_payment"),
        where("status", "==", "Overdue")
      );
      const querySnapshot = await getDocs(q);
      setOverdueCount(querySnapshot.size);
    } catch (error) {
      console.error("Error fetching overdue count:", error);
    }
  };

  useEffect(() => {
    fetchStallholders();
    fetchDailyCollectionCount();
    fetchWeeklyCollectionCount();
    fetchMonthlyCollectionCount();
    fetchOverdueCount();
  }, []);

  const handleFilter = (billingCycle) => {
    fetchStallholders(billingCycle);
  };

  const handleSearch = (searchTerm) => {
    fetchStallholders(null, searchTerm);
  };

  const fetchUnits = async () => {
    try {
      const querySnapshot = await getDocs(collection(rentmobileDb, "unit"));
      const unitData = querySnapshot.docs.map((doc) => doc.data().name);
      setUnits(["All", ...unitData]);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const openMarkAsPaidModal = async (stallId) => {
    const stall = stallHolders.find((stall) => stall.id === stallId);
    if (stall) {
      const stallRef = doc(rentmobileDb, "stall_payment", stallId);
      const stallDoc = await getDoc(stallRef);

      if (stallDoc.exists()) {
        const stallData = stallDoc.data();
        const totalOverdue = stallData.status.includes("Overdue")
          ? stallData.totalAmountDue
          : 0;
        const totalPending = stallData.status.includes("Pending")
          ? stallData.total
          : 0;
        const totalAmount = totalOverdue + totalPending;
        setTotalAmount(totalAmount);
        setDueDate(stallData.dueDate);
        setTotalAmountDue(stallData.totalAmountDue);
        setGarbageFee(stallData.garbageFee);
        setSurcharge(stallData.surcharge);
        setFirstName(stallData.firstName);
        setLastName(stallData.lastName);
        setSelectedStallHolder(stallId);
        setIsMarkAsPaidModalOpen(true);
      }
    }
  };

  const closeMarkAsPaidModal = () => {
    setIsMarkAsPaidModalOpen(false);
    setSelectedStallHolder(null);
    setTotalAmount(0);
    setDueDate(null);
    setTotalAmountDue(null);
    setGarbageFee(null);
    setSurcharge(null);
    setFirstName("");
    setLastName("");
  };

  const handleMarkAsPaidConfirm = async () => {
    if (selectedStallHolder) {
      try {
        const stallRef = doc(
          rentmobileDb,
          "stall_payment",
          selectedStallHolder
        );
        const stallDoc = await getDoc(stallRef);

        if (stallDoc.exists()) {
          await updateDoc(stallRef, {
            status: "paid",
            paidBy: "cash",
            paymentDate: new Date(), // Add the current date as paymentDate
          });

          setStallHolders((prevStallHolders) =>
            prevStallHolders.map((stall) =>
              stall.id === selectedStallHolder
                ? { ...stall, status: ["paid"] }
                : {
                    ...stall,
                    status: stall.status.filter(
                      (s) => s !== "Pending" && s !== "Overdue"
                    ),
                  }
            )
          );

          closeMarkAsPaidModal();
        }
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
  };

  useEffect(() => {
    try {
      const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
      if (loggedInUserData) {
        const currentUser = stallHolders.find(
          (user) => user.email === loggedInUserData.email
        );
        setLoggedInUser(currentUser || loggedInUserData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [stallHolders]);

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

  const openModal = (stallId, status) => {
    if (status === "Overdue") {
      setSelectedStallHolder(stallId);
      setIsOverdueModalOpen(true);
      const stall = stallHolders.find((stall) => stall.id === stallId);
      if (stall) {
        const payments = stall.status.includes("Overdue")
          ? stallHolders
              .filter((stall) => stall.status.includes("Overdue"))
              .map((stall) => ({
                dueDate: stall.dueDate,
                totalAmountDue: stall.totalAmountDue,
              }))
          : [];
        setOverduePayments(payments);
      }
    } else {
      setSelectedStallHolder(stallId);
      setSelectedStatus(status);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStallHolder(null);
    setSelectedStatus(null);
  };

  const closeOverdueModal = () => {
    setIsOverdueModalOpen(false);
    setSelectedStallHolder(null);
    setOverduePayments([]);
  };

  const handleConfirm = async () => {
    if (selectedStallHolder) {
      try {
        const stallRef = doc(
          rentmobileDb,
          "stall_payment",
          selectedStallHolder
        );
        const stallDoc = await getDoc(stallRef);

        if (stallDoc.exists()) {
          await updateDoc(stallRef, {
            status: "paid",
            paidBy: "cash",
            paymentDate: new Date(), // Add the current date as paymentDate
          });

          setStallHolders((prevStallHolders) =>
            prevStallHolders.map((stall) =>
              stall.id === selectedStallHolder
                ? { ...stall, status: ["paid"] }
                : {
                    ...stall,
                    status: stall.status.filter(
                      (s) => s !== "Pending" && s !== "Overdue"
                    ),
                  }
            )
          );

          closeModal();
        }
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=500,width=800");
    printWindow.document.write(
      "<html><head><title>Payment Receipt</title></head><body>"
    );
    printWindow.document.write("<h3>Payment Receipt</h3>");
    printWindow.document.write(
      document.getElementById("receipt-content").innerHTML
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const getCurrentDay = () => {
    const today = new Date();
    const day = today.getDay();
    return day;
  };

  return (
    <DashboardContainer>
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
          <div className="title">Collector</div>
        </AppBar>
        <br></br>

        <StatsContainer>
          <StatBox bgColor="#f8f9fa">
            <h3>Daily Collection</h3>
            <p>{dailyCollectionCount}</p>
            <div className="icon-container">
              <FaCalendarAlt
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.7,
                  animation: "fade 2s infinite alternate",
                  color: "#333",
                }}
              />
            </div>
          </StatBox>

          <StatBox bgColor="#f8f9fa">
            <h3>Weekly Collection</h3>
            <p>{weeklyCollectionCount}</p>
            <div className="icon-container">
              <FaCalendarAlt
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                  color: "#333",
                }}
              />
            </div>
          </StatBox>

          <StatBox bgColor="#f8f9fa">
            <h3>Monthly Collection</h3>
            <p>{monthlyCollectionCount}</p>
            <div className="icon-container">
              <FaCalendarAlt
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                  color: "#333",
                }}
              />
            </div>
          </StatBox>
        </StatsContainer>

        <br></br>
        <TopBarContainer>
          <ButtonContainer></ButtonContainer>
        </TopBarContainer>

        <FormContainer>
          <TableContainer>
            <h3>Stall Holders</h3>

            <FilterButtonContainer>
              <button onClick={() => handleFilter(null)}>ALL</button>
              <button onClick={() => handleFilter("Daily")}>DAILY</button>
              <button onClick={() => handleFilter("Weekly")}>WEEKLY</button>
              <button onClick={() => handleFilter("Monthly")}>MONTHLY</button>
            </FilterButtonContainer>
            <UnitFilterContainer>
              <div className="select-container">
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  {units.map((unit, index) => (
                    <option key={index} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-container">
                <button className="filter-button" onClick={handleFilter}>
                  Filter
                </button>
              </div>

              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search Stallholder"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                />
                <div className="search-icon">
                  <FontAwesomeIcon icon={faSearch} />
                </div>
              </div>
            </UnitFilterContainer>

            <table>
              <thead>
                <tr>
                  <th>Vendor ID</th>
                  <th>Name</th>
                  <th>Billing Cycle</th>
                  <th>MOP</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stallHolders.map((stall) => (
                  <tr key={stall.id}>
                    <td>{stall.vendorId}</td>
                    <td>
                      {stall.firstName} {stall.lastName}
                    </td>
                    <td>{stall.billingCycle}</td>
                    <td>{stall.paidBy}</td>
                    <td>
                      <StatusButtonContainer>
                        {stall.status.map((status, index) => (
                          <StatusButton
                            key={index}
                            status={status}
                            onClick={() => openModal(stall.id, status)}
                          >
                            {status}{" "}
                            {status === "Overdue" && `(${stall.overdueCount})`}
                          </StatusButton>
                        ))}
                      </StatusButtonContainer>
                    </td>
                    <td className="actions">
                      {stall.status.includes("Pending") ||
                      stall.status.includes("Overdue") ? (
                        <MarkAsPaidButton
                          onClick={() => openMarkAsPaidModal(stall.id)}
                          style={{ marginLeft: "10px" }}
                          disabled={
                            stall.billingCycle === "Weekly" &&
                            getCurrentDay() !== 1
                          }
                        >
                          Mark as Paid
                        </MarkAsPaidButton>
                      ) : (
                        <div style={{ minHeight: "40px" }}></div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableContainer>
        </FormContainer>
      </MainContent>
      {isModalOpen && (
        <ModalPayment
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={handleConfirm}
          stallId={selectedStallHolder}
          status={selectedStatus}
        />
      )}
      {isMarkAsPaidModalOpen && (
        <MarkAsPaidModal
          isOpen={isMarkAsPaidModalOpen}
          onClose={closeMarkAsPaidModal}
          onConfirm={handleMarkAsPaidConfirm}
          totalAmount={totalAmount}
          dueDate={dueDate}
          totalAmountDue={totalAmountDue}
          firstName={firstName}
          lastName={lastName}
          garbageFee={garbageFee}
          surcharge={surcharge}
        />
      )}
      {isOverdueModalOpen && (
        <OverdueModal
          isOpen={isOverdueModalOpen}
          onClose={closeOverdueModal}
          overduePayments={overduePayments}
        />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
