import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faPlus, faUsers, faClipboard } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
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

const EditUnit = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [units, setUnits] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event) => {
    // Logic to handle clicks outside the sidebar (optional)
  };
  const handleDeleteUnit = (unitId) => {
    // Your logic to delete a unit goes here
    console.log(`Deleting unit with ID: ${unitId}`);
    // Example: call your Firestore function to delete the unit
};

const handleViewUnit = (unitId) => {
    // Your logic to view a unit goes here
    console.log(`Viewing unit with ID: ${unitId}`);
    // Example: redirect or open a modal to display unit details
};

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData'); 
    navigate('/login');
  };

  const fetchUnits = async () => {
    const unitsCollection = collection(interimDb, 'units');
    const unitsSnapshot = await getDocs(unitsCollection);
    const unitsList = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUnits(unitsList);
  };

  useEffect(() => {
    fetchUnits();
    const userData = JSON.parse(localStorage.getItem('userData'));
    setLoggedInUser(userData);
  }, []);

  return (
    <DashboardContainer>
      <Sidebar isSidebarOpen={isSidebarOpen}>
        <ToggleButton onClick={toggleSidebar}>
          <FaBars />
        </ToggleButton>
        <SidebarMenu>
          <SidebarItem active>
            <FontAwesomeIcon icon={faHome} className="icon" />
            <span>Dashboard</span>
          </SidebarItem>
          <SidebarItem>
            <FontAwesomeIcon icon={faShoppingCart} className="icon" />
            <span>Units</span>
          </SidebarItem>
          <SidebarItem>
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span>Users</span>
          </SidebarItem>
          <SidebarItem>
            <FontAwesomeIcon icon={faUsers} className="icon" />
            <span>Vendors</span>
          </SidebarItem>
          <SidebarItem>
            <FontAwesomeIcon icon={faClipboard} className="icon" />
            <span>Contracts</span>
          </SidebarItem>
        </SidebarMenu>
        <SidebarFooter isSidebarOpen={isSidebarOpen}>
          <LogoutButton onClick={handleLogout}>
            <FontAwesomeIcon icon={FaSignOutAlt} className="icon" />
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <h2>Edit Unit</h2>
          <ProfileHeader isSidebarOpen={isSidebarOpen}>
            <ProfileImage src={loggedInUser?.image || '/defaultProfileImage.png'} alt="Profile" />
            <span className="profile-name">{loggedInUser?.fullName}</span>
            <span className="profile-position">{loggedInUser?.position}</span>
            <hr />
          </ProfileHeader>
        </AppBar>
        <SearchBarContainer isSidebarOpen={isSidebarOpen}>
          <FaSearch />
          <SearchInput type="text" placeholder="Search Units..." />
        </SearchBarContainer>
        <Container>
          {units.map(unit => (
            <div className="unit-card" key={unit.id}>
              <h3>{unit.name}</h3>
              <p>Rate: {unit.rate}</p>
              <div>
                <Link to={`/editUnit/${unit.id}`}>
                  <FontAwesomeIcon icon={FaEdit} />
                </Link>
                <FontAwesomeIcon icon={FaTrash} onClick={() => handleDeleteUnit(unit.id)} />
                <FontAwesomeIcon icon={FaEye} onClick={() => handleViewUnit(unit.id)} />
              </div>
            </div>
          ))}
        </Container>
      </MainContent>
    </DashboardContainer>
  );
};

export default EditUnit;
