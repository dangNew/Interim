import React, { useState, useEffect, useRef } from 'react';
import { Link,  useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt,FaUsers, FaWallet, FaEye,FaPen, FaTrash } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faCheck, faClipboard,faPlusCircle, faTrash, faEdit, faCogs,faSync} from '@fortawesome/free-solid-svg-icons';
import { rentmobileDb } from '../components/firebase.config';
import Modal from 'react-modal';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import IntSidenav from './IntSidenav';


const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
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
    const [spacesData, setSpacesData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSpaceId, setSelectedSpaceId] = useState(null);
    
    const navigate = useNavigate();

    const filteredSpaces = spacesData.filter(space =>
      space.spaceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearchChange = (event) => {
      setSearchTerm(event.target.value);
    };
    const handleDropdownToggle = (dropdown) => {
      setIsDropdownOpen(prevState => ({
        ...prevState,
        [dropdown]: !prevState[dropdown],
      }));
    };
    const fetchSpaces = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, 'Space'));
        const allSpaces = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSpacesData(allSpaces);
      } catch (error) {
        console.error('Error fetching spaces:', error);
      }
    };
    
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
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