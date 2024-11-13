import React, { useState, useEffect, useRef } from 'react';
import { Link,  useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt,FaUsers, FaWallet, FaEye,FaPen, FaTrash } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faCheck, faClipboard,faPlusCircle, faTrash, faEdit, faCogs,faSync} from '@fortawesome/free-solid-svg-icons';
import { rentmobileDb } from '../components/firebase.config';
import Modal from 'react-modal';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
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

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 15px;
  background-color: #f8f9fa;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    border: 1px solid #ddd;

    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }

    th {
      background-color: #188423;
      font-weight: bold;
      color: #ffffff;
      font-size: 16px;
    }
      tr:nth-child(even) {
      background-color: #f2f2f2;/* Alternating row colors */
    }
      tr:nth-child(odd) {
      background-color: #ffffff; // White for odd rows
    }


    tr:hover {
      background-color: #e9ecef; /* Highlight on hover */
    }

    td:last-child {
      width: 150px; /* Adjust width as needed to fit both buttons */
    }

    .button-container {
      display: flex;
      gap: 10px; 
      align-items: center; /* Aligns buttons vertically */
    }

    .edit-btn, .delete-btn {
      padding: 8px 12px;
      font-size: 14px;
      border: none;
      color: #ffffff;
      cursor: pointer;
      border-radius: 5px;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: background-color 0.3s ease;
    }

    .edit-btn {
      background-color: #28a745; /* Green */
    }

    .delete-btn {
      background-color: #dc3545; /* Red */
    }

    .edit-btn:hover {
      background-color: #218838;
    }

    .delete-btn:hover {
      background-color: #c82333;
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
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const ModalMessage = styled.p`
  font-size: 1rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const ConfirmButton = styled.button`
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #218838;
  }
`;

const CancelButton = styled.button`
  background-color: #dc3545;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #c82333;
  }
`;
const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Adjust the space between the buttons */
`;

const AddButton = styled.button`
  background-color: #008000;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

const RefreshButton = styled.button`
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;
const SearchContainer = styled.div`
  position: relative; /* Positioning for the icon */
  margin-bottom: 1rem;
`;

const SearchInpu = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 0.5rem 2.5rem 0.5rem 2rem; /* Add padding to make room for the icon */
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    border-color: #007bff; /* Change border color on focus */
    outline: none; /* Remove outline */
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 10px; /* Position the icon */
  top: 50%;
  transform: translateY(-50%); /* Center the icon vertically */
  color: #aaa; /* Color of the icon */
`;

  const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const sidebarRef = useRef(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [spacesData, setSpacesData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpaceId, setSelectedSpaceId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const filteredSpaces = spacesData.filter(space =>
      space.spaceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchSpaces = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, 'Space'));
        const allSpaces = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSpacesData(allSpaces);
      } catch (error) {
        console.error('Error fetching spaces:', error);
      } finally {
        setLoading(false);
      }
    };
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    const handleClickOutside = (event) => {
    
    };
    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    useEffect(() => {
      const fetchSpaces = async () => {
        try {
          const querySnapshot = await getDocs(collection(rentmobileDb, 'Space')); // Fetching from 'Space' collection
          const allSpaces = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Adding doc.id for potential actions
          setSpacesData(allSpaces);
        } catch (error) {
          console.error('Error fetching spaces:', error);
        }
      };

      fetchSpaces(); // Call the function to fetch spaces
    }, []);
  ;

  const handleAddNewSpaceClick = () => {
    navigate('/addspace');
  };
  const handleEditClick = (spaceId) => {
    navigate(`/editspace/${spaceId}`);
};

  const handleDeleteClick = (spaceId) => {
    setSelectedSpaceId(spaceId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedSpaceId) {
      try {
        // Deleting the document from Firestore
        await deleteDoc(doc(rentmobileDb, 'Space', selectedSpaceId));
        
        // Updating local state by filtering out the deleted space
        setSpacesData(spacesData.filter(space => space.id !== selectedSpaceId));
  
        // Closing the modal and resetting the selected space ID
        setIsModalOpen(false);
        setSelectedSpaceId(null);
        
        // Optional: Display a success message here if needed
        console.log("Space deleted successfully.");
  
      } catch (error) {
        console.error('Error deleting space:', error);
      }
    }
  };
  

  const cancelDelete = () => {
    setIsModalOpen(false);
    setSelectedSpaceId(null);
  };


    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const querySnapshot = await getDocs(collection(rentmobileDb, 'ambulant_collector'));
          const allUsers = querySnapshot.docs.map(doc => doc.data());

          console.log('Fetched Users:', allUsers); 
          const validUsers = allUsers.filter(user => user.email && user.firstName && user.lastName);
        
          
      

          const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
          if (loggedInUserData) {
            const currentUser = allUsers.find(user => user.email === loggedInUserData.email);
            setLoggedInUser(currentUser || loggedInUserData);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };

      fetchUsers();
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
              <h1>View Space </h1>
            </ProfileHeader>
  <FormContainer>
  
  <SearchContainer>
      {/* Search Icon */}
      <SearchIcon>
        <FontAwesomeIcon icon={faSearch} />
      </SearchIcon>

      {/* Search Input */}
      <SearchInpu
        type="text"
        placeholder="Search by Space Number"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
    </SearchContainer>

      {/* Button Container for Refresh and Add Buttons */}
      <ButtonContainer>
        {/* Refresh Button with Icon */}
        <RefreshButton onClick={fetchSpaces} style={{ display: 'flex', alignItems: 'center' }}>
          <FontAwesomeIcon icon={faSync} spin style={{ marginRight: '0.5rem' }} />
        </RefreshButton>

        {/* Add New Space Button */}
        <AddButton onClick={handleAddNewSpaceClick}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} /> Add New Space
        </AddButton>
      </ButtonContainer>
      <br></br>

           
          {loading ? <p>Loading spaces...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Space Number</th>
                  <th>Rate</th>
                  <th>Size</th>
                  <th>Zone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {spacesData.map((space) => (
                  <tr key={space.id}>
                    <td>{space.spaceNumber}</td>
                    <td>{space.rate}</td>
                    <td>{space.size}</td>
                    <td>{space.zone}</td>
                    <td>
              <div className="button-container">
                <button className="edit-btn" onClick={() => handleEditClick(space.id)}>
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </button>
                <button className="delete-btn" onClick={() => handleDeleteClick(space.id)}>
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </FormContainer>

          {isModalOpen && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>Confirm Delete</ModalTitle>
              <ModalMessage>Are you sure you want to delete this space?</ModalMessage>
              <ModalActions>
                <ConfirmButton onClick={confirmDelete}>Confirm</ConfirmButton>
                <CancelButton onClick={cancelDelete}>Cancel</CancelButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </MainContent>
    </DashboardContainer>
  );
};

// Define styles for missing modal elements, SidebarFooter, LogoutButton, etc.

export default Dashboard;