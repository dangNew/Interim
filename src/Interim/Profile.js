import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaSearch, FaUserCircle } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { interimDb } from '../components/firebase.config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import {  FaSignOutAlt, FaCamera   } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faCog, faTicketAlt} from '@fortawesome/free-solid-svg-icons';


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
    font-size: 1.5rem;  /* Increase the icon size */
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
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .profile-name {
    font-size: 1rem;
    font-weight: 600;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
  }

  hr {
    width: 100%;
    border: 0.5px solid #ccc;
    margin-top: 10px;
  }
`;

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 40px; /* Adjust as needed */
  height: 40px; /* Adjust as needed */
  margin-bottom: 10px;
`;

const FormContainer = styled.div`
  flex: 3;
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 12px;
  background-color: #ffffff; /* White background for contrast */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); /* Increased shadow for depth */
  border: 1px solid #e9ecef;
  font-family: 'Arial', sans-serif;

  h3 {
    font-size: 1.75rem; /* Larger heading */
    color: #343a40; /* Darker color for headings */
    margin-bottom: 1.5rem;
    text-align: left; /* Center-align the heading */
    font-weight: 700; /* Make the title bold */
  }

  form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem; /* Increased gap between form fields */
    margin-bottom: 2rem; /* Add space below the form */
  }

  label {
    display: block;
    font-size: 1rem;
    color: #495057; /* Dark gray for labels */
    font-weight: 600; /* Bolder labels */
    margin-bottom: 0.5rem;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 8px;
    font-size: 1rem;
    color: #495057;
    background-color: #f8f9fa; /* Light gray background for inputs */
    transition: border-color 0.3s;

    &:focus {
      border-color: #007bff; /* Highlighted border on focus */
      outline: none;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Focus shadow effect */
    }
  }

  button {
    grid-column: span 2; /* Span across both columns */
    padding: 0.75rem;
    background-color: #007bff; /* Primary button color */
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s; /* Add scale effect on hover */

    &:hover {
      background-color: #0056b3; /* Darker shade on hover */
      transform: scale(1.05); /* Slightly enlarge on hover */
    }
  }

  .form-section {
    margin-bottom: 1.5rem; /* Space between sections */
    padding: 1.5rem; /* Increased padding for better spacing */
    border-radius: 8px;
    background-color: #e9ecef; /* Light background for sections */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  }

  .section-title {
    font-size: 1.25rem; /* Size for section titles */
    color: #007bff; /* Blue color for section titles */
    margin-bottom: 1rem; /* Margin below titles */
    text-align: center; /* Center-align section titles */
    font-weight: 600; /* Make titles bold */
  }
`;

const SmallContainer = styled.div`
  flex: 1;
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 50%; /* Set border radius to 50% for a circle */
  background-color: #f8f9fa;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  max-width: 200px; /* Set max-width for circle size */
  height: 200px; /* Ensure it takes a fixed height */
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ced4da;
  position: relative; /* Add relative positioning for button placement */

  img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 50%; /* Ensure image is also a circle */
  }
`;

const CameraIcon = styled(FaCamera)`
  position: absolute; /* Position the icon absolutely */
  bottom: 10px; /* Position it towards the bottom of the circle */
  right: 10px; /* Position it towards the right of the circle */
  font-size: 24px; /* Adjust size as needed */
  color: #007bff; /* Change color as needed */
  cursor: pointer; /* Change cursor to pointer on hover */

  &:hover {
    color: #0056b3; /* Darker color on hover */
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
const SidebarFooter = styled.div`
  padding: 10px;
  margin-top: auto; /* Pushes the footer to the bottom */
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #45a049;
  }
`;




const editButtonStyle = {
  backgroundColor: 'blue', // Replace with your desired color
  color: 'white', // Text color
  padding: '10px 15px', // Padding
  border: 'none', // Border style
  borderRadius: '5px', // Rounded corners
  cursor: 'pointer', // Pointer on hover
};

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({ firstName: '', lastName: '', email: '', position: '' });
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [fileInputKey] = useState(Date.now());
  const [newImage, setNewImage] = useState(null);
  const sidebarItems = [
    { name: 'Home', icon: faHome },
    { name: 'Users', icon: faUsers },
    { name: 'Products', icon: faShoppingCart },
    { name: 'Settings', icon: faCog },
    { name: 'Reports', icon: faFileContract },
    { name: 'Tickets', icon: faTicketAlt },
  ];


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredItems = sidebarItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleClickOutside = (event) => {
    
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch total users and recent user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
      if (loggedInUserData) {
        const usersCollection = collection(interimDb, 'users');
        const userDocs = await getDocs(usersCollection);
        const users = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const currentUser = users.find(user => user.email === loggedInUserData.email);
        setLoggedInUser(currentUser || loggedInUserData);
        setUserData(currentUser || loggedInUserData);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData'); 
    navigate('/login');
  };
  const handleEdit = () => {
    // Trigger the file input click
    document.getElementById('fileInput').click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewImage(URL.createObjectURL(file)); // Create a local URL for the selected file
    }
  };
  
  

    const handleIconClick = () => {
        // Trigger the file input click
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    };

  const handleEditClick = () => {
    setIsEditing(true); // Enable editing mode
  };
  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleChangeProfilePhoto = () => {
    // Logic to change the profile photo, e.g., open a modal or file input
    console.log('Change Profile Photo clicked');
    // You might want to implement a file input or a modal to handle the photo change
  };
  

  const handleSaveChanges = async () => {
    if (loggedInUser) {
      try {
        const userRef = doc(interimDb, 'users', loggedInUser.id);
        await updateDoc(userRef, userData);
        setLoggedInUser(prevUser => ({ ...prevUser, ...userData }));
        setIsEditing(false); // Disable editing mode
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
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

  <Link to="/Addunit" style={{ textDecoration: 'none' }}>
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

  <Link to="/settings" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <FontAwesomeIcon icon={faCog} className="icon" />
      <span>Settings</span>
    </SidebarItem>
  </Link>
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
         
          
      <FormContainer>
        <h3>Edit User Details</h3>
        <SmallContainer>
            <img src={newImage || userData.Image || 'defaultProfileImage.jpg'} alt="Profile" />
            <input
                type="file"
                id="fileInput"
                key={fileInputKey.current} // To reset the input after selection
                onChange={handleFileChange}
                style={{ display: 'none' }} // Hide the default file input
            />
            <FaUserCircle className="profile-icon" onClick={handleIconClick} />
            <CameraIcon onClick={handleIconClick} />
        </SmallContainer> <br></br>
       
        
        
        
        
        <form>
          
          <div className="form-section">
            <div className="section-title">Personal Information</div>
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={userData.firstName}
              onChange={handleInputChange}
            />
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={userData.lastName}
              onChange={handleInputChange}
            />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-section">
            <div className="section-title">Job Information</div>
            <label htmlFor="position">Position</label>
            <input
              type="text"
              id="position"
              name="position"
              value={userData.position}
              onChange={handleInputChange}
            />
            {/* Add more fields as needed */}
          </div>

          <button type="button" onClick={handleSaveChanges}>Save Changes</button>
        </form>
      </FormContainer>
       
      </MainContent>
      </DashboardContainer>
  );
};

export default Dashboard;