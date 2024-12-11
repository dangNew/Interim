import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faShoppingCart,
  faSearch,
  faPlus,
  faUsers,
  faFileContract,
  faTicketAlt,
  faCheck,
  faClipboard,
  faPlusCircle,
  faEye,
  faCogs,
} from "@fortawesome/free-solid-svg-icons";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { rentmobileDb } from "../components/firebase.config";

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

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 40px 10px;
  position: relative;
  flex-direction: column;

  .profile-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #6c757d;
  }

  .profile-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: black;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? "block" : "none")};
  }

  hr {
    width: 100%;
    border: 0.5px solid #ccc;
    margin-top: 15px;
  }

  .profile-position {
    font-size: 1rem;
    font-weight: 600;
    color: #007bff;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? "block" : "none")};
    margin-top: 5px;
  }
`;

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  margin: 30px 0;
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

const SidebarFooter = styled.div`
  padding: 10px;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) =>
    isSidebarOpen ? "flex-start" : "center"};
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
  padding: 1rem;
  border-radius: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

  h2 {
    margin-bottom: 20px;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
  text-align: left;
`;

const TableHeader = styled.th`
  background-color: #007bff;
  color: white;
  padding: 10px;
  text-align: left;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }

  &:hover {
    background-color: #ddd;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
`;

const ViewButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056b3; /* Blue color on hover */
  }
`;

const TransactionButton = styled.button`
  background-color: #ffa500;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px; /* Space between the icon and text */
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e68a00; /* Orange color on hover */
  }

  svg {
    font-size: 1.2rem; /* Adjust icon size */
  }
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
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
        status: doc.data().status || [], // Ensure status is an array
      }));

      setStallHolders(data);
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

  const getStatus = (statusArray) => {
    if (!Array.isArray(statusArray)) {
      return '';
    }
    const overdueCount = statusArray.filter(status => status === 'Overdue').length;
    const hasPending = statusArray.includes('Pending');
    return hasPending ? 'Pending' : overdueCount > 0 ? `Overdue (${overdueCount})` : '';
  };

  return (
    <DashboardContainer>
      <Sidebar ref={sidebarRef} isSidebarOpen={isSidebarOpen}>
        <Link to="/profile" style={{ textDecoration: "none" }}>
          <ProfileHeader isSidebarOpen={isSidebarOpen}>
            {loggedInUser && loggedInUser.Image ? (
              <ProfileImage
                src={loggedInUser.Image}
                alt={`${loggedInUser.firstName} ${loggedInUser.lastName}`}
              />
            ) : (
              <FaUserCircle className="profile-icon" />
            )}
            <span className="profile-name">
              {loggedInUser
                ? `${loggedInUser.firstName} ${loggedInUser.lastName}`
                : "Guest"}
            </span>
            <span
              className="profile-email"
              style={{
                fontSize: "0.9rem",
                color: "#6c757d",
                display: isSidebarOpen ? "block" : "none",
              }}
            >
              {loggedInUser ? loggedInUser.email : ""}
            </span>
            <span
              className="profile-position"
              style={{
                fontSize: "0.9rem",
                color: "#6c757d",
                display: isSidebarOpen ? "block" : "none",
              }}
            >
              {loggedInUser ? loggedInUser.position : ""}
            </span>
          </ProfileHeader>
        </Link>

        <SearchBarContainer isSidebarOpen={isSidebarOpen}>
          <FaSearch />
          <SearchInput type="text" placeholder="Search..." />
        </SearchBarContainer>

        <SidebarMenu>
          <Link to="/collectdash" style={{ textDecoration: "none" }}>
            <SidebarItem isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faHome} className="icon" />
              <span>Dashboard</span>
            </SidebarItem>
          </Link>

          <Link to="/stallholders" style={{ textDecoration: "none" }}>
            <SidebarItem isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faShoppingCart} className="icon" />
              <span>List of Vendors</span>
            </SidebarItem>
          </Link>
          <Link to="/transaction" style={{ textDecoration: "none" }}>
            <SidebarItem isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faShoppingCart} className="icon" />
              <span>Transaction</span>
            </SidebarItem>
          </Link>
        </SidebarMenu>

        <SidebarFooter isSidebarOpen={isSidebarOpen}>
          <LogoutButton isSidebarOpen={isSidebarOpen} onClick={handleLogout}>
            <span>
              <FaSignOutAlt />
            </span>
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <ToggleButton onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          <div>LIST OF VENDORS</div>
        </AppBar>

        <ToggleButton isSidebarOpen={isSidebarOpen} onClick={toggleSidebar}>
          <FaBars />
        </ToggleButton>

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
          <h2>Stall Payments</h2>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Vendor ID</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Billing Cycle</TableHeader>
                  <TableHeader>Stall Location</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {stallHolders.map((stall) => (
                  <TableRow key={stall.id}>
                    <TableCell>{stall.vendorId}</TableCell>
                    <TableCell>{stall.firstName} {stall.lastName}</TableCell>
                    <TableCell>{stall.email}</TableCell>
                    <TableCell>{stall.billingCycle}</TableCell>
                    <TableCell>{stall.stallInfo.location || "N/A"}</TableCell>
                    <TableCell>{getStatus(stall.status)}</TableCell>
                    <TableCell>
                      <button
                        className="view-button"
                        onClick={() => handleViewTransaction(stall.vendorId)}
                      >
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
