import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faCogs, faTicketAlt, faCheck, faClipboard , faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import { initializeApp } from 'firebase/app';
import { rentmobileDb, rentmobileAuth } from '../components/firebase.config';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { interimDb } from '../components/firebase.config';
import ConfirmationModal from './ConfirmationModal'; // Import the modal



const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  border: 1px solid #ddd;  /* ADD THIS */
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow-y: auto;
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
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '70px')};
  padding-left: 40px;
  background-color: #fff;
  padding: 2rem;
  width: 100%;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
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

const FormContainer = styled.form`
  display: grid;
  gap: 1.5rem;
  background: #fff;
  border: 2px solid #ddd;
  padding: 1rem;
  border-radius: 20px;
  max-width: 96%;
  width: 100%;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  align-self: center;
  margin-top: 20px;

  label {
    font-size: 20px;
    margin-bottom: 5px;
  }

  input, select, textarea {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    width:90%;
  }

  .section-title {
    grid-column: span 2;
    font-size: 25px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
  }

  .form-section {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .inline-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .button-group {
    grid-column: span 2;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: #4caf50;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      font-weight: bold;

      &:hover {
        background-color: #45a049;
      }

      &.cancel {
        background-color: #f44336;

        &:hover {
          background-color: #d32f2f;
        }
      }
    }
  }

  .upload-btn-wrapper {
    position: relative;
    overflow: hidden;
    display: inline-block;

    button {
      border: 1px solid #ddd;
      color: gray;
      background-color: #f0f0f0;
      padding: 8px 20px;
      border-radius: 4px;
      font-size: 1rem;
    }

    input[type="file"] {
      font-size: 100px;
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
    }
  }
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

const Divider = styled.hr`
  border: 2;
  height: 1px;
  background-color: #dee2e6;
  margin: 10px 0; /* Adjust margin for spacing as needed */
  width: 150%; /* Ensure the line spans the full width */
`;
const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #4caf50;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }
`;

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const sidebarRef = useRef(null);
    const [isPositionActive, setIsPositionActive] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const navigate = useNavigate();
  
    // Form state for storing the input values
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      middleName: '',
      contactNum: '',
      email: '',
      address: '',
      password: '',
      status: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    // Handling form input changes
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevState) => ({
        ...prevState,
        [name]: value
      }));
    };
    
    
    // Submitting the form and adding data to Firestore
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // Input validation
      if (!formData.email || !formData.password) {
          alert("Email and password are required!");
          return;
      }
  
      try {
          // Create user in Firebase Authentication
          const userCredential = await createUserWithEmailAndPassword(rentmobileAuth, formData.email, formData.password);
          const user = userCredential.user;
  
          const collectorData = {
              firstName: formData.firstName,
              lastName: formData.lastName,
              middleName: formData.middleName,
              contactNum: formData.contactNum,
              email: formData.email,
              address: formData.address,
              Image: null,
              status: formData.status,
              zone: '', // Initialize the zone field
          };
  
          // Reference to the ambulant_collector collection
          const collectorsCollection = collection(rentmobileDb, 'ambulant_collector');
  
          // Check if collector already exists
          const collectorsSnapshot = await getDocs(collectorsCollection);
          const existingCollector = collectorsSnapshot.docs.find(doc => doc.data().email === formData.email);
  
          if (!existingCollector) {
              // Save the collector data to Firestore
              await addDoc(collectorsCollection, collectorData);
              alert('Collector added successfully!');
          } else {
              alert('Collector already exists!');
          }
  
          // Reset the form after submission
          setFormData({
              firstName: '',
              lastName: '',
              middleName: '',
              contactNum: '',
              email: '',
              address: '',
              Image: null,
              status: '',
              password: '' // Reset password field
          });
      } catch (error) {
          console.error('Error adding document: ', error.message);
          alert('Failed to add collector or create user: ' + error.message);
      }
      setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate('/some-route'); // Replace with your desired route
};
  
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const togglePositionSwitch = () => {
    setIsPositionActive(prevState => !prevState); 
  };

  const handleClickOutside = (event) => {
   
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

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
  

  const handleLogout = () => {
   
    localStorage.removeItem('formData'); 
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

  <Link to="/viewspace" style={{ textDecoration: 'none' }}>
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
         
          <ProfileHeader>
            <h1>Add Ambulant Collector</h1>
          </ProfileHeader>

          
          <FormContainer onSubmit={handleSubmit}>
  <div className="form-section">
    <label htmlFor="firstName">First Name</label>
    <input
      type="text"
      id="firstName"
      name="firstName"
      value={formData.firstName}
      onChange={handleChange}
      placeholder="Enter First Name" // Ensure the placeholder is present
      required
    />
  </div>
  <div className="form-section">
    <label htmlFor="middleName">Middle Name</label>
    <input
      type="text"
      id="middleName"
      name="middleName"
      value={formData.middleName}
      onChange={handleChange}
      placeholder="Enter Middle Name" // Ensure the placeholder is present
      required
    />
  </div>
  <div className="form-section">
    <label htmlFor="lastName">Last Name</label>
    <input
      type="text"
      id="lastName"
      name="lastName"
      value={formData.lastName}
      onChange={handleChange}
      placeholder="Enter Last Name" // Ensure the placeholder is present
      required
    />
  </div>
  <div className="form-section">
    <label htmlFor="contactNum">Contact Number</label>
    <input
      type="text"
      id="contactNum"
      name="contactNum"
      value={formData.contactNum}
      onChange={handleChange}
      placeholder="Enter Contact" // Ensure the placeholder is present
      required
    />
  </div>
            
            <div className="section-title">Login Details</div>
            <Divider /> {/* Add the horizontal line here */}<span></span>
            <div className="form-section">
            <label htmlFor="email">Email </label>
            <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email" // Ensure the placeholder is present
            required
            />
        </div>
        <div className="form-section">
            <label htmlFor="password">Password </label>
            <input
            type="text"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password" // Ensure the placeholder is present
            required
            />
        </div>
           
            <div className="section-title">Other Details</div>
            <Divider /> {/* Add the horizontal line here */}<span></span>
        
            <div className="form-section">
            <label htmlFor="address">Address </label>
            <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address" // Ensure the placeholder is present
            required
            />
        </div>
       
        

        <div>
            <label htmlFor="toggleSwitch">Active Status</label>
            <ToggleSwitch>
            <span>Active</span>
            <label className="switch">
              <input type="checkbox" checked={isPositionActive} onChange={togglePositionSwitch} />
              <span className="slider"></span>
            </label>
          </ToggleSwitch>
                </div>
    

                <div className="button-group">
    <button className="cancel" type="button" onClick={() => {/* Logic for cancel */}}>Cancel</button>
    <button type="submit">Save</button> {/* This should trigger handleSubmit */}
</div>
  </FormContainer>
  {/* Confirmation modal */}
  <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    message="User Created"
                />
            </MainContent>
        </DashboardContainer>
    );
};

export default Dashboard;