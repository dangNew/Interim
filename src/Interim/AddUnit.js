import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
<<<<<<< HEAD
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faCheck} from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, addDoc } from 'firebase/firestore';
=======
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faCog, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs } from 'firebase/firestore';
import { stallholderDb } from '../components/firebase.config';
>>>>>>> a8f5076 (main)
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

<<<<<<< HEAD
const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem; /* Slightly increased padding for a more spacious look */
  border-radius: 20px;
  background-color: #d4edda; /* Light green background */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Softer shadow for a modern feel */

  h3 {
    margin-bottom: 1rem;
    font-family: 'Roboto', sans-serif;
    color: #155724; /* Dark green for the heading */
=======



const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 20px; /* Added margin to avoid overlapping with AppBar */

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background-color: ${({ bgColor }) => bgColor || '#f4f4f4'};
  padding: 3rem;
  border-radius: 12px;
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
  border-radius: 20px;
  background-color: #f8f9fa;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
>>>>>>> a8f5076 (main)
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 20px;
      text-align: left;
<<<<<<< HEAD
      border-bottom: 1px solid #c3e6cb; /* Light green border */
    }

    th {
      background-color: #c3e6cb; /* Light green background for header */
    }

    tr:nth-child(even) {
      background-color: #f8f9fa; /* Keeping alternating row colors */
=======
      border-bottom: 1px solid #dee2e6;
    }

    th {
      background-color: #e9ecef;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
>>>>>>> a8f5076 (main)
    }
  }
`;

<<<<<<< HEAD

=======
>>>>>>> a8f5076 (main)
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
<<<<<<< HEAD
const InputField = styled.div`
  position: relative;
  margin-bottom: 2rem;

  input {
    width: 100%;
    padding: 12px 10px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 16px;
    color: #495057;
    background-color: #f8f9fa;
    transition: all 0.2s ease;

    &:focus {
      border-color: #007bff;
      outline: none;
    }

    &:focus + label,
    &:not(:placeholder-shown) + label {
      top: -8px;
      left: 10px;
      font-size: 12px;
      color: #007bff;
    }
  }

  label {
    position: absolute;
    top: 12px;
    left: 12px;
    font-size: 16px;
    color: #6c757d;
    pointer-events: none;
    transition: all 0.2s ease;
  }
`;

const SaveButton = styled.button`
  background-color: #28a745; /* Green color */
  color: white;
  padding: 15px 30px; /* Increased padding for a bigger button */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px; /* Increased font size for better visibility */
  font-weight: bold; /* Bold text for emphasis */

  &:hover {
    background-color: #218838; /* Darker green on hover */
  }
`;
=======

>>>>>>> a8f5076 (main)


const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
<<<<<<< HEAD
  const sidebarRef = useRef(null);
  const [unitName, setUnitName] = useState('');
  const [location, setLocation] = useState('');
  const [dateRegistered, setDateRegistered] = useState(new Date().toISOString().split('T')[0]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  
=======
  const [stallHolders, setStallHolders] = useState([]);
  const sidebarRef = useRef(null);
  const [totalUsers, setTotalUsers] = useState(0); // State to store 
  const [filteredStallHolders, setFilteredStallHolders] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

>>>>>>> a8f5076 (main)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

<<<<<<< HEAD
  const handleSaveUnit = async () => {
     if (!unitName.trim() || !location.trim() || !dateRegistered) {
    alert('Please fill in all fields before saving.');
    return; // Prevent saving if any field is empty
  }
    try {
        console.log('Saving unit with data:', {
            name: unitName,
            location: location,
            dateRegistered: dateRegistered,
        });

        // Use interimDb to add the document to the 'unit' collection
        const docRef = await addDoc(collection(interimDb, 'unit'), {
            name: unitName,
            location: location,
            dateRegistered: dateRegistered,
        });

        console.log('Document written with ID: ', docRef.id);
        alert('Unit saved successfully!');

        // Optionally, reset the input fields after saving
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
=======
  useEffect(() => {
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

    fetchUserData();
  }, []);
>>>>>>> a8f5076 (main)

  const handleClickOutside = (event) => {
    
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

<<<<<<< HEAD
  
=======
  // Fetch total users and recent user data from Firestore
  useEffect(() => {
    const fetchData = async () => {
        const querySnapshot = await getDocs(collection(stallholderDb, 'users'));

      const data = querySnapshot.docs.map((doc) => {
        const stallInfo = doc.data().stallInfo || {}; // Fetch stallInfo map
        const dateOfRegistration = doc.data().dateOfRegistration ? doc.data().dateOfRegistration.toDate().toLocaleDateString() : '';

        return {
          id: doc.id, // Document ID
          stallNumber: stallInfo.stallNumber || '',  // Retrieve stall number from stallInfo
          firstName: doc.data().firstName || '',      // Retrieve first name
          lastName: doc.data().lastName || '',        // Retrieve last name
          location: stallInfo.location || '',         // Retrieve location from stallInfo
          areaMeters: stallInfo.stallSize || '',      // Retrieve area (size) from stallInfo
          billing: stallInfo.ratePerMeter || '',      // Retrieve rate per meter from stallInfo
          date: dateOfRegistration,               // Retrieve date of registration
          status: stallInfo.status || '',             // Retrieve status from stallInfo
        };
      });
      setStallHolders(data); // Set the stall holders state with fetched data
      setFilteredStallHolders(data);
      setTotalUsers(data.length); // Update total users count
    };

    fetchData();
  }, []);
>>>>>>> a8f5076 (main)

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
<<<<<<< HEAD
  <Link to="/stalls" style={{ textDecoration: 'none' }}>
  <SidebarItem isSidebarOpen={isSidebarOpen}>
    <FontAwesomeIcon icon={faClipboard} className="icon" />
    <span>List of Stalls</span>
  </SidebarItem>
</Link>
=======
>>>>>>> a8f5076 (main)

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

<<<<<<< HEAD
  <Link to="/viewunit" style={{ textDecoration: 'none' }}>
=======
  <Link to="/Addunit" style={{ textDecoration: 'none' }}>
>>>>>>> a8f5076 (main)
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
<<<<<<< HEAD

=======
>>>>>>> a8f5076 (main)
  <Link to="/ticket" style={{ textDecoration: 'none' }}>
  <SidebarItem isSidebarOpen={isSidebarOpen}>
    <FontAwesomeIcon icon={faTicketAlt} className="icon" />
    <span>Manage Ticket</span>
  </SidebarItem>
</Link>

<<<<<<< HEAD
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
=======
  <Link to="/settings" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faCog} className="icon" />
      <span>Settings</span>
    </SidebarItem>
  </Link>
>>>>>>> a8f5076 (main)
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

<<<<<<< HEAD
      <FormContainer>
        <h3>Add Unit</h3>
        
        <InputField>
          <input
            type="text"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            placeholder=" " // This is necessary for floating effect
            required
          />
          <label>Unit Name</label>
        </InputField>

        <InputField>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder=" " // This is necessary for floating effect
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


=======
        <StatsContainer>
          <StatBox bgColor="#11768C">
            <h3>Total Vendor</h3>
            <p>{totalUsers}</p>
          </StatBox>

          <StatBox bgColor="#188423">
            <h3>Total Logins</h3>
            <p>{totalUsers}</p>
          </StatBox>
        </StatsContainer>

      

        <FormContainer>
          <h3>Stall Information</h3>
          <table>
            <thead>
              <tr>
                <th>Stall No.</th>
                <th>Stall Holder</th>
                <th>Unit</th>
                <th>Area (Meters)</th>
                <th>Rate Per Meter</th>
                <th>Date</th>
                <th>Status</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStallHolders.map((stall, index) => (
                <tr key={index}>
                  <td>{stall.stallNumber}</td>
                  <td>{stall.firstName} {stall.lastName}</td>
                  <td>{stall.location}</td>
                  <td>{stall.areaMeters}</td>
                  <td>{stall.billing}</td>
                  <td>{stall.date}</td>
                  <td>{stall.status}</td>
                  <td>
                    <button>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormContainer>
>>>>>>> a8f5076 (main)
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
