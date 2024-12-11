import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faCheck, faPlusCircle,faCogs} from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, addDoc, setDoc, doc, query, orderBy, limit } from 'firebase/firestore';

import { rentmobileDb } from '../components/firebase.config'; 
import { interimDb } from '../components/firebase.config'; 
import IntSidenav from './IntSidenav';

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

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 3rem; /* Spacious feel */
  border-radius: 12px; /* Softer border radius */
  background-color: #ffffff; /* White background */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Soft shadow */
  border: 1px solid #e0e0e0; /* Subtle border */
  max-width: 600px; /* Max width */
  margin-left: auto; /* Center align */
  margin-right: auto; /* Center align */
  font-family: 'Roboto', sans-serif; /* Consistent font */

  h3 {
    margin-bottom: 2rem; /* Increased margin */
    color: #343a40; /* Dark gray for the heading */
    font-size: 26px; /* Larger heading */
    font-weight: 700; /* Bold weight */
    text-align: center; /* Centered heading */
    border-bottom: 2px solid #e0e0e0; /* Underline */
    padding-bottom: 1rem; /* Space below heading */
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 15px; /* Standardized padding */
      text-align: left;
      border-bottom: 1px solid #e0e0e0; /* Subtle border */
    }

    th {
      background-color: #f8f9fa; /* Light gray header */
      font-weight: 700; /* Bold headers */
      color: #495057; /* Darker text */
    }

    tr:nth-child(even) {
      background-color: #f9f9f9; /* Alternating row colors */
    }

    tr:hover {
      background-color: #e9ecef; /* Highlight row on hover */
      transition: background-color 0.3s ease; /* Smooth transition */
    }
  }
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
    color: #000000; /* Changed to black */
    font-size: 16px;
    padding: 0 5px;
    transition: all 0.3s ease;
    font-family: 'Roboto', sans-serif;
  }
`;

const SaveButton = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;

  &:hover {
    background-color: #45a049;
  }
`;




const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
`;



const DropdownField = styled.select`
  position: relative;
  padding: 0.75rem;
  border: 1px solid #ced4da; 
  border-radius: 4px; 
  font-size: 16px;
  color: #495057; 
  background-color: #fdfdfd; /
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
  transition: border-color 0.2s ease, box-shadow 0.2s ease; 
  margin-top: 0.5rem; 
  width: 120%;

  &:focus {
    border-color: #007bff; /* Blue border on focus */
    outline: none; /* Remove outline */
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Glow effect */
  }

  option {
    color: #495057; /* Dark text color for options */
  }
`;
const StyledButton = styled.button`
  padding: 12px 24px; /* Padding for size */
  font-size: 16px; /* Font size */
  font-family: 'Roboto', sans-serif; /* Professional font */
  font-weight: bold;
  color: #ffffff; /* Text color */
  background-color:#008000;/* Primary color */
  border: 1px solid transparent; /* Transparent border */
  border-radius: 4px; /* Rounded corners */
  cursor: pointer; /* Pointer on hover */
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s; /* Smooth transition */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */

  /* Responsive font scaling */
  @media (max-width: 768px) {
    font-size: 14px; /* Slightly smaller font on smaller screens */
  }

  /* Hover effects */
  &:hover {
    background-color:#008000; /* Darker blue */
    transform: translateY(-1px); /* Lift effect */
  }

  &:active {
    transform: translateY(0); /* Reset lift on click */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* Shadow for active state */
  }
`;
const Modal = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
`;

const CloseButton = styled.span`
  cursor: pointer;
  color: red;
  font-size: 20px;
  float: right;
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
  
  
  const [zone, setZone] = useState("");
  const [size, setSize] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
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

  const handleSaveSpace = async () => {
    try {
      const zonesCollection = collection(rentmobileDb, 'zone');
      const zoneDocs = await getDocs(zonesCollection);

      // If the collection doesn't exist (i.e., no documents), you can proceed to add data
      if (zoneDocs.empty) {
        // Add a new document to the 'zone' collection
        await addDoc(zonesCollection, {
          zone: zone,
          size: size,
          
          
        });
      } else {
        // If the collection exists, just add a new zone
        await addDoc(zonesCollection, {
          zone: zone,
          size: size,
          
          
        });
      }

      // Set a success message and open the modal
      setModalMessage('Zone saved successfully!');
      setIsModalOpen(true);
      
      // Clear input fields after saving
      setZone('');
      setSize('');
      
      
      
    } catch (error) {
      console.error("Error adding document: ", error);
      setModalMessage('Failed to save zone. Please try again.');
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    fetchUserData();
    // Other effect logic
  }, []);
  
  const closeModal = () => {
    setIsModalOpen(false);
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
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>
        <br></br>

        <br></br>


<FormContainer>
  <h3>Add New Zone</h3>

  <InputField>
        <input
          type="text" // Allow letters and numbers
          required
          value={zone}
          onChange={(e) => setZone(e.target.value)} 
          placeholder=" "
        />
        <label htmlFor="zone">Zone</label>
      </InputField>

      <InputField>
        <input
          type="text" // Allow letters and numbers
          required
          value={size}
          onChange={(e) => setSize(e.target.value)} 
          placeholder=" "
        />
        <label htmlFor="address">Zone Address</label>
      </InputField>
      

  <SaveButton onClick={handleSaveSpace}>Save Space</SaveButton>
  {isModalOpen && (
            <Modal>
              <ModalContent>
                <CloseButton onClick={closeModal} aria-label="Close modal">×</CloseButton>
                <p>{modalMessage}</p>
                <button onClick={closeModal}>Close</button>
              </ModalContent>
            </Modal>
          )}
</FormContainer>


      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
