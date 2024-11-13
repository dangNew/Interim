import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaEye, FaPen, FaTrash, FaSearch, FaUserCircle, FaUsers,FaUser, FaUserSlash, FaChevronDown } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

<<<<<<< HEAD
import { FaSignOutAlt, FaCaretDown, FaPlus } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faCheck, faClipboard, faPlusCircle, faCogs} from '@fortawesome/free-solid-svg-icons';
=======
import { FaSignOutAlt } from 'react-icons/fa';
<<<<<<< HEAD
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faCheck, faClipboard} from '@fortawesome/free-solid-svg-icons';
=======
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faCog, faTicketAlt, faCheck} from '@fortawesome/free-solid-svg-icons';
>>>>>>> a8f5076 (main)
>>>>>>> d5d5483c3510cc4b45805bc196150e569b84e8be
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { interimDb } from '../components/firebase.config'; // Import the correct firestore instance
import { rentmobileDb } from '../components/firebase.config';


const UserManagementContainer = styled.div`
  display: flex;
  height: 100vh;
 
`;

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '50px')};
  background-color: #f8f9fa;
  padding: 10px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;  /* ADD THIS */
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s;
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

<<<<<<< HEAD
=======
const DashboardTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;
>>>>>>> a8f5076 (main)

const StatsContainer = styled.div`
  margin-top: 25px;
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background-color: ${({ bgColor }) => bgColor || '#f4f4f4'};
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #ddd;  /* ADD THIS */
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



const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
`;

const ModalHeader = styled.h2`
  margin: 0;
`;

const ModalBody = styled.p`
  margin: 20px 0;
`;

const ModalButton = styled.button`
  background: #007bff; // Default color
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px; // Margin between buttons
  transition: background 0.3s, transform 0.2s; // Add transition effects

  &:hover {
    background: #0056b3; // Darker on hover
    transform: translateY(-2px); // Subtle lift effect
  }

  &:active {
    transform: translateY(0); // Reset on click
  }
`;





const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }

    th {
      background-color: #e9ecef;
    }

    // Striped rows
    tr:nth-child(even) {
      background-color: #f2f2f2; // Light gray for even rows
    }

    tr:nth-child(odd) {
      background-color: #ffffff; // White for odd rows
    }

    .actions {
      display: flex;
      gap: 5px; /* Space between the buttons */
    }

    .action-button {
      display: flex;
      align-items: center;
      border: none;
      background: none;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #0056b3; /* Darken on hover */
      }

      .icon {
        font-size: 24px; /* Increase icon size */
        color: black;
      }
    }
  }
`;
const ActionButton = styled.button`
  display: flex;
  align-items: center;
  border: none;
  border-radius: 5px;
  padding: 5px 5px;
  cursor: pointer;
  gap: 1px; 
  font-size: 12px;
  transition: background-color 0.2s ease;

<<<<<<< HEAD
  &.view {
    background-color: #007bff; /* Blue */
    color: white;

    &:hover {
      background-color: #0056b3; /* Darker blue */
    }
  }

  &.edit {
    background-color: #28a745; /* Green */
    color: white;

    &:hover {
      background-color: #218838; /* Darker green */
    }
  }

  &.delete {
    background-color: #dc3545; /* Red */
    color: white;

    &:hover {
      background-color: #c82333; /* Darker red */
    }
  }

  .icon {
    margin-right: 5px; /* Space between icon and text */
    font-size: 16px;
  }
`;
=======
<<<<<<< HEAD
=======
const ToggleSwitch = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: relative;
    width: 34px;
    height: 20px;
    background-color: #ccc;
    border-radius: 50px;
    transition: background-color 0.3s;
  }

  .slider:before {
    content: "";
    position: absolute;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background-color: white;
    transition: transform 0.3s;
    transform: translateX(2px);
  }

  input:checked + .slider {
    background-color: #4caf50;
  }

  input:checked + .slider:before {
    transform: translateX(14px);
  }
`;

>>>>>>> a8f5076 (main)
>>>>>>> d5d5483c3510cc4b45805bc196150e569b84e8be
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
const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; /* Space between the dropdown and search bar */
  margin-bottom: 16px;
`;
const DropdownMenu = styled.ul`
  position: absolute;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  list-style-type: none;
  padding: 0;
  margin: 0;
  z-index: 200;

  li {
    padding: 10px;
    cursor: pointer;

    &:hover {
      background-color: #f1f1f1;
    }
  }
`;

const SearchContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  width: 400px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 0 10px;
  background-color: #f9f9f9; /* Light background for contrast */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for professional look */
`;

const StyledSearchBar = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: #333;
  
  &::placeholder {
    color: #aaa;
  }
`;

const IconWrapper = styled.div`
  color: #888;
  margin-right: 8px;
  font-size: 16px;
`;
const AddButton = styled.button`
  margin-top: 1rem;
  padding: 10px;
  background-color: #4CAF50; 
  color: white;
  border: 1rem;
  border-radius: 5px;
  cursor: pointer;
  

  &:hover {
    background-color: #45a049;  // Darker green on hover
  }
`;
const DropdownButton = styled.button`
  margin-top: 1rem;
  display: flex; /* Flexbox for aligning items */
  align-items: center; /* Center items vertically */
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 

  &:hover {
    background-color: #0056b3;
  }

  span {
    margin-left: 10px; /* Space between icon and text */
  }
`;

const UserManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [users, setUserData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalMessage, setModalMessage] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [inactiveUsers, setInactiveUsers] = useState(0); // State to hold inactive users count
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
      if (loggedInUserData) {
        const usersCollection = collection(rentmobileDb, 'admin_users');
        const userDocs = await getDocs(usersCollection);
        const users = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const currentUser = users.find(user => user.email === loggedInUserData.email);
        setLoggedInUser(currentUser || loggedInUserData);
      }
    };

    fetchUserData();
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRoleSelect = (role) => {
    // If 'All Users' is selected, reset the filter (set to null)
    setSelectedRole(role === 'All Users' ? null : role);
    setIsRoleDropdownOpen(false); // Close the dropdown after selection
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleUserDropdownToggle = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    if (isRoleDropdownOpen) {
      setIsRoleDropdownOpen(false); // Close Roles dropdown if open
    }
  };

  const handleRoleDropdownToggle = () => {
    setIsRoleDropdownOpen(!isRoleDropdownOpen);
    if (isUserDropdownOpen) {
      setIsUserDropdownOpen(false); // Close User Management dropdown if open
    }
  };

  const handleShowModal = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleEditClick = (userId) => {
    navigate(`/edit/${userId}`); // Navigate to a specific edit page for the user
  };

  const handleViewClick = (userId) => {
    navigate(`/viewuser/${userId}`);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user); // Set the user to delete
    handleShowModal('confirmation', `Are you sure you want to delete ${user.firstName} ${user.lastName}?`);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteDoc(doc(rentmobileDb, 'admin_users', userToDelete.id)); // Delete the user from Firestore
        setUserData(users.filter(user => user.id !== userToDelete.id)); // Remove from local state
        handleShowModal('success', `${userToDelete.firstName} ${userToDelete.lastName} has been deleted.`);
      } catch (error) {
        handleShowModal('error', 'Failed to delete user');
      } finally {
        setUserToDelete(null); // Reset the user to delete
        handleCloseModal();
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, 'admin_users'));
        const userList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserData(userList);
        setFilteredUsers(userList); // Initialize filtered users with all users
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = users;
    if (selectedRole) {
      filtered = filtered.filter(user => user.position === selectedRole);
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowerQuery)
      );
    }
    setFilteredUsers(filtered);
  }, [users, selectedRole, searchQuery]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, 'admin_users'));
        const userList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setUserData(userList);

        // Calculate inactive users based on the status
        const inactiveCount = userList.filter(user => user.status === 'Inactive').length;
        setInactiveUsers(inactiveCount); // Update the inactive users count

      } catch (error) {
        console.error('Error fetching user data:', error);
        handleShowModal('error', 'Failed to fetch user data');
      }
    };

    fetchData();
  }, [selectedRole]);

  const handleClickOutside = (event) => {
    // Your click outside logic here
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate total users and active users based on valid data
  const totalUsers = users.filter(user => user.firstName && user.lastName).length; // Only count users with first and last names
  const activeUsers = users.filter(user => user.status === 'Active' && user.firstName && user.lastName).length; // Active users with valid names

  return (


    <UserManagementContainer>
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
  <Link to="/listofstalls" style={{ textDecoration: 'none' }}>
=======
<<<<<<< HEAD
  <Link to="/stalls" style={{ textDecoration: 'none' }}>
>>>>>>> d5d5483c3510cc4b45805bc196150e569b84e8be
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
<<<<<<< HEAD
      <Link to="/viewzone" style={{ textDecoration: 'none' }}>
=======
<<<<<<< HEAD
      <Link to="/View" style={{ textDecoration: 'none' }}>
>>>>>>> d5d5483c3510cc4b45805bc196150e569b84e8be
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
=======
>>>>>>> a8f5076 (main)
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
      
        <AppBar>
          <ToggleButton onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          <div>USER MANAGEMENT</div>
        </AppBar>

       
        <SearchBarContainer>
          <input type="text" placeholder="Search users..." />
          <Link to="/newuser">
            <button className="add-user-btn">+ New User</button>
          </Link>
        </SearchBarContainer>

        <StatsContainer>
      <StatBox bgColor="#11768C">
        <h3>Total Users</h3>
        <p>{totalUsers}</p> {/* Display the total user count */}
        <div className="icon-container">
          <FaUsers className="fading-icon" style={{ 
            fontSize: '30px', 
            opacity: 0.5, 
            animation: 'fade 2s infinite alternate' 
          }} />
        </div>
      </StatBox>
    
      <StatBox bgColor="#11768C">
        <h3>Active Users</h3>
        <p>{activeUsers}</p> {/* Display the total user count */}
        <div className="icon-container">
          <FaUser className="fading-icon" style={{ 
            fontSize: '30px', 
            opacity: 0.5, 
            animation: 'fade 2s infinite alternate' 
          }} />
        </div>
      </StatBox>

      <StatBox bgColor="#11768C">
  <h3>Inactive Users</h3> 
  <p>{inactiveUsers}</p> {/* Display the total user count */} 
  <div className="icon-container">
    <FaUserSlash className="fading-icon" style={{ 
      fontSize: '30px', 
      opacity: 0.5, 
      animation: 'fade 2s infinite alternate' 
    }} />
  </div>
</StatBox>

        </StatsContainer>

        

      <FormContainer>
      <ControlsContainer>
        <AddButton onClick={() => navigate('/newuser')}>
      <FaPlus style={{ marginRight: '8px' }} /> {/* Plus Icon */}
      Add New User
    </AddButton>

        <DropdownButton onClick={handleRoleDropdownToggle}>
          <FaUser style={{ marginRight: '8px' }} /> {/* User icon */}
          <span>{selectedRole || 'Select Role'}</span>
          <FaCaretDown style={{ marginLeft: '8px' }} /> {/* Dropdown arrow */}
        </DropdownButton>

        {isRoleDropdownOpen && (
          <DropdownMenu>
            <li onClick={() => handleRoleSelect('All Users')}>All Users</li>
            <li onClick={() => handleRoleSelect('Collector')}>Collector</li>
            <li onClick={() => handleRoleSelect('CTO')}>CTO</li>
            <li onClick={() => handleRoleSelect('OIC')}>OIC</li>
            <li onClick={() => handleRoleSelect('Interim')}>Interim</li>
          </DropdownMenu>
        )}

        <SearchContainer>
          <IconWrapper>
            <FaSearch />
          </IconWrapper>
          <StyledSearchBar
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </SearchContainer>
      </ControlsContainer>

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Full Name</th>
            <th>Position</th>
            <th>Unit</th>
            <th>Status</th>
            <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No data is stored</td>
              </tr>
            ) : (
              filteredUsers
                .filter(user => user.firstName && user.lastName)
                .map((user, index) => (
                  <tr key={index}>
                    <td>{user.email}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.position}</td>
                    <td>{user.location}</td>
                    <td>{user.status}</td>
                  
                    <td>
                  <div className="actions">
                    <ActionButton className="view" onClick={() => handleViewClick(user.id)}>
                      <FaEye className="icon" /> View
                    </ActionButton>
                    <ActionButton className="edit" onClick={() => handleEditClick(user.id)}>
                      <FaPen className="icon" /> Edit
                    </ActionButton>
                    <ActionButton className="delete" onClick={() => handleDeleteClick(user)}>
                      <FaTrash className="icon" /> Delete
                    </ActionButton>
                  </div>
                </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </FormContainer>

{showModal && (
  <ModalOverlay>
    <ModalContent>
      <ModalHeader>{modalType === 'confirmation' ? 'Confirm Delete' : modalType === 'success' ? 'Success' : 'Error'}</ModalHeader>
      <ModalBody style={{ fontSize: modalType === 'confirmation' ? '0.9rem' : '1rem' }}>
        {modalMessage}
      </ModalBody>
      {modalType === 'confirmation' ? (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
    <ModalButton style={{ background: '#4caf50', marginRight: '10px' }} onClick={handleConfirmDelete}>
      Confirm
    </ModalButton>
    <ModalButton style={{ background: '#f44336' }} onClick={handleCloseModal}>
      Cancel
    </ModalButton>
  </div>
) : (
        <ModalButton onClick={handleCloseModal}>OK</ModalButton>
      )}
    </ModalContent>
  </ModalOverlay>
        )}
      </MainContent>
    </UserManagementContainer>
  );
};

export default UserManagement;