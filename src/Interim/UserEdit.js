import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaSearch, FaUserCircle } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { FaSignOutAlt } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faCog, faTicketAlt, faCheck} from '@fortawesome/free-solid-svg-icons';
import { interimDb } from '../components/firebase.config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions

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

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  input {
    display: none;
  }

  .switch {
    position: relative;
    width: 50px;
    height: 28px;
    background-color: #e0e0e0;
    border-radius: 50px;
    transition: background-color 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    
    .slider {
      position: absolute;
      cursor: pointer;
      top: 2px;
      left: 2px;
      width: 24px;
      height: 24px;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      &:before {
        content: "";
        position: absolute;
        height: 24px;
        width: 24px;
        border-radius: 50%;
        background-color: white;
        transition: transform 0.3s ease;
      }
    }
  }

  input:checked + .switch {
    background-color: #4caf50; /* Color when active */
  }

  input:not(:checked) + .switch {
    background-color: #e0e0e0; /* Color when inactive */
  }

  input:checked + .switch .slider {
    transform: translateX(22px); /* Move slider to the right */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  input:not(:checked) + .switch .slider {
    transform: translateX(0); /* Move slider to the left */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .status-label {
    margin-left: 12px;
    font-size: 0.9rem;
    color: #333;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .switch {
      width: 45px;
      height: 26px;

      .slider {
        width: 22px;
        height: 22px;
        left: 2px;
      }
    }

    .status-label {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    .switch {
      width: 40px;
      height: 24px;

      .slider {
        width: 20px;
        height: 20px;
        left: 2px;
      }
    }

    .status-label {
      font-size: 0.7rem;
    }
  }
`;

const BackButton = styled.button`
  background-color: red !important; /* Force background color to red */
  color: white !important; /* Force text color to white */
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: darkred !important; /* Force hover color */
  }
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
const FormContainerLarge = styled.div`
  flex: 3;
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 12px;
  background-color: #f8f9fa;
 box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  border: 2px solid #ced4da;

  h3 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1.5rem;
  }

  form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    
  }

  label {
    display: block;
    font-size: 1rem;
    color: #495057;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 8px;
    font-size: 1rem;
    color: #495057;
    background-color: #f8f9fa;
    transition: border-color 0.3s;

    &:focus {
      border-color: #007bff;
      outline: none;
    }
  }

  button {
    grid-column: span 2;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #0056b3;
    }
  }
`;

const FormContainerSmall = styled.div`
  flex: 1;
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ced4da;

  img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
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

const LoadingModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  width: 80%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;


const ConfirmationModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
  text-align: center;
`;

const ModalMessage = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: center;  /* Center the button horizontally */
  margin-top: 1rem;  /* Optional: add spacing above the button */
`;


const CancelButton = styled.button`
  background-color: #ccc;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const ConfirmButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-left: 10px; /* Add margin-left for spacing */
`;


const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
`;

const ModalButton = styled.button`
  margin-top: 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;

  
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
const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const sidebarRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate()
  
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };
  
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
  
    useEffect(() => {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const querySnapshot = await getDocs(collection(interimDb, 'users'));
          const allUsers = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUsers(allUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchUsers();
    }, []);
  
    useEffect(() => {
      if (id) {
        const user = users.find((user) => user.id === id);
        setSelectedUser(user);
      }
    }, [id, users]);
  
    const handleStatusChange = async (e) => {
      const newStatus = e.target.checked ? 'Active' : 'Inactive';
      if (selectedUser) {
        try {
          const userDocRef = doc(interimDb, 'users', selectedUser.id);
          await updateDoc(userDocRef, { status: newStatus });
          setSelectedUser((prev) => ({ ...prev, status: newStatus }));
        } catch (error) {
          console.error('Error updating status:', error);
        }
      }
    };

    const handleSaveChanges = () => {
      setIsConfirmationModalVisible(true);
    };
    const handleConfirmSave = async () => {
      setIsConfirmationModalVisible(false);
      const formData = {
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        middleName: selectedUser.middleName,
        email: selectedUser.email,
        address: selectedUser.address,
        contactNum: selectedUser.contactNum,
        location: selectedUser.location,
        position: selectedUser.position,
        status: selectedUser.status,
        Image: selectedUser.Image,
      };
    
      try {
        const docRef = doc(interimDb, 'users', id);
        await updateDoc(docRef, formData);
        setIsModalVisible(true); // Show the success modal
        setTimeout(() => {
          setIsModalVisible(false); // Hide it after a few seconds
        }, 3000); // Adjust the duration as needed
      } catch (error) {
        console.error('Error saving changes:', error);
      }
    };
    const handleCancelSave = () => {
      setIsConfirmationModalVisible(false);
    };
  
    const handleModalClose = () => {
      setIsModalVisible(false);
      navigate('/usermanagement');
    };
  
    if (!selectedUser) return <div>Loading...</div>;

    
    const handleLogout = () => {
   
      localStorage.removeItem('userData'); 
      navigate('/login');
    };
    const handleDropdownToggle = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };
  
    return (
      <DashboardContainer>
        {isLoading && (
          <LoadingModal>
            <ModalContent>Wait... Please</ModalContent>
          </LoadingModal>
        )}

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
          <ToggleButton onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          <div>USER MANAGEMENT</div>
        </AppBar>
        <ProfileHeader>
          <h1>Edit User</h1>
        </ProfileHeader>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <FormContainerLarge>
              <h3>User Details</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label>
                  First Name:
                  <input
                    type="text"
                    defaultValue={selectedUser.firstName}
                    onChange={(e) => console.log(`Updated First Name: ${e.target.value}`)} // Handle value change
                  />
                </label>
                <label>
                  Last Name:
                  <input
                    type="text"
                    defaultValue={selectedUser.lastName}
                    onChange={(e) => console.log(`Updated Last Name: ${e.target.value}`)} // Handle value change
                  />
                </label>
                <label>
                  Middle Name:
                  <input
                    type="text"
                    defaultValue={selectedUser.middleName}
                    onChange={(e) => console.log(`Updated Middle Name: ${e.target.value}`)} // Handle value change
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    onChange={(e) => console.log(`Updated Email: ${e.target.value}`)} // Handle value change
                  />
                </label>
                <label>
                  Address:
                  <input
                    type="text"
                    defaultValue={selectedUser.address}
                    onChange={(e) => console.log(`Updated Address: ${e.target.value}`)} // Handle value change
                  />
                </label>
                <label>
                  Contact Number:
                  <input
                    type="text"
                    defaultValue={selectedUser.contactNum}
                    onChange={(e) => console.log(`Updated Contact Number: ${e.target.value}`)} // Handle value change
                  />
                </label>
                <label>
                  Location:
                  <input
                    type="text"
                    defaultValue={selectedUser.location}
                    onChange={(e) => console.log(`Updated Location: ${e.target.value}`)} // Handle value change
                  />
                </label>
                <label>
                  Position:
                  <input
                    type="text"
                    defaultValue={selectedUser.position}
                    onChange={(e) => console.log(`Updated Position: ${e.target.value}`)} // Handle value change
                  />
                </label>
                
                <label>
                Status:
                <ToggleSwitch isChecked={selectedUser.status === 'Active'}>
                  <input
                    type="checkbox"
                    checked={selectedUser.status === 'Active'}
                    onChange={handleStatusChange}
                  />
                  <div className="switch">
                    <div className="slider"></div>
                  </div>
                  <span className="status-label">
                    {selectedUser.status === 'Active' ? 'Active' : 'Inactive'}
                  </span>
                </ToggleSwitch>
              </label>
              <button type="button" onClick={handleSaveChanges}>Save Changes</button>
                <BackButton onClick={() => navigate('/userManagement')}>Back to Users</BackButton>

              </form>
            </FormContainerLarge>
            
            
            <FormContainerSmall>
              {selectedUser.Image && <img src={selectedUser.Image} alt="User" />}
            </FormContainerSmall>
        </div>
        </MainContent>
        <Modal isVisible={isModalVisible}>
          <ModalMessage>Changes saved successfully!</ModalMessage>
          <ModalButtonContainer>
            <ModalButton onClick={handleModalClose}>Close</ModalButton>
          </ModalButtonContainer>
        </Modal>

        <ConfirmationModal isVisible={isConfirmationModalVisible}>
            <ModalMessage>Save Changes</ModalMessage>
            <ModalMessage>Are you sure you want to save changes?</ModalMessage>
            <ModalButtonContainer>
                <CancelButton onClick={handleCancelSave}>Cancel</CancelButton>
                <ConfirmButton onClick={handleConfirmSave}>Confirm</ConfirmButton>
            </ModalButtonContainer>
        </ConfirmationModal>
 
    </DashboardContainer>
  );
};

export default Dashboard;
