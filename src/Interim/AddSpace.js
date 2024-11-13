import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faPlusCircle, faCogs} from '@fortawesome/free-solid-svg-icons';
import { addDoc, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { rentmobileDb } from '../components/firebase.config'; 
import { interimDb } from '../components/firebase.config'; 

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
  overflow: auto;
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
  const [spaceNumber, setSpaceNumber] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
  <Link to="/listofstalls" style={{ textDecoration: 'none' }}>
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

  <Link to="/viewunit" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faPlus} className="icon" />
      <span>Add New Unit</span>
    </SidebarItem>
  </Link>

  <Link to="/appraise" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faUsers} className="icon" />
      <span>Manage Appraisal</span>
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
    <FontAwesomeIcon icon={faCogs} className="icon" />
    <span>Manage Zone</span>
  </SidebarItem>

  {isDropdownOpen && (
    <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
      <Link to="/addzone" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faPlusCircle} className="icon" />
            <span> Add Zone</span>
          </SidebarItem>
        </li>
      </Link>
      <Link to="/viewzone" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
          <FontAwesomeIcon icon={faSearch} className="icon" />
            <span> View Zone</span>
          </SidebarItem>
        </li>
      </Link>
    
    </ul>
  )}
<SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleDropdownToggle}>
    <FontAwesomeIcon icon={faUser} className="icon" />
    <span>Manage Space</span>
  </SidebarItem>

  {isDropdownOpen && (
    <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
      <Link to="/addspace" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <FontAwesomeIcon icon={faPlusCircle} className="icon" />
            <span> Add Space</span>
          </SidebarItem>
        </li>
      </Link>
      <Link to="/viewspace" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
          <FontAwesomeIcon icon={faSearch} className="icon" />
            <span> View Space</span>
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
    

        <ToggleButton isSidebarOpen={isSidebarOpen} onClick={toggleSidebar}>
          <FaBars />
        </ToggleButton>
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
