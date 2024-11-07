import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'; // Import useParams here
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaCalendarAlt  } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faUsers, faPlus, faFileContract, faTicketAlt,faSearch, faClipboard, faCheck,faPlusCircle, faCogs} from '@fortawesome/free-solid-svg-icons';
import { rentmobileDb } from '../components/firebase.config';
import { collection, getDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import { Timestamp } from 'firebase/firestore';
import 'react-datepicker/dist/react-datepicker.css';

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
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  padding-left: 40px;
  background-color: #fff;
  padding: 2rem;
  width: 100%;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
  flex: 1;
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

const FormContainer = styled.div`
 margin-top: 100 rem;
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  font: bold;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  font-family: 'Inter', sans-serif;

  h3 {
    margin-top: 1px; /* Increased from 30px to 40px */
    text-align: center;
    margin-bottom: 25px;
    color: #333;
    font-size: 2rem; /* Larger font size for the heading */
    font-weight: bold; /* Make heading bold */
}


  form {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 1rem;
    color: #333;
    margin-bottom: 8px;
    font-weight: bold; /* Make the label slightly bolder */
  }

  input[type="text"],
  input[type="number"],
  input[type="file"],
  textarea,
  .react-datepicker-wrapper {
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    background-color: #f5f5f5; /* Light gray background */
    transition: border-color 0.3s;
    width: 100%;
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  textarea:focus,
  .react-datepicker-wrapper:focus-within {
    border-color: #007bff;
    outline: none;
  }

  button {
    padding: 12px;
    border: none;
    border-radius: 8px;
    color: white;
    background-color: blue;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 20px;
    transition: background-color 0.3s, transform 0.2s;
    width: 100%; /* Full-width button */
  }

  button:hover {
    background-color: #0056b3;
    transform: scale(1.02);
  }

  button[type="button"] {
    background-color: #6c757d;
  }

  button[type="button"]:hover {
    background-color: #5a6268;
  }
`;


const AppBar = styled.div`
  background-color: #188423; // Set the desired color
  padding: 40px 50px;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
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


const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6); /* Darker overlay for better contrast */
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  width: 400px;
  max-width: 90%;
  text-align: center;
  font-family: 'Inter', sans-serif;
`;

const ModalHeader = styled.h3`
  margin-bottom: 20px;
  color: #333333;
  font-size: 1.8rem;
  font-weight: bold;
`;

const ModalText = styled.p`
  color: #666666;
  font-size: 1.2rem;
  margin-bottom: 30px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
`;

const CancelButton = styled.button`
  background-color: #dc3545; /* Bootstrap danger color */
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  flex: 1;

  &:hover {
    background-color: #c82333;
    transform: scale(1.05); /* Slightly enlarge on hover */
  }
`;
const OkButton = styled.button`
  background-color: #007bff; /* Bootstrap primary color */
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  flex: 1;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05); /* Slightly enlarge on hover */
  }
`;

const ConfirmButton = styled.button`
  background-color: #28a745; /* Bootstrap success color */
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  flex: 1;

  &:hover {
    background-color: #218838;
    transform: scale(1.05); /* Slightly enlarge on hover */
  }
`;

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const sidebarRef = useRef(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [zones, setZones] = useState([]); // State to hold fetched zones
    const { id } = useParams(); // Retrieve the ID from the URL
    const [spaceNumber, setSpaceNumber] = useState('');
    const [rate, setRate] = useState('');
    const [size, setSize] = useState('');
    const [zone, setZone] = useState('');
    const [dateIssued, setDateIssued] = useState(new Date());
    const navigate = useNavigate();

  
    useEffect(() => {
      const fetchSpaceData = async () => {
          try {
              const docRef = doc(rentmobileDb, 'Space', id);
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                  const data = docSnap.data();
                  setSpaceNumber(data.spaceNumber || '');
                  setRate(data.rate || '');
                  setSize(data.size || '');
                  setZone(data.zone || '');
              } else {
                  console.log('No such document!');
              }
          } catch (error) {
              console.error('Error fetching space data:', error);
          }
      };

      fetchSpaceData();
  }, [id]);

  
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
        const docRef = doc(rentmobileDb, 'Space', id);
        await updateDoc(docRef, {
            spaceNumber,
            rate: parseFloat(rate),
            size: parseFloat(size),
            zone,
        });
        alert('Space updated successfully!');
        navigate('/viewspace'); // Redirect after saving
    } catch (error) {
        console.error('Error updating space:', error);
    }
};
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
        
          <ToggleButton onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          
        
          <AppBar>
        <div className="title">INTERIM</div>
      </AppBar>
         
         <br></br> <br></br>
         <FormContainer>
         <h3>Edit Space</h3>
            <form onSubmit={handleSaveChanges}>
                <div>
                    <label htmlFor="spaceNumber">Space Number:</label>
                    <input
                        id="spaceNumber"
                        type="text"
                        value={spaceNumber}
                        onChange={(e) => setSpaceNumber(e.target.value)}
                        placeholder="Space Number"
                    />
                </div>
                <div>
                    <label htmlFor="rate">Rate:</label>
                    <input
                        id="rate"
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="Rate"
                    />
                </div>
                <div>
                    <label htmlFor="size">Size:</label>
                    <input
                        id="size"
                        type="number"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        placeholder="Size"
                    />
                </div>
                <div>
                    <label htmlFor="zone">Zone:</label>
                    <input
                        id="zone"
                        type="text"
                        value={zone}
                        onChange={(e) => setZone(e.target.value)}
                        placeholder="Zone"
                    />
                </div>
                
                <button type="submit">Update Changes</button>
            </form>
</FormContainer>


      </MainContent>
      </DashboardContainer>
  );
};

export default Dashboard;