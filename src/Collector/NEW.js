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

const UnitFilterContainer = styled.div`
  margin-bottom: 30px;
  display: flex;
  gap: 15px;
  align-items: center;

  .select-container select {
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 14px;
    color: #555;
    transition: border-color 0.3s, box-shadow 0.3s;

    &:focus {
      border-color: #3498db;
      box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
    }
  }

  .filter-button {
    padding: 10px 20px;
    font-size: 14px;
    border-radius: 8px;
    background-color: #3498db;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #2980b9;
    }
  }

  .search-container {
    display: flex;
    position: relative;
    width: 100%;

    input {
      width: 100%;
      padding: 10px 40px 10px 15px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 8px;
      transition: border-color 0.3s;

      &:focus {
        border-color: #3498db;
      }

      &::placeholder {
        color: #999;
      }
    }

    .search-icon {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #888;
    }
  }
`;

const StallHolderContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
`;

const StallHolderCard = styled.div`
  background-color: #f9fafb;
  border-radius: 15px;
  border: 3px solid #ddd;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  padding: 25px;
  width: 320px;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const StallHolderInfo = styled.div`
  margin-bottom: 20px;
  font-size: 15px;
  color: #333;

  div {
    margin-bottom: 10px;
    color: #333;

    &::before {
      font-weight: bold;
      margin-right: 5px;
    }

    &:nth-child(1)::before { content: "Vendor ID:"; }
    &:nth-child(2)::before { content: "Name:"; }
    &:nth-child(3)::before { content: "Email:"; }
    &:nth-child(4)::before { content: "Billing Cycle:"; }
    &:nth-child(5)::before { content: "Stall Location:"; }
  }
`;

const StallHolderActions = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    background-color: #3498db;
    color: #ffffff;
    border: none;
    padding: 12px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: background-color 0.3s, transform 0.2s;

    &:hover {
      background-color: #2980b9;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .view-button {
    background-color: #3498db;
    padding: 10px 16px;
    font-size: 16px;
    border-radius: 10px;
    width: 40%;
    transition: background-color 0.3s, transform 0.2s;

    &:hover {
      background-color: #2980b9;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.98);
    }
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
          <StallHolderContainer>
            {stallHolders.map((stall) => (
              <StallHolderCard key={stall.id}>
                <StallHolderInfo>
                  <div>{stall.vendorId}</div>
                  <div>{stall.firstName} {stall.lastName}</div>
                  <div>{stall.email}</div>
                  <div>{stall.billingCycle}</div>
                  <div>{stall.stallInfo.location || "N/A"}</div>
                </StallHolderInfo>
                <StallHolderActions>
                  <button
                    className="view-button"
                    onClick={() => handleViewTransaction(stall.vendorId)}
                  >
                    View
                  </button>
                </StallHolderActions>
              </StallHolderCard>
            ))}
          </StallHolderContainer>
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
