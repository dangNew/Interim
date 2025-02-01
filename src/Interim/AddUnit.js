import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faCheck, faPlusCircle, faCogs } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { interimDb, rentmobileDb } from '../components/firebase.config'; // Import the correct firestore instance
import IntSidenav from './IntSidenav';
import CarbonLogo from '../CarbonLogo/472647195_1684223168803549_1271657271156175542_n.jpg';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
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
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
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
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
    margin-top: 5px;
  }
`;

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 3rem;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'Roboto', sans-serif;

  h3 {
    margin-bottom: 2rem;
    color: #343a40;
    font-size: 26px;
    font-weight: 700;
    text-align: center;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    th {
      background-color: #f8f9fa;
      font-weight: 700;
      color: #495057;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    tr:hover {
      background-color: #e9ecef;
      transition: background-color 0.3s ease;
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
  display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex' : 'none')};
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
`;


const InputField = styled.div`
  position: relative;
  margin-bottom: 1.5rem;

  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    color: #495057;
    transition: border-color 0.3s ease;

    &:focus {
      border-color: #188423;
      outline: none;
    }
  }

  label {
    position: absolute;
    top: -10px;
    left: 12px;
    background-color: #ffffff;
    color: #6c757d;
    font-size: 14px;
    padding: 0 5px;
    transition: all 0.3s ease;
    font-family: 'Roboto', sans-serif;
  }
`;

const SaveButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background-color: #218838;
  }
`;
const ToggleButton = styled.div`
  display: \\${({ isSidebarOpen }) => (isSidebarOpen ? 'none' : 'block')};
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
  const [unitName, setUnitName] = useState('');
  const [location, setLocation] = useState('');
  const [dateRegistered, setDateRegistered] = useState(new Date().toISOString().split('T')[0]);
  
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
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen(prevState => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };
  

  const handleSaveUnit = async () => {
    if (!unitName.trim() || !location.trim() || !dateRegistered) {
      alert('Please fill in all fields before saving.');
      return;
    }
    try {
      console.log('Saving unit with data:', {
        name: unitName,
        location: location,
        dateRegistered: dateRegistered,
      });

      const docRef = await addDoc(collection(rentmobileDb, 'unit'), {
        name: unitName,
        location: location,
        dateRegistered: dateRegistered,
      });

      console.log('Document written with ID: ', docRef.id);
      alert('Unit saved successfully!');

      setUnitName('');
      setLocation('');
      setDateRegistered(new Date().toISOString().split('T')[0]);
    } catch (e) {
      console.error('Error adding document: ', e);
      alert('Error saving unit: ' + e.message);
    }
  };

  useEffect(() => {
    const checkAndCreateCollection = async () => {
      const unitsCollection = collection(rentmobileDb, 'unit');
      const unitsSnapshot = await getDocs(unitsCollection);

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

    checkAndCreateCollection();
    fetchUserData();
  }, []);

  
  

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
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
                  <Title>
                    <Logo src={CarbonLogo} alt="Carbon Logo" />
                    <div>Add Unit</div>
                  </Title>
                </AppBar>
        
        <FormContainer>
          <h3>Add Unit</h3>

          <InputField>
            <input
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              placeholder=" "
              required
            />
            <label>Unit Name</label>
          </InputField>

          <InputField>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder=" "
              required
            />
            <label>Location</label>
          </InputField>

          <InputField>
            <input
              type="date"
              value={dateRegistered}
              onChange={(e) => setDateRegistered(e.target.value)}
              required
            />
            <label>Date Registered</label>
          </InputField>

          <SaveButton onClick={handleSaveUnit}>Save Unit</SaveButton>
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
