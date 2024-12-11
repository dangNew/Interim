import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTh,
  FaBars,
  FaUserAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaSearch,
  FaCog,
} from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard, faMoneyBillTrendUp, faPeopleRoof } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

// Styled components for the sidebar
const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const Header = styled.div`
  background-color: #188423;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  height: 60px;
  width: 100%;
  z-index: 1000;
  position: fixed;
  top: 0;
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`;

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '260px' : '80px')};
  background-color: #ffffff;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: width 0.3s ease;
  position: fixed;
  height: calc(100vh - 10px);
  z-index: 100;
  overflow-y: auto;
  top: 0;
`;

const ContentContainer = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '250px' : '70px')};
  padding: 1rem;
  margin-top: 60px;
  overflow-y: auto;
  width: calc(100% - ${({ isSidebarOpen }) => (isSidebarOpen ? '250px' : '70px')});
  height: calc(100vh - 60px);
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
  padding: 12px;
  border-radius: 8px;
  color: ${({ active }) => (active ? '#188423' : '#333333')};
  background-color: ${({ active }) => (active ? '#f4f4f4' : 'transparent')};
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 8px;

  &:hover {
    background-color: #f4f4f4;
    color: #188423;
  }

  .icon {
    font-size: 1.2rem;
  }

  span {
    font-size: 1rem;
    margin-left: 10px;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'inline' : 'none')};
  }
`;

const SidebarFooter = styled.div`
  padding: 10px;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
`;

const ToggleButton = styled.div`
  font-size: 1.5rem;
  color: #333333;
  cursor: pointer;
  margin-bottom: 1rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333333;
  margin-bottom: 20px;

  .profile-icon {
    font-size: 2.5rem;
    margin-bottom: 8px;
  }

  .profile-name {
    font-weight: bold;
    font-size: 1.1rem;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
    color: #333333;
  }
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 8px;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f4f4f4;
  border-radius: 5px;
  padding: 5px;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  padding: 5px;
  width: 100%;
  font-size: 1rem;
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

const SideHead = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
    console.log('User logged out. Redirecting to login...');
  };

  // Fetch user data from localStorage
  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
          setLoggedInUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <DashboardContainer>
      <Sidebar isSidebarOpen={isSidebarOpen}>
        <ToggleButton onClick={toggleSidebar}>
          <FaBars />
        </ToggleButton>
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <ProfileHeader isSidebarOpen={isSidebarOpen} onClick={() => navigate('/profile')}>
            {loggedInUser && loggedInUser.Image ? (
              <ProfileImage src={loggedInUser.Image} alt={`${loggedInUser.firstName} ${loggedInUser.lastName}`} />
            ) : (
              <FaUserCircle className="profile-icon" />
            )}
            <span className="profile-name">{loggedInUser ? `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}` : 'Guest'}</span>
            <span className="profile-email" style={{ fontSize: '0.9rem', color: '#6c757d', display: isSidebarOpen ? 'block' : 'none' }}>
              {loggedInUser ? loggedInUser.email : ''}
            </span>
            <span className="profile-position" style={{ fontSize: '0.9rem', color: '#6c757d', display: isSidebarOpen ? 'block' : 'none' }}>
              {loggedInUser ? `${loggedInUser.position} - ${loggedInUser.location}` : ''}
            </span>
          </ProfileHeader>
        </Link>
        <SearchBarContainer isSidebarOpen={isSidebarOpen}>
          <FaSearch />
          <SearchInput type="text" placeholder="Search..." />
        </SearchBarContainer>
        <SidebarMenu>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <SidebarItem active={window.location.pathname === '/dashboard'} isSidebarOpen={isSidebarOpen}>
              <FaTh className="icon" />
              <span>Dashboard</span>
            </SidebarItem>
          </Link>
          <Link to="/ambulantHistory" style={{ textDecoration: 'none' }}>
            <SidebarItem active={window.location.pathname === '/ambulantHistory'} isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faIdCard} className="icon"/>
              <span>Ambulant Vendor</span>
            </SidebarItem>
          </Link>
          <Link to="/stallHistory" style={{ textDecoration: 'none' }}>
            <SidebarItem active={window.location.pathname === '/stallHistory'} isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faMoneyBillTrendUp} className="icon"/>
              <span>Stall Holder Vendor</span>
            </SidebarItem>
          </Link>
          <Link to="/historyAppraisal" style={{ textDecoration: 'none' }}>
            <SidebarItem active={window.location.pathname === '/historyAppraisal'} isSidebarOpen={isSidebarOpen}>
              <FaUserAlt className="icon" />
              <span>Appraisals</span>
            </SidebarItem>
          </Link>
          <Link to="/listViolators" style={{ textDecoration: 'none' }}>
            <SidebarItem active={window.location.pathname === '/listViolators'} isSidebarOpen={isSidebarOpen}>
              <FontAwesomeIcon icon={faPeopleRoof} className="icon" />
              <span>List of Violators</span>
            </SidebarItem>
          </Link>
          <Link to="/collector" style={{ textDecoration: 'none' }}>
            <SidebarItem active={window.location.pathname === '/collector'} isSidebarOpen={isSidebarOpen}>
              <FaUserAlt className="icon" />
              <span>Collector List</span>
            </SidebarItem>
          </Link>
          {/* <Link to="/settings" style={{ textDecoration: 'none' }}>
            <SidebarItem active={window.location.pathname === '/settings'} isSidebarOpen={isSidebarOpen}>
              <FaCog className="icon" />
              <span>Settings</span>
            </SidebarItem>
          </Link> */}
          <Link to="/market-violation" style={{ textDecoration: 'none' }}>
            <SidebarItem active={window.location.pathname === '/market-violation'} isSidebarOpen={isSidebarOpen}>
              <FaCog className="icon" />
              <span>Market Violation</span>
            </SidebarItem>
          </Link>
        </SidebarMenu>
        <SidebarFooter isSidebarOpen={isSidebarOpen}>
          <LogoutButton onClick={handleLogout} isSidebarOpen={isSidebarOpen}>
            <FaSignOutAlt className="icon" />
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>
      <ContentContainer isSidebarOpen={isSidebarOpen}>
        <Header>
          <HeaderTitle>City Treasurer's Office</HeaderTitle>
        </Header>
        {children}
      </ContentContainer>
    </DashboardContainer>
  );
};

export default SideHead;
