import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  
  FaUserSlash,
  FaUser,
  FaUsers,
  FaWallet,
  FaList,
} from "react-icons/fa";
import {
  faHome,
  faShoppingCart,
  
} from "@fortawesome/free-solid-svg-icons";
import { faClipboard } from "@fortawesome/free-regular-svg-icons";
import { rentmobileDb } from "../components/firebase.config";
import { getDocs, collection, query, where } from "firebase/firestore";
import LoginAnalytics from "./LoginAnalytics";
import Graph from "./Graph";
import ActiveModal from "./ActiveModal";
import TotalUsersModal from "./TotalUsersModal";
import InactiveUsersModal from "./InactiveUsersModal";
import CollectorsModal from "./CollectorsModal"; // Import the new modal
import VendorLocationAnalytics from "./VendorLocationAnalytics"; // Import the new component
import IntSidenav from "./IntSidenav";

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
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
  background-color: #188423; /* Updated color */
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: "Inter", sans-serif; /* Use a professional font */
  font-weight: bold; /* Apply bold weight */
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
  background-color: ${({ bgColor }) =>
    bgColor || "#3b5998"}; /* Default to Soft Blue */
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #ccc;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #f8f9fa; /* Light Gray-White */
  }

  p {
    font-size: 2rem;
    margin: 0;
    font-weight: bold;
    color: #f8f9fa; /* Light Gray-White */
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

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 15px;
  background-color: #f8f9fa;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
    font-size: 1.6rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    border: 1px solid #ddd;

    th,
    td {
      padding: 15px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
      transition: background-color 0.2s ease;
    }

    th {
      background-color: #e9ecef;
      font-weight: bold;
      color: #495057;
    }

    td {
      background-color: #fff;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    tr:hover {
      background-color: #f1f3f5;
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

const CollectorTableContainer = styled(FormContainer)`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
`;

const CollectorTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 15px;
    text-align: left;
    border-bottom: 2px solid #dee2e6;
    transition: background-color 0.2s ease;
  }

  th {
    background-color: #e9ecef;
    font-weight: bold;
    color: #495057;
  }

  td {
    background-color: #fff;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f3f5;
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [totalCollectors, setTotalCollectors] = useState(0);
  const [collectorsData, setCollectorsData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    userManagement: false,
    addUnit: false,
    appraise: false,
    contract: false,
    ticket: false,
    manageZone: false,
    manageSpace: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeUsersList, setActiveUsersList] = useState([]);
  const [isTotalUsersModalOpen, setIsTotalUsersModalOpen] = useState(false);
  const [totalUsersList, setTotalUsersList] = useState([]);
  const [isInactiveUsersModalOpen, setIsInactiveUsersModalOpen] =
    useState(false);
  const [inactiveUsersList, setInactiveUsersList] = useState([]);
  const [isCollectorsModalOpen, setIsCollectorsModalOpen] = useState(false); // New state for Collectors Modal
  const [collectorsList, setCollectorsList] = useState([]); // New state for Collectors List

  const navigate = useNavigate();

  useEffect(() => {
    // Define an async function to fetch collectors data
    const fetchCollectors = async () => {
      try {
        // Fetch the collection of documents from Firestore
        const querySnapshot = await getDocs(
          collection(rentmobileDb, "ambulant_collector")
        );
        // Get the total number of collectors
        const collectorsCount = querySnapshot.size;
        // Log the number of collectors fetched
        console.log("Number of collectors fetched:", collectorsCount);
        // Update the state with the total number of collectors
        setTotalCollectors(collectorsCount);

        // Map through the documents to extract data and include the document ID
        const collectorsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Log the fetched collectors data
        console.log("Fetched Collectors Data:", collectorsData);
        // Update the state with the collectors data
        setCollectorsData(collectorsData);
      } catch (error) {
        // Log any errors that occur during the fetch
        console.error("Error fetching collectors:", error);
      }
    };

    // Call the fetchCollectors function
    fetchCollectors();
  }, []); // The empty dependency array means this effect runs once after the initial render


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(rentmobileDb, "admin_users")
        );
        const allUsers = querySnapshot.docs.map((doc) => doc.data());
        console.log("Fetched Users:", allUsers);
        const validUsers = allUsers.filter(
          (user) => user.email && user.firstName && user.lastName
        );
        setTotalUsers(validUsers.length);

        const activeUsersCount = validUsers.filter(
          (user) => user.status?.toLowerCase() === "active"
        ).length;
        setActiveUsers(activeUsersCount);

        const inactiveUsersCount = validUsers.filter(
          (user) => user.status?.toLowerCase() === "inactive"
        ).length;
        setInactiveUsers(inactiveUsersCount);

        setRecentUsers(validUsers.slice(-5));

        const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
        if (loggedInUserData) {
          const currentUser = allUsers.find(
            (user) => user.email === loggedInUserData.email
          );
          setLoggedInUser(currentUser || loggedInUserData);
        }

        setTotalUsersList(validUsers); // Set the total users list
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen((prevState) => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };

  const handleStatBoxClick = async () => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(rentmobileDb, "admin_users"),
          where("status", "==", "Active")
        )
      );
      const activeUsers = querySnapshot.docs.map((doc) => doc.data());
      console.log("Fetched Active Users:", activeUsers);
      setActiveUsersList(activeUsers);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching active users:", error);
    }
  };

  const handleTotalUsersStatBoxClick = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(rentmobileDb, "admin_users")
      );
      const allUsers = querySnapshot.docs.map((doc) => doc.data());
      setTotalUsersList(allUsers);
      setIsTotalUsersModalOpen(true);
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  };

  const handleInactiveUsersStatBoxClick = async () => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(rentmobileDb, "admin_users"),
          where("status", "==", "Inactive")
        )
      );
      const inactiveUsers = querySnapshot.docs.map((doc) => doc.data());
      console.log("Fetched Inactive Users:", inactiveUsers);
      setInactiveUsersList(inactiveUsers);
      setIsInactiveUsersModalOpen(true);
    } catch (error) {
      console.error("Error fetching inactive users:", error);
    }
  };

  const handleCollectorsStatBoxClick = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(rentmobileDb, "ambulant_collector")
      );
      const collectors = querySnapshot.docs.map((doc) => doc.data());
      setCollectorsList(collectors);
      setIsCollectorsModalOpen(true);
    } catch (error) {
      console.error("Error fetching collectors:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  return (
    <DashboardContainer>
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
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>
        <br />
        <br />

        <StatsContainer>
          <StatBox bgColor="#5c6bc0" onClick={handleTotalUsersStatBoxClick}>
            <h3>Total Users</h3>
            <p>{totalUsers}</p>
            <div className="icon-container">
              <FaUsers
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                }}
              />
            </div>
          </StatBox>
          <StatBox bgColor="#42a5f5" onClick={handleStatBoxClick}>
            <h3>Active Users</h3>
            <p>{activeUsers}</p>
            <div className="icon-container">
              <FaUser
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                }}
              />
            </div>
          </StatBox>
          <StatBox bgColor="#66bb6a" onClick={handleInactiveUsersStatBoxClick}>
            <h3>Inactive Users</h3>
            <p>{inactiveUsers}</p>
            <div className="icon-container">
              <FaUserSlash
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                }}
              />
            </div>
          </StatBox>
          <StatBox bgColor="#ffa726" onClick={handleCollectorsStatBoxClick}>
            <h3>Total Collectors</h3>
            <p>{totalCollectors}</p>
            <div className="icon-container">
              <FaWallet
                className="fading-icon"
                style={{
                  fontSize: "30px",
                  opacity: 0.5,
                  animation: "fade 2s infinite alternate",
                }}
              />
            </div>
          </StatBox>
        </StatsContainer>
        <br></br>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "5px",
            padding: "30px",
          }}
        >
          <div style={{ flex: 1, maxWidth: "300px", margin: "0 auto" }}>
            <LoginAnalytics />
          </div>
          <div style={{ flex: 1, maxWidth: "700px", margin: "0 auto" }}>
            <VendorLocationAnalytics />
          </div>
        </div>

        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "5px",
            padding: "50px",
          }}
        >
          <div style={{ flex: 1, maxWidth: "100%", margin: "0 auto" }}>
            <Graph />
          </div>
        </div>

        <FormContainer>
          <h3>Recently Registered</h3>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user, index) => (
                <tr key={index}>
                  <td>{user.email || ""}</td>
                  <td>{user.firstName || ""}</td>
                  <td>{user.lastName || ""}</td>
                  <td>{user.contactNum || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormContainer>
        <CollectorTableContainer>
          <h3>Collector Users</h3>
          <CollectorTable>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Address</th>
                <th>Collector</th>
                <th>Location</th>
                <th>Contact Number</th>
              </tr>
            </thead>
            <tbody>
              {collectorsData.length > 0 ? (
                collectorsData.map((collector) => (
                  <tr key={collector.id}>
                    <td>{collector.email}</td>
                    <td>{collector.firstName + " " + collector.lastName}</td>
                    <td>{collector.address}</td>
                    <td>{collector.collector}</td>
                    <td>{collector.location}</td>
                    <td>{collector.contactNum}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No collectors found.</td>
                </tr>
              )}
            </tbody>
          </CollectorTable>
        </CollectorTableContainer>
      </MainContent>
      {isModalOpen && (
        <ActiveModal
          users={activeUsersList}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isTotalUsersModalOpen && (
        <TotalUsersModal
          users={totalUsersList}
          onClose={() => setIsTotalUsersModalOpen(false)}
        />
      )}
      {isInactiveUsersModalOpen && (
        <InactiveUsersModal
          users={inactiveUsersList}
          onClose={() => setIsInactiveUsersModalOpen(false)}
        />
      )}
      {isCollectorsModalOpen && (
        <CollectorsModal
          collectors={collectorsList}
          onClose={() => setIsCollectorsModalOpen(false)}
        />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
