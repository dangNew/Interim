import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faPlusCircle, faEye, faCogs } from "@fortawesome/free-solid-svg-icons";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";
import SidenavCollector from "./SidenavCollector";
import NoticeModal from '../Interim/NoticeModal';
import ViolationModal from '../Interim/ViolationModal'; // Corrected import path

const ROWS_PER_PAGE = 10;

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  border: 1px solid #ddd;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow: auto;
  max-height: 100vh;
`;

const SidebarMenu = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SidebarItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) =>
    isSidebarOpen ? "flex-start" : "center"};
  padding: 10px;
  margin-bottom: 10px;
  margin-top: -10px;
  border-radius: 8px;
  font-size: 14px;
  color: ${({ active }) => (active ? "white" : "#333")};
  background-color: ${({ active }) => (active ? "#007bff" : "transparent")};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ active }) => (active ? "#007bff" : "#f1f3f5")};
  }

  .icon {
    font-size: 1rem;
    color: #000;
    transition: margin-left 0.2s ease;
  }

  span:last-child {
    margin-left: 10px;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? "inline" : "none")};
  }
`;



const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")};
  padding-left: 40px;
  background-color: #fff;
  padding: 2rem;
  width: 100%;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
  flex: 1;
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
  margin-top: 50px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background-color: ${({ bgColor }) => bgColor || "#f4f4f4"};
  padding: 3rem;
  border-radius: 12px;
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
    color: white;
  }

  p {
    font-size: 2rem;
    margin: 0;
    font-weight: bold;
    color: white;
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




const LogoutButton = styled(SidebarItem)`
  margin-top: 5px;
  background-color: #dc3545;
  color: white;
  align-items: center;
  margin-left: 20px;
  padding: 5px 15px;
  border-radius: 5px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #c82333;
    transform: scale(1.05);
  }
`;

const ButtonContainer = ({ children }) => (
  <div style={{ display: "flex", gap: "10px" }}>{children}</div>
);

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 20px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); /* Softer shadow */

  h2 {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    text-align: center; /* Align the header centrally */
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;

    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }

  th {
      background-color: #e9ecef;
      color: #333;
      font-weight: bold;
    }

  td {
    padding: 10px;
    border: 1px solid #ddd;
    vertical-align: middle; /* Align text properly */
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  tr:hover {
    background-color: #e9ecef;
    transition: background-color 0.2s ease-in-out; /* Smooth hover effect */
  }

  .actions {
    text-align: center; /* Center align the actions column */
  }

  button {
    padding: 8px 12px;
    font-size: 12px;
    color: #fff;
    background-color: #007bff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  button:hover {
    background-color: #0056b3;
  }
`;


const NoticeButton = styled.button`
  background-color: ${({ hasNotice }) => (hasNotice ? '#ff4d4d' : '#ddd')};
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ hasNotice }) => (hasNotice ? '#e63939' : '#ccc')}; /* Red color on hover */
  }
`;

const ViolationButton = styled.button`
  background-color: ${({ hasViolation }) => (hasViolation ? '#ff4d4d' : '#ddd')};
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ hasViolation }) => (hasViolation ? '#e63939' : '#ccc')}; /* Red color on hover */
  }
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
  margin: 30px 0;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #6c757d;
  font-size: 1.2em;
`;

const SearchIn = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
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

const DateSearchBarCont = styled(SearchBarCont)`
  margin-left: 20px;
`;

const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stallHolders, setStallHolders] = useState([]);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("Select Unit");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalDailyRent, setTotalDailyRent] = useState(0);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false); // State for ViolationModal
  const [selectedViolation, setSelectedViolation] = useState(null); // State for selected violation
  const [searchTerm, setSearchTerm] = useState('');
  const [dateSearchTerm, setDateSearchTerm] = useState(''); // State for date search term
  const [stallNoFilter, setStallNoFilter] = useState('');
  const [filteredStallHolders, setFilteredStallHolders] = useState([]);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDateSearchChange = (event) => {
    setDateSearchTerm(event.target.value);
  };

  useEffect(() => {
    let filteredData = stallHolders.filter(stall =>
      (stall.firstName + ' ' + stall.lastName).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (dateSearchTerm) {
      filteredData = filteredData.filter(stall => stall.date === dateSearchTerm);
    }

    if (stallNoFilter) {
      filteredData = filteredData.filter(stall => stall.stallNumber === stallNoFilter);
    }
    if (selectedUnit !== 'Select Unit') {
      filteredData = filteredData.filter(stall => stall.location === selectedUnit);
    }

    setFilteredStallHolders(filteredData);
  }, [searchTerm, dateSearchTerm, stallHolders, stallNoFilter, selectedUnit]);


  const fetchStallholders = async () => {
    try {
      const querySnapshot = await getDocs(collection(rentmobileDb, "approvedVendors"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || "",
        firstName: doc.data().firstName || "",
        lastName: doc.data().lastName || "",
        billingCycle: doc.data().billingCycle || "",
        stallInfo: doc.data().stallInfo || {},
        vendorId: doc.id, // Assuming vendorId is the document ID
      }));

      const checkViolation = async (vendorId) => {
        try {
          const violationCollection = collection(rentmobileDb, 'Market_violations');
          const q = query(violationCollection, where('vendorId', '==', vendorId));
          const querySnapshot = await getDocs(q);
          return querySnapshot.size; // Return the count of documents
        } catch (error) {
          console.error('Error checking violation:', error);
          return 0;
        }
      };

      const checkNotice = async (vendorId) => {
        try {
          const noticeCollection = collection(rentmobileDb, 'Notice_Report');
          const q = query(noticeCollection, where('vendorId', '==', vendorId));
          const querySnapshot = await getDocs(q);
          return querySnapshot.size; // Return the count of documents
        } catch (error) {
          console.error('Error checking notice:', error);
          return 0;
        }
      };

      const dataWithNoticeCheck = await Promise.all(
        data.map(async (stall) => {
          const noticeCount = await checkNotice(stall.id);
          const violationCount = await checkViolation(stall.id);
          return { ...stall, noticeCount, violationCount };
        })
      );

      setStallHolders(dataWithNoticeCheck);
    } catch (error) {
      console.error("Error fetching stallholders:", error);
    }
  };

  useEffect(() => {
    fetchStallholders();
  }, []);

  const handleViewTransaction = (vendorId) => {
    navigate(`/view-transaction/${vendorId}`);
  };

  const handleNotice = (vendorId) => {
    setSelectedNotice(vendorId);
    setIsNoticeModalOpen(true);
  };

  const handleNoticeModalClose = () => {
    setIsNoticeModalOpen(false);
    setSelectedNotice(null);
  };

  const handleViolation = (vendorId) => {
    setSelectedViolation(vendorId);
    setIsViolationModalOpen(true);
  };

  const handleViolationModalClose = () => {
    setIsViolationModalOpen(false);
    setSelectedViolation(null);
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
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>
        <br></br>

        <StatsContainer>
          <StatBox
            bgColor="#11768C"
            onClick={() => navigate("/daily")}
            style={{ cursor: "pointer" }}
          >
            <FaCalendarDay
              style={{
                fontSize: "40px",
                color: "white",
                marginBottom: "1rem",
              }}
            />
            <h3>Daily Collection</h3>
            <p>{/* Add your daily rent logic here */}</p>
          </StatBox>

          <StatBox
            bgColor="#188423"
            onClick={() => navigate("/weekly")}
            style={{ cursor: "pointer" }}
          >
            <FaCalendarWeek
              style={{
                fontSize: "40px",
                color: "white",
                marginBottom: "1rem",
              }}
            />
            <h3>Weekly Collection</h3>
            <p>{/* Add your weekly rent logic here */}</p>
          </StatBox>

          <StatBox
            bgColor="#FF9800"
            onClick={() => navigate("/monthly")}
            style={{ cursor: "pointer" }}
          >
            <FaCalendarAlt
              style={{
                fontSize: "40px",
                color: "white",
                marginBottom: "1rem",
              }}
            />
            <h3>Monthly Collection</h3>
            <p>{/* Add your monthly rent logic here */}</p>
          </StatBox>
        </StatsContainer>

        <TopBarContainer>
          <ButtonContainer></ButtonContainer>
        </TopBarContainer>

        <FormContainer>
        <TopBarContainer>
            <SearchBarCont>
              <SearchIcon />
              <SearchIn
                type="text"
                placeholder="Search Stall Holders..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </SearchBarCont>
            <DateSearchBarCont>
              <SearchIcon />
              <SearchIn
                type="date"
                placeholder="Search by Date..."
                value={dateSearchTerm}
                onChange={handleDateSearchChange}
              />
            </DateSearchBarCont>
          
          </TopBarContainer>
         
          <table>
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Billing Cycle</th>
                <th>Stall Location</th>
                <th>Notice</th>
                <th>Violation</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stallHolders.map((stall) => (
                <tr key={stall.id}>
                  <td>{stall.vendorId}</td>
                  <td>{stall.firstName} {stall.lastName}</td>
                  <td>{stall.email}</td>
                  <td>{stall.billingCycle}</td>
                  <td>{stall.stallInfo.location || "N/A"}</td>
                  <td>
                    {stall.noticeCount > 0 ? (
                      <NoticeButton hasNotice={true} onClick={() => handleNotice(stall.id)}>
                        Notice ({stall.noticeCount})
                      </NoticeButton>
                    ) : (
                      'No Notice'
                    )}
                  </td>
                  <td>
                    {stall.violationCount > 0 ? (
                      <ViolationButton hasViolation={true} onClick={() => handleViolation(stall.id)}>
                        <FaExclamationTriangle style={{ marginRight: '6px' }} /> {/* Add the icon */}
                        Violation ({stall.violationCount})
                      </ViolationButton>
                    ) : (
                      'No Violation'
                    )}
                  </td>
                  <td className="actions">
                    <button
                      className="view-button"
                      onClick={() => handleViewTransaction(stall.vendorId)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormContainer>

        <NoticeModal isOpen={isNoticeModalOpen} onClose={handleNoticeModalClose} vendorId={selectedNotice} />
        <ViolationModal isOpen={isViolationModalOpen} onClose={handleViolationModalClose} vendorId={selectedViolation} />
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
