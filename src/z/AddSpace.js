import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faPlusCircle, faCogs} from '@fortawesome/free-solid-svg-icons';
import { addDoc, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
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
      border-color: #188423; /* Focus color */
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
  background-color:#008000  ;
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
    background-color: #ffffff; ;
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

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [dateRegistered, setDateRegistered] = useState(new Date().toISOString().split('T')[0]);
  const [rate, setRate] = useState(0); 
  const [size, setSize] = useState(0); 
  const [zone, setZone] = useState('');
  const [zones, setZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [spaceNumber, setSpaceNumber] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    userManagement: false,
    addUnit: false,
    appraise: false,
    contract: false,
    ticket: false,
    manageZone: false,
    manageSpace: false,
  });
  
  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen(prevState => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const fetchZones = async () => {
    try {
      const zonesCollectionRef = collection(rentmobileDb, 'zone');
      const zonesSnapshot = await getDocs(zonesCollectionRef);
      const zoneData = zonesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setZones(zoneData);
    } catch (error) {
      console.error('Error fetching zones: ', error);
    }
  };

  useEffect(() => {
    checkAndCreateCollection();
    fetchUserData();
    fetchZones(); // Fetch zone data
  }, []);

  const handleSaveSpace = async () => {
    // Check if the required fields are filled
    if (rate <= 0 || size <= 0 || !zone.trim()) {
      
      return; // Prevent saving if any field is invalid
    }
  
    try {
      // Step 1: Fetch the last space number from the Space collection
      const spaceCollectionRef = collection(rentmobileDb, 'Space');
      const spaceQuery = query(spaceCollectionRef, orderBy('spaceNumber', 'desc'), limit(1));
      const lastSpaceSnapshot = await getDocs(spaceQuery);
  
      let newSpaceNumber;
      if (!lastSpaceSnapshot.empty) {
        const lastSpaceDoc = lastSpaceSnapshot.docs[0];
        const lastSpaceID = lastSpaceDoc.id; // Get the last space document ID
        const currentCounterValue = parseInt(lastSpaceID, 10); // Convert to integer
        newSpaceNumber = (currentCounterValue + 1).toString().padStart(2, '0'); // Increment and format
      } else {
        newSpaceNumber = '01'; // Start from 01 if no documents exist
      }
  
      // Step 2: Save the new space document with specified space number as ID
      await setDoc(doc(rentmobileDb, 'Space', newSpaceNumber), {
        rate: rate, // Already a number
        size: size, // Already a number
        zone: zone,
        spaceNumber: newSpaceNumber // Store the formatted space number
      });
  
      // Update the counter document with the new value
      const counterDocRef = doc(rentmobileDb, 'counters', 'space_counter');
      await setDoc(counterDocRef, { value: parseInt(newSpaceNumber, 10) });
  
      console.log('Space saved successfully with space number:', newSpaceNumber);
      setModalMessage('Space saved successfully!');
      setIsModalOpen(true); 
  
      // Reset fields after saving
      setRate(0); // Reset to 0
      setSize(0); // Reset to 0
      setZone(''); // Reset zone
    } catch (e) {
      console.error('Error saving space: ', e);
      alert('Error saving space: ' + e.message);
    }
  };
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

  const checkAndCreateCollection = async () => {
    const collectionRef = collection(rentmobileDb, 'Space');
    
    try {
      // Attempt to get documents from the 'Space' collection
      const querySnapshot = await getDocs(collectionRef);
      
      // If the collection exists but is empty, you can handle that if needed
      if (querySnapshot.empty) {
        console.log('Space collection exists but is empty.');
      } else {
        console.log('Space collection exists with documents.');
      }
    } catch (error) {
      // If the error is that the collection doesn't exist, create it
      if (error.code === 'permission-denied' || error.code === 'not-found') {
        console.log('Creating Space collection as it does not exist.');
        
        // Optionally, you can add a placeholder document to the collection
        await addDoc(collectionRef, {
          createdAt: new Date().toISOString(),
          placeholder: true // This is just an example
        });
      } else {
        console.error('Error checking collection: ', error);
      }
    }
  };

  useEffect(() => {
    checkAndCreateCollection(); // Check and create collection on component mount
    fetchUserData(); // Fetch user data
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
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>

        
        <br></br>

        <br></br>
<div>
  

  {/* Add Zone Button */}
  <Link to="/addzone" style={{ textDecoration: 'none' }}>
    <StyledButton onClick={handleSaveSpace}>
      <FontAwesomeIcon icon={faPlus} size="lg" style={{ marginRight: '8px', fontWeight: 'bold' }} />
      Add Zone
    </StyledButton>
  </Link>
</div>

<FormContainer>
  <h3>Add New Space</h3>

  <InputField>
    <input
      type="number" // Changed to number
      required
      value={rate}
      onChange={(e) => setRate(Number(e.target.value))} // Convert to number
      placeholder=" "
    />
    <label htmlFor="rate">Rate</label>
  </InputField>

  <InputField>
    <input
      type="number" // Changed to number
      required
      value={size}
      onChange={(e) => setSize(Number(e.target.value))} // Convert to number
      placeholder=" "
    />
    <label htmlFor="size">Size</label>
  </InputField>

  <InputField>
  <label htmlFor="zone-select">Select Zone:</label>
  <select 
    id="zone-select" 
    value={zone} 
    onChange={(e) => setZone(e.target.value)}
    required
  >
    <option value="" disabled>Select Zone</option>
    {zones.map((zoneItem) => (
      <option key={zoneItem.id} value={zoneItem.rate}>{zoneItem.rate}</option>
    ))}
  </select>
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
