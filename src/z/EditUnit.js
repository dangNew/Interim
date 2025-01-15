import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faPlus, faUsers, faClipboard } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { interimDb } from '../components/firebase.config'; // Import the correct firestore instance
import IntSidenav from './IntSidenav';


const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
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
  padding-left: 10px;
  background-color: #fff;
  padding: 2rem;
  width: calc(100% - ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')});
  transition: margin-left 0.3s ease, width 0.3s ease;
  overflow-y: auto;
`;
const AppBar = styled.div`
  display: left;
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



const EditUnit = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [units, setUnits] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
