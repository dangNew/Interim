import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars } from 'react-icons/fa';
import { faHome, faShoppingCart, faUserCircle, faCog } from '@fortawesome/free-solid-svg-icons'; 
import { interimDb, rentmobileDb } from '../components/firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import SideNav from './side_nav'; // Import the SideNav component

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '70px')};
  padding-left: 40px;
  background-color: #fff;
  padding: 2rem;
  width: 100%;
  transition: margin-left 0.3s ease;
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
  font-family: 'Inter', sans-serif; /* Use a professional font */
  font-weight: bold; /* Apply bold weight */
`;

const ToggleButton = styled.div`
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'none' : 'block')};
  position: absolute;
  top: 5px;
  left: 15px;
  font-size: 1.8rem;
  color: #333;
  cursor: pointer;
  z-index: 200;
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, 'ambulant_collector'));
        const collectorsCount = querySnapshot.size;
        setTotalCollectors(collectorsCount);

        const collectorsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCollectorsData(collectorsData);
      } catch (error) {
        console.error('Error fetching collectors:', error);
      }
    };

    fetchCollectors();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(interimDb, 'users'));
        const allUsers = querySnapshot.docs.map(doc => doc.data());
        const validUsers = allUsers.filter(user => user.email && user.firstName && user.lastName);
        setTotalUsers(validUsers.length);

        const activeUsersCount = validUsers.filter(user => user.status?.toLowerCase() === 'active').length;
        setActiveUsers(activeUsersCount);

        const inactiveUsersCount = validUsers.filter(user => user.status?.toLowerCase() === 'inactive').length;
        setInactiveUsers(inactiveUsersCount);
        setRecentUsers(validUsers.slice(-5));

        const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
        if (loggedInUserData) {
          const currentUser = allUsers.find(user => user.email === loggedInUserData.email);
          setLoggedInUser(currentUser || loggedInUserData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  return (
    <DashboardContainer>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} /> {/* Include SideNav here */}
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <h1>Dashboard</h1>
          <div>
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
        </AppBar>
        {/* Main content here */}
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
