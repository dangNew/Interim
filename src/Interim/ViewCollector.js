import React, { useState, useEffect, useRef } from 'react';
import { Link,  useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt,FaUsers, FaWallet, FaEye,FaPen, FaTrash } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faCheck, faClipboard,faPlusCircle, faCogs} from '@fortawesome/free-solid-svg-icons';
import { rentmobileDb } from '../components/firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import IntSidenav from './IntSidenav';


const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  padding-left: 10px;
  background-color: #fff;
  padding: 2rem;
  width: calc(100% - ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')});
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
  font-family: 'Inter', sans-serif; /* Use a professional font */
  font-weight: bold; /* Apply bold weight */
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

 .actions {
      display: flex;
      gap: 15px; /* Space between the icons */
    }

    .icon {
      font-size: 24px; /* Increase icon size */
      color: black;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #0056b3; /* Darken on hover */
      }
    }
  }
`;


const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCollectors] = useState(0);
  const [collectorsData, setCollectorsData] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    userManagement: false,
    addUnit: false,
    appraise: false,
    contract: false,
    ticket: false,
    manageZone: false,
    manageSpace: false,
  });
  const navigate = useNavigate();


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen(prevState => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMainContentClick = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, 'ambulant_collector'));
        const allCollectors = querySnapshot.docs.map(doc => doc.data());
        
        // Filter only those with necessary fields and combine firstName + lastName
        const validCollectors = allCollectors.map(collector => ({
          email: collector.email,
          collector: collector.collector,
          fullName: `${collector.firstName} ${collector.lastName}`,
          location: collector.location,
          status: collector.status,
        }));

        setCollectorsData(validCollectors);
      } catch (error) {
        console.error('Error fetching collectors:', error);
      }
    };

    fetchCollectors();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, 'ambulant_collector'));
        const allUsers = querySnapshot.docs.map(doc => doc.data());

        console.log('Fetched Users:', allUsers); 
        const validUsers = allUsers.filter(user => user.email && user.firstName && user.lastName);
        setTotalUsers(validUsers.length);
        
     

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


  
  const handleEditClick = (collectorId) => {
    // Your edit logic here, for example:
    console.log("Edit clicked for collector:", collectorId);
    // You can navigate to an edit page or open a modal, depending on your requirements
  };
  
  const handleDeleteClick = (collectorId) => {
    // Your delete logic here, for example:
    console.log("Delete clicked for collector:", collectorId);
    // You can trigger a delete action with Firestore or a confirmation modal
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
      <MainContent isSidebarOpen={isSidebarOpen} onClick={handleMainContentClick}>
        <AppBar>
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>

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
        

<FormContainer>
  <h3>Collectors Data</h3>
  <table>
    <thead>
      <tr>
        <th>Email</th>
        <th>Collector No.</th>
        <th>Full Name</th>
        <th>Location</th>
        <th>Status</th>
        <th>Actions</th> {/* New column for actions */}
      </tr>
    </thead>
    <tbody>
      {collectorsData.map((collector, index) => (
        <tr key={index}>
          <td>{collector.email}</td>
          <td>{collector.collector}</td>
          <td>{collector.fullName}</td>
          <td>{collector.location}</td>
          <td>{collector.status}</td>
          <td className="actions"> {/* Adding actions column */}
            <FaEye className="icon" title="View" />
            <FaPen className="icon" title="Edit" onClick={() => handleEditClick(collector.id)} />
            <FaTrash className="icon" title="Delete" onClick={() => handleDeleteClick(collector)} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</FormContainer>

      </MainContent>
      </DashboardContainer>
  );
};
export default Dashboard;