import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faCheck, faPlusCircle, faCogs} from '@fortawesome/free-solid-svg-icons';
import { deleteDoc, doc, collection,getDocs } from 'firebase/firestore';
import { rentmobileDb } from '../components/firebase.config'; 
import { interimDb } from '../components/firebase.config'; 
import IntSidenav from './IntSidenav';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
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
  display: left;
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

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;


const Label = styled.label`
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  margin-right: 20px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  font-family: 'Inter', sans-serif;
`;
const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ isDelete }) => (isDelete ? '#d9534f' : '#188423')}; /* Red for delete, green for edit */
  font-size: 1.5rem; /* Font size for icons */
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1); /* Slightly enlarge the icon on hover */
  }

  &:focus {
    outline: none; /* Remove focus outline */
  }
`;

const Loading = styled.div`
  text-align: center;
  margin: 20px;
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

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
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
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen(prevState => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };
  const fetchStalls = async () => {
    try {
      const stallsRef = collection(rentmobileDb, 'Stall');
      const querySnapshot = await getDocs(stallsRef);
      const stallList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStalls(stallList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stalls: ', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStalls();
  }, []);

  const handleEdit = (id) => {
    navigate(`/editstall/${id}`); // Navigate to EditStall.js with the stall id
  };
  
  const handleDelete = async (id) => {
    try {
      const stallRef = doc(rentmobileDb, 'Stall', id);
      await deleteDoc(stallRef);
      fetchStalls(); // Refresh the stall list after deletion
    } catch (error) {
      console.error('Error deleting stall: ', error);
    }
  };

  // Extract unique locations for the dropdown filter
  const uniqueLocations = [...new Set(stalls.map((stall) => stall.location))];

  // Filter the stalls based on selected location and status
  const filteredStalls = stalls.filter(
    (stall) =>
      (locationFilter === '' || stall.location === locationFilter) &&
      (statusFilter === '' || stall.status === statusFilter)
  );

  // Separate available and occupied stalls
  const availableStalls = filteredStalls.filter((stall) => stall.status === 'Available');
  const occupiedStalls = filteredStalls.filter((stall) => stall.status === 'Occupied');

  // Concatenate available stalls first and then occupied stalls
  const sortedStalls = [...availableStalls, ...occupiedStalls];

  if (loading) {
  }

  
  
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
        <br></br>

        <br></br>


        <h3>List of Stalls</h3>
        <FormContainer>
        <FilterBar>
          <Label>
            Filter by Location:
            <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="">All Locations</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            Filter by Status:
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
            </Select>
          </Label>
        </FilterBar>
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Stall Number</th>
                <th>Size</th>
                <th>Rate per Meter</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStalls.length === 0 ? (
                <tr>
                  <td colSpan={6} align="center">No stalls found</td>
                </tr>
              ) : (
                sortedStalls.map((stall) => (
                  <tr key={stall.id}>
                    <td>{stall.location}</td>
                    <td>{stall.stallNumber}</td>
                    <td>{stall.stallSize}</td>
                    <td>{stall.ratePerMeter}</td>
                    <td>{stall.status}</td>
                    <td>
                      <ActionButton onClick={() => handleEdit(stall.id)}>
                        <FaPencilAlt />
                      </ActionButton>
                      <ActionButton isDelete onClick={() => handleDelete(stall.id)}>
                        <FaTrash />
                      </ActionButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        
        </FormContainer>

      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
