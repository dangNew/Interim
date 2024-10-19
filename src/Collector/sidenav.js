import React, { useState, useEffect, useRef } from 'react';
import { Link,  useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt,FaUserSlash, FaUser, FaUsers, FaWallet, FaList} from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faCheck} from '@fortawesome/free-solid-svg-icons';
import { faClipboard } from '@fortawesome/free-regular-svg-icons'; 
import { interimDb } from '../components/firebase.config';
import { rentmobileDb } from '../components/firebase.config';

import { collection, getDocs } from 'firebase/firestore';
import LoginAnalytics from '../Interim/LoginAnalytics';



const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  border: 1px solid #ddd;  /* ADD THIS */
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow-y: auto; 
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
  justify-content: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
  padding: 10px;
  margin-bottom: 10px;
  margin-top: -10px;
  border-radius: 8px;
  font-size: 14px;
  color: ${({ active }) => (active ? 'white' : '#333')};
  background-color: ${({ active }) => (active ? '#007bff' : 'transparent')};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#007bff' : '#f1f3f5')};
  }

  .icon {
    font-size: 1rem;  /* Increase the icon size */
    color: #000;
    transition: margin-left 0.2s ease;
  }

  span:last-child {
    margin-left: 10px;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'inline' : 'none')};
  }
`;


const SidebarFooter = styled.div`
  padding: 10px;
  margin-top: auto; /* Pushes the footer to the bottom */
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
`;

const LogoutButton = styled(SidebarItem)`
  margin-top: 5px; /* Add some margin */
  background-color: #dc3545; /* Bootstrap danger color */
  color: white;
  align-items: center;
  margin-left: 20px;
  padding: 5px 15px; /* Add padding for a better button size */
  border-radius: 5px; /* Rounded corners */
  font-weight: bold; /* Make text bold */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
  transition: background-color 0.3s ease, transform 0.2s ease; /* Smooth transitions */

  &:hover {
    background-color: #c82333; /* Darker red on hover */
    transform: scale(1.05); /* Slightly scale up on hover */
  }
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

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '70px')};
  padding-left: 40px;
  background-color: #fff;
  padding: 2rem;
  width: 100%;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
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
    color: #6c757d; // Subtle color for icon
  }

  .profile-name {
    font-size: 1.2rem;
    font-weight: 700; // Bolder text
    color: black; // Darker gray for a professional look
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
  }

  hr {
    width: 100%;
    border: 0.5px solid #ccc;
    margin-top: 15px;
  }

  .profile-position {
    font-size: 1rem; /* Increase the font size */
    font-weight: 600; /* Make it bold */
    color: #007bff; /* Change color to blue for better visibility */
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
    margin-top: 5px; /* Add some margin for spacing */
  }
`;


const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px; /* Adjusted for better visibility */
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // Subtle shadow for a polished look
`;


const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background-color: ${({ bgColor }) => bgColor || '#f4f4f4'};
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #ddd;  /* ADD THIS */
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

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;  /* ADD THIS */
  border-radius: 15px;
  background-color: #f8f9fa;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
    font-size: 16px; /* Adjusted for headings */
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px; /* ADD THIS */
    border: 1px solid #ddd;  /* ADD THIS */

    th, td {
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

const AppBar = styled.div`
  padding-top: 0;
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



const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 20px;
  margin-bottom: 20px;
  margin-top: -25px;
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex' : 'none')};
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

  th, td {
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, 'ambulant_collector'));
        const collectorsCount = querySnapshot.size; 
        console.log('Number of collectors fetched:', collectorsCount); 

        setTotalCollectors(collectorsCount);
        
        // Set the collectors data in the state
        const collectorsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched Collectors Data:', collectorsData);
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

  const handleClickOutside = (event) => {
   
  };
  

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(interimDb, 'users'));
        const allUsers = querySnapshot.docs.map(doc => doc.data());

        console.log('Fetched Users:', allUsers); 
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


  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  
    
  return (


    <DashboardContainer>
        <Sidebar ref={sidebarRef} isSidebarOpen={isSidebarOpen}>
        <Link to="/profile" style={{ textDecoration: 'none' }}>
        <ProfileHeader isSidebarOpen={isSidebarOpen}>
          {loggedInUser && loggedInUser.Image ? (
            <ProfileImage src={loggedInUser.Image} alt={`${loggedInUser.firstName} ${loggedInUser.lastName}`} />
          ) : (
            <FaUserCircle className="profile-icon" />
          )}
          <span className="profile-name">{loggedInUser ? `${loggedInUser.firstName} ${loggedInUser.lastName}` : 'Guest'}</span>
          
          <span className="profile-email" style={{ fontSize: '0.9rem', color: '#6c757d', display: isSidebarOpen ? 'block' : 'none' }}>
            {loggedInUser ? loggedInUser.email : ''}
          </span>
          
          {/* Add position below the email */}
          <span className="profile-position" style={{ fontSize: '0.9rem', color: '#6c757d', display: isSidebarOpen ? 'block' : 'none' }}>
            {loggedInUser ? loggedInUser.position : ''}
          </span>
        </ProfileHeader>
      </Link>


        <SearchBarContainer isSidebarOpen={isSidebarOpen}>
          <FaSearch />
          <SearchInput type="text" placeholder="Search..." />
        </SearchBarContainer>
        
        <SidebarMenu>
  <Link to="/sidenav" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faHome} className="icon" />
      <span>Dashboard</span>
    </SidebarItem>
  </Link>
  
  <Link to="/list-of-stallholders" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faShoppingCart} className="icon" />
      <span>List of Vendors</span>
    </SidebarItem>
  </Link>
  <Link to="/stalls" style={{ textDecoration: 'none' }}>
  <SidebarItem isSidebarOpen={isSidebarOpen}>
    <FontAwesomeIcon icon={faClipboard} className="icon" />
    <span>List of Stalls</span>
  </SidebarItem>
</Link>

 
</SidebarMenu>

      <SidebarFooter isSidebarOpen={isSidebarOpen}>
          <LogoutButton isSidebarOpen={isSidebarOpen} onClick={handleLogout}>
            <span><FaSignOutAlt /></span>
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>


        <MainContent isSidebarOpen={isSidebarOpen}>
        
          <ToggleButton onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          
        
          <AppBar>
        <div className="title">INTERIM</div>
      </AppBar>
         
          <br></br>
          <LoginAnalytics /> 

          <StatsContainer>
      <StatBox bgColor="#11768C">
        <h3>Total Users</h3>
        <p>{totalUsers}</p> {/* Display the total user count */}
        <div className="icon-container">
          <FaUsers className="fading-icon" style={{ 
            fontSize: '30px', 
            opacity: 0.5, 
            animation: 'fade 2s infinite alternate' 
          }} />
        </div>
      </StatBox>
    
      <StatBox bgColor="#11768C">
        <h3>Active Users</h3>
        <p>{activeUsers}</p> {/* Display the total user count */}
        <div className="icon-container">
          <FaUser className="fading-icon" style={{ 
            fontSize: '30px', 
            opacity: 0.5, 
            animation: 'fade 2s infinite alternate' 
          }} />
        </div>
      </StatBox>

      <StatBox bgColor="#11768C">
  <h3>Inactive Users</h3> 
  <p>{inactiveUsers}</p> {/* Display the total user count */} 
  <div className="icon-container">
    <FaUserSlash className="fading-icon" style={{ 
      fontSize: '30px', 
      opacity: 0.5, 
      animation: 'fade 2s infinite alternate' 
    }} />
  </div>
</StatBox>
<StatBox bgColor="#007bff">
  <h3>Total Collectors</h3>
  <p>{totalCollectors}</p>
  <div className="icon-container">
    <FaWallet className="fading-icon" style={{ 
      fontSize: '30px', 
      opacity: 0.5, 
      animation: 'fade 2s infinite alternate' 
    }} />
  </div>
</StatBox>

</StatsContainer>
        

        {/* Recently Registered Users Section */}
        {/* Recently Registered Users Section */}
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
          <td>{user.email || ''}</td>
          <td>{user.firstName || ''}</td>
          <td>{user.lastName || ''}</td>
          <td>{user.contactNum || ''}</td>
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
          <tr key={collector.id}> {/* Ensure you have a unique identifier for each collector */}
            <td>{collector.email}</td> {/* Make sure to display email if required */}
            <td>{collector.firstName + ' ' + collector.lastName}</td> {/* Concatenate firstName and lastName */}
            <td>{collector.address}</td>
            <td>{collector.collector}</td>
            <td>{collector.location}</td>
            <td>{collector.contactNum}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="6">No collectors found.</td> {/* Adjusted colSpan to match the number of columns */}
        </tr>
      )}
    </tbody>
  </CollectorTable>
</CollectorTableContainer>
      </MainContent>
      </DashboardContainer>
  );
};
export default Dashboard;