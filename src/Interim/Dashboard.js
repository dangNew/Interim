import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaUserSlash, FaUser, FaUsers, FaWallet, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { rentmobileDb } from "../components/firebase.config";
import { getDocs, collection, query, where } from "firebase/firestore";
import LoginAnalytics from "./LoginAnalytics";
import Graph from "./Graph";
import ActiveModal from "./ActiveModal";
import TotalUsersModal from "./TotalUsersModal";
import InactiveUsersModal from "./InactiveUsersModal";
import CollectorsModal from "./CollectorsModal";
import VendorLocationAnalytics from "./VendorLocationAnalytics";
import IntSidenav from "./IntSidenav";
import CarbonLogo from '../CarbonLogo/472647195_1684223168803549_1271657271156175542_n.jpg';
import PieChartComponent from "./PieChartComponent";

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")};
  padding: 2rem;
  background-color: #fff;
  width: calc(100% - ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")});
  transition: margin-left 0.3s ease, width 0.3s ease;
  overflow-y: auto;
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #ffffff;
  color: #333;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 1.5rem;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
`;

const Logo = styled.img`
  height: 40px;
  margin-right: 1rem;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const StatBox = styled.div`
  background-color: ${({ bgColor }) => bgColor || "#4CAF50"}; /* Default to Green */
  color: #FFFFFF;
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid #DDDDDD;
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    font-size: 1.5rem;
    margin: 0;
    font-weight: bold;
  }
`;

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f8f9fa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    border: 1px solid #ddd;

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background-color: #f1f3f5;
      font-weight: bold;
      color: #333;
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

  .actions {
    display: flex;
    gap: 0.5rem;
    cursor: pointer;
  }
`;

const CollectorTableContainer = styled(FormContainer)`
  margin-top: 2rem;
`;

const GraphContainer = styled.div`
  width: 100%;
  max-width: 1200px; /* Adjust this value to make the graph wider */
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f8f9fa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const PieChartContainer = styled.div`
  width: 100%;
  max-width: 600px; /* Adjust this value to make the pie chart wider */
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f8f9fa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const RecentlyRegistered = ({ recentUsers }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleViewDetails = (user) => {
    // Implement view details functionality
    console.log("View details for user:", user);
  };

  const handleEditUser = (user) => {
    // Implement edit user functionality
    console.log("Edit user:", user);
  };

  const handleDeleteUser = (user) => {
    // Implement delete user functionality
    console.log("Delete user:", user);
  };

  const filteredUsers = recentUsers.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <FormContainer>
      <h3>Recently Registered</h3>
      <input
        type="text"
        placeholder="Search by email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%", boxSizing: "border-box" }}
      />
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.email || ""}</td>
              <td>{user.firstName || ""}</td>
              <td>{user.lastName || ""}</td>
              <td>{user.contactNum || ""}</td>
              <td>
                <div className="actions">
                  <FaEye onClick={() => handleViewDetails(user)} />
                  <FaEdit onClick={() => handleEditUser(user)} />
                  <FaTrash onClick={() => handleDeleteUser(user)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </FormContainer>
  );
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeUsersList, setActiveUsersList] = useState([]);
  const [isTotalUsersModalOpen, setIsTotalUsersModalOpen] = useState(false);
  const [totalUsersList, setTotalUsersList] = useState([]);
  const [isInactiveUsersModalOpen, setIsInactiveUsersModalOpen] = useState(false);
  const [inactiveUsersList, setInactiveUsersList] = useState([]);
  const [isCollectorsModalOpen, setIsCollectorsModalOpen] = useState(false);
  const [collectorsList, setCollectorsList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, "ambulant_collector"));
        const collectorsCount = querySnapshot.size;
        setTotalCollectors(collectorsCount);
        const collectorsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCollectorsData(collectorsData);
      } catch (error) {
        console.error("Error fetching collectors:", error);
      }
    };

    fetchCollectors();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, "admin_users"));
        const allUsers = querySnapshot.docs.map((doc) => doc.data());
        const validUsers = allUsers.filter((user) => user.email && user.firstName && user.lastName);
        setTotalUsers(validUsers.length);

        const activeUsersCount = validUsers.filter((user) => user.status?.toLowerCase() === "active").length;
        setActiveUsers(activeUsersCount);

        const inactiveUsersCount = validUsers.filter((user) => user.status?.toLowerCase() === "inactive").length;
        setInactiveUsers(inactiveUsersCount);

        setRecentUsers(validUsers.slice(-5));

        const loggedInUserData = JSON.parse(localStorage.getItem("userData"));
        if (loggedInUserData) {
          const currentUser = allUsers.find((user) => user.email === loggedInUserData.email);
          setLoggedInUser(currentUser || loggedInUserData);
        }

        setTotalUsersList(validUsers);
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

  const handleStatBoxClick = async () => {
    try {
      const querySnapshot = await getDocs(query(collection(rentmobileDb, "admin_users"), where("status", "==", "Active")));
      const activeUsers = querySnapshot.docs.map((doc) => doc.data());
      setActiveUsersList(activeUsers);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching active users:", error);
    }
  };

  const handleTotalUsersStatBoxClick = async () => {
    try {
      const querySnapshot = await getDocs(collection(rentmobileDb, "admin_users"));
      const allUsers = querySnapshot.docs.map((doc) => doc.data());
      setTotalUsersList(allUsers);
      setIsTotalUsersModalOpen(true);
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  };

  const handleInactiveUsersStatBoxClick = async () => {
    try {
      const querySnapshot = await getDocs(query(collection(rentmobileDb, "admin_users"), where("status", "==", "Inactive")));
      const inactiveUsers = querySnapshot.docs.map((doc) => doc.data());
      setInactiveUsersList(inactiveUsers);
      setIsInactiveUsersModalOpen(true);
    } catch (error) {
      console.error("Error fetching inactive users:", error);
    }
  };

  const handleCollectorsStatBoxClick = async () => {
    try {
      const querySnapshot = await getDocs(collection(rentmobileDb, "ambulant_collector"));
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
        <IntSidenav isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} loggedInUser={loggedInUser} />
      </div>
      <MainContent isSidebarOpen={isSidebarOpen} onClick={handleMainContentClick}>
        <AppBar>
          <Title>
            <Logo src={CarbonLogo} alt="Carbon Logo" />
            <div>Dashboard</div>
          </Title>
        </AppBar>
        <br></br>
        <br></br>
        <StatsContainer>
          <StatBox bgColor="#5c6bc0" onClick={handleTotalUsersStatBoxClick}>
            <h3>Total Users</h3>
            <p>{totalUsers}</p>
            <FaUsers style={{ fontSize: "2rem", opacity: 0.7 }} />
          </StatBox>
          <StatBox bgColor="#42a5f5" onClick={handleStatBoxClick}>
            <h3>Active Users</h3>
            <p>{activeUsers}</p>
            <FaUser style={{ fontSize: "2rem", opacity: 0.7 }} />
          </StatBox>
          <StatBox bgColor="#66bb6a" onClick={handleInactiveUsersStatBoxClick}>
            <h3>Inactive Users</h3>
            <p>{inactiveUsers}</p>
            <FaUserSlash style={{ fontSize: "2rem", opacity: 0.7 }} />
          </StatBox>
          <StatBox bgColor="#ffa726" onClick={handleCollectorsStatBoxClick}>
            <h3>Total Collectors</h3>
            <p>{totalCollectors}</p>
            <FaWallet style={{ fontSize: "2rem", opacity: 0.7 }} />
          </StatBox>
        </StatsContainer>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "2rem" }}>
          <PieChartContainer>
            <PieChartComponent />
          </PieChartContainer>
          <VendorLocationAnalytics />
        </div>
        <GraphContainer>
          <Graph />
        </GraphContainer>
        <LoginAnalytics />
        <RecentlyRegistered recentUsers={recentUsers} />
        <CollectorTableContainer>
          <h3>Collector Users</h3>
          <table>
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
          </table>
        </CollectorTableContainer>
      </MainContent>
      {isModalOpen && <ActiveModal users={activeUsersList} onClose={() => setIsModalOpen(false)} />}
      {isTotalUsersModalOpen && <TotalUsersModal users={totalUsersList} onClose={() => setIsTotalUsersModalOpen(false)} />}
      {isInactiveUsersModalOpen && <InactiveUsersModal users={inactiveUsersList} onClose={() => setIsInactiveUsersModalOpen(false)} />}
      {isCollectorsModalOpen && <CollectorsModal collectors={collectorsList} onClose={() => setIsCollectorsModalOpen(false)} />}
    </DashboardContainer>
  );
};

export default Dashboard;
