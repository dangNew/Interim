import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faCheck } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { interimDb } from '../components/firebase.config'; // Import the correct firestore instance

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;  /* ADD THIS */
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow: hidden;
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
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
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
  background-color: #188423; /* Updated color */
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: 'Inter', sans-serif; /* Use a professional font */
  font-weight: bold; /* Apply bold weight */
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

const Container = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 20px;
  background-color: #d4edda;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
    color: #155724;
  }

  .unit-card {
    padding: 1rem;
    margin: 1rem 0;
    border: 1px solid #c3e6cb;
    border-radius: 10px;
    background-color: white;
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
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex' : 'none')};
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
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

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px; /* Adjusted for better visibility */
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // Subtle shadow for a polished look
`;
const AddUnitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem; /* Adjust padding for button size */
  font-size: 1.5rem; /* Increase font size */
  color: white;
  background-color: #0047AB; /* Bootstrap primary color */
  border: none;
  border-radius: 5px; /* More rounded corners */
  cursor: pointer;
  margin-bottom: 20px; /* Space below the button */
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3); /* Subtle shadow with blue tone */
  transition: background-color 0.3s ease, transform 0.2s ease; /* Added transform for a slight scale effect */

  &:hover {
    background-color: #0056b3; /* Darker shade on hover */
    transform: translateY(-2px); /* Slightly lift the button on hover */
  }

  .plus-icon {
    margin-right: 10px; /* Space between icon and text */
    font-size: 1.5rem; /* Adjust icon size for better visibility */
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [units, setUnits] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const fetchUnits = async () => {
    try {
      const unitsCollection = collection(interimDb, 'unit');
      const unitsSnapshot = await getDocs(unitsCollection);
      const unitsList = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Fetched units:', unitsList); // Add this line
      setUnits(unitsList);
    } catch (error) {
      console.error('Error fetching units: ', error);
    }
  };
  

  useEffect(() => {
    const checkAndCreateCollection = async () => {
      const unitsCollection = collection(interimDb, 'unit');
      const unitsSnapshot = await getDocs(unitsCollection);
  
      // If the collection doesn't exist (no documents in it), create a default document
      if (unitsSnapshot.empty) {
        try {
          await addDoc(unitsCollection, {
            name: 'Default Unit',
            location: 'Default Location',
            dateRegistered: new Date().toISOString().split('T')[0],
          });
          console.log('Default collection created with a default unit.');
        } catch (error) {
          console.error('Error creating default collection: ', error);
        }
      }
      // Fetch units after checking/creating the collection
      fetchUnits();
    };
  
    const fetchUserData = async () => {
      const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
      if (loggedInUserData) {
        const usersCollection = collection(interimDb, 'users');
        const userDocs = await getDocs(usersCollection);
        const users = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
        const currentUser = users.find(user => user.email === loggedInUserData.email);
        setLoggedInUser(currentUser || loggedInUserData);
      }
    };
  
    checkAndCreateCollection(); // Check and create collection on component mount
    fetchUserData(); // Fetch user data
  }, []);
  
  const handleClickOutside = (event) => {
    
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown

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
  <Link to="/dashboard" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faHome} className="icon" />
      <span>Dashboard</span>
    </SidebarItem>
  </Link>
  
  <Link to="/list" style={{ textDecoration: 'none' }}>
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

  <SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleDropdownToggle}>
    <FontAwesomeIcon icon={faUser} className="icon" />
    <span>User Management</span>
  </SidebarItem>

  {isDropdownOpen && (
    <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
      <Link to="/usermanagement" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faSearch} className="icon" />
            <span>View Users</span>
          </SidebarItem>
        </li>
      </Link>
      <Link to="/newuser" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faPlus} className="icon" />
            <span>Add User</span>
          </SidebarItem>
        </li>
      </Link>
    </ul>
  )}

  <Link to="/viewunit" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faPlus} className="icon" />
      <span>Add New Unit</span>
    </SidebarItem>
  </Link>

  <Link to="/manage-roles" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faUsers} className="icon" />
      <span>Manage Roles</span>
    </SidebarItem>
  </Link>

  <Link to="/contract" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faFileContract} className="icon" />
      <span>Contract</span>
    </SidebarItem>
  </Link>

  <Link to="/ticket" style={{ textDecoration: 'none' }}>
  <SidebarItem isSidebarOpen={isSidebarOpen}>
    <FontAwesomeIcon icon={faTicketAlt} className="icon" />
    <span>Manage Ticket</span>
  </SidebarItem>
</Link>

<SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleDropdownToggle}>
    <FontAwesomeIcon icon={faUser} className="icon" />
    <span>Manage Ambulant</span>
  </SidebarItem>

  {isDropdownOpen && (
    <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
      <Link to="/assign" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faCheck} className="icon" />
            <span> Assign Collector</span>
          </SidebarItem>
        </li>
      </Link>
      <Link to="/View" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
          <FontAwesomeIcon icon={faSearch} className="icon" />
            <span> View Collector</span>
          </SidebarItem>
        </li>
      </Link>
      <Link to="/addcollector" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faPlus} className="icon" />
            <span>Add Ambulant Collector</span>
          </SidebarItem>
        </li>
      </Link>
    </ul>
  )}
</SidebarMenu>

      <SidebarFooter isSidebarOpen={isSidebarOpen}>
          <LogoutButton isSidebarOpen={isSidebarOpen} onClick={handleLogout}>
            <span><FaSignOutAlt /></span>
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
        <br></br>

        <ToggleButton isSidebarOpen={isSidebarOpen} onClick={toggleSidebar}>
          <FaBars />
        </ToggleButton>

         {/* Add the new button here */}
         <AddUnitButton onClick={() => navigate('/addunit')}>
          <FontAwesomeIcon icon={faPlus} className="plus-icon" />
          Add New Unit
        </AddUnitButton>

        <Container>
    <h3>Units</h3>
    {units.map((unit) => (
        <div key={unit.id} className="unit-card">
        <h4>{unit.name}</h4>
        <p>Location: {unit.location}</p>
        <p>Date Registered: {unit.dateRegistered}</p>
        </div>
    ))}
    </Container>

        


      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
