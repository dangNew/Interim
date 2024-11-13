import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt,FaPlus } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faUsers, faPlus, faFileContract, faSearch, faTicketAlt, faPen, faTrash, faCheck, faClipboard,faPlusCircle, faCogs} from '@fortawesome/free-solid-svg-icons';
import { rentmobileDb } from '../components/firebase.config';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';


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
  overflow: auto  ;
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
  padding: 1.5rem;
  border-radius: 10px; /* Less rounded for a more professional look */
  background-color: #ffffff;
  border: 1px solid #ddd;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  margin-bottom: 2rem;
  
  h3 {
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    font-weight: bold;
    text-align: center;
    color: #333;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
    color: #495057; /* Darker text for better contrast */
    margin-top: 20px;
    
    th, td {
      padding: 12px 15px; /* More padding for better readability */
      text-align: left;
      border-bottom: 1px solid #e2e6ea; /* Light border for separation */
      vertical-align: middle;
    }

    th {
      background-color: #f8f9fa; /* Subtle header background */
      color: #495057;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9; /* Alternating row colors */
    }

    tr:hover {
      background-color: #e9ecef; /* Highlight on hover */
    }

    .actions {
     margin-left: 0px;
      display: flex;
      justify-content: left;
      gap: 15px; /* Consistent spacing */
    }

    .icon {
     margin-left: 10px;
      font-size: 20px;
      color: #007bff; /* Blue icons for better visibility */
      justify-content: left;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: #0056b3; /* Darker blue on hover */
      }
    }
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
const AddTicketButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #28a745; /* Green color */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838; /* Darker green on hover */
  }

  .icon {
    margin-right: 10px;
    font-size: 1.2rem;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1rem;
`;

const CancelButton = styled(ModalButton)`
  background-color: #6c757d;
  color: white;

  &:hover {
    background-color: #5a6268;
  }
`;


const EditButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-right: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #218838;
  }
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #c82333;
  }
`;

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const sidebarRef = useRef(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRateId, setSelectedRateId] = useState(null);

    useEffect(() => {
      const fetchRates = async () => {
        try {
          const ratesCollection = collection(rentmobileDb, 'rate');
          const ratesSnapshot = await getDocs(ratesCollection);
          const ratesList = ratesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRates(ratesList);
        } catch (error) {
          console.error('Error fetching rates: ', error);
        }
      };
  
      fetchRates();
    }, [])
    
      const handleEdit = (id) => {
        // Navigate to the /ticketEdit route with the ticket ID as a parameter
        navigate(`/ticketEdit/${id}`);
      };
      
    
      


    const fetchRates = async () => {
        try {
          const ratesCollection = collection(rentmobileDb, 'rate');
          const ratesSnapshot = await getDocs(ratesCollection);
          const ratesList = ratesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRates(ratesList);
        } catch (error) {
          console.error('Error fetching rates: ', error);
        }
      };
    
      useEffect(() => {
        fetchRates();
      }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleAddTicket = () => {
    setLoading(true);
    navigate('/newticket');
  };

  const handleClickOutside = (event) => {
    
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

  const openModal = (id) => {
    setSelectedRateId(id);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRateId(null);
  };


  const handleDelete = async (id) => {
    try {
      const rateDocRef = doc(rentmobileDb, 'rate', id);
      await deleteDoc(rateDocRef);
      setRates(rates.filter(rate => rate.id !== id)); // Update the state to remove the deleted item
      closeModal(); // Close the modal after deletion
    } catch (error) {
      console.error('Error deleting rate: ', error); // You can keep this if needed for error handling
    }
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
            <h1>Manage Ticket</h1>
          </ProfileHeader>
          <AddTicketButton onClick={handleAddTicket} disabled={loading}>
  {loading ? 'Loading...' : 'Add New Ticket'}
</AddTicketButton>

          <FormContainer>
          
          <table>
            <thead>
              <tr>
                <th>TICKET NAME</th>
                <th>RATES</th>
                <th>DATE ISSUED</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
  {rates.map(rate => (
    <tr key={rate.id}>
      <td>{rate.fee_name}</td>
      <td>{rate.fee_rate}</td>
      <td>{new Date(rate.dateIssued).toLocaleDateString()}</td>
      <td className="actions">
                    <EditButton onClick={() => handleEdit(rate.id)}>
                      <FontAwesomeIcon icon={faPen} style={{ marginRight: '5px' }} />
                      Edit
                    </EditButton>
                    <DeleteButton onClick={() => openModal(rate.id)}>
                      <FontAwesomeIcon icon={faTrash} style={{ marginRight: '5px' }} />
                      Delete
                    </DeleteButton>
                  </td>
    </tr>
  ))}
</tbody>
          </table>

          {isModalOpen && (
  <ModalOverlay>
    <ModalContainer>
  <h3>Are you sure you want to delete this rate?</h3>
  <DeleteButton onClick={() => handleDelete(selectedRateId)}>Delete</DeleteButton>
  <CancelButton onClick={closeModal}>Cancel</CancelButton>
</ModalContainer>

  </ModalOverlay>
)}

        </FormContainer>

      </MainContent>
      </DashboardContainer>
  );
};

export default Dashboard;