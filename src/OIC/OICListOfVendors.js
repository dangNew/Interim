import React, { useState, useEffect } from 'react';
import { FaSearch, FaBars, FaPencilAlt, FaTrash } from 'react-icons/fa';
import styled from 'styled-components';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { interimAuth, stallholderDb, interimDb } from '../components/firebase.config'; 
import SideNav from './side_nav'; 
import { useNavigate } from 'react-router-dom'; 

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '70px')};
  padding-left: 40px;
  background-color: #fff;
  padding: 2rem;
  width: 100%;
  transition: margin-left 0.3s ease;
  overflow-y: auto;

  & > *:not(:first-child) {
    margin-top: 20px;
  }
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 50px;
  background-color: #188423;
  color: white;
  font-size: 22px;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
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


const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;

  table {
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;

    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #ddd;
      font-family: 'Inter', sans-serif; // Use a consistent font

      &:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
      }

      &:last-child {
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
      }
    }

    th {
      background-color: #188423;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }

    tr:hover {
      background-color: #f5f5f5;
    }
  }
`;

const SummaryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #e9f7e3;
  padding: 15px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #188423;
  margin-bottom: 20px;
  border: 2px solid #188423;
`;

const ActionIcon = styled.button`
  background: none; /* No background */
  border: none; /* No border */
  cursor: pointer; /* Pointer cursor */
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



const SummaryText = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  color: #188423;

  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: bold;
  }

  p {
    margin: 0;
    color: #888;
    font-size: 14px;
  }
`;

const FilterButton = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background-color: #188423;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #145c17;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 200px;

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
      padding: 10px;
      cursor: pointer;

      &:hover {
        background-color: #f0f0f0;
      }
    }
  }
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 20px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
  font-size: 16px;
  color: #333;
`;

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    if (onSearch) {
      onSearch(event.target.value);
    }
  };

  return (
    <SearchBarContainer>
      <FaSearch color="#333" />
      <SearchInput
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
      />
    </SearchBarContainer>
  );
};

const OICListOfVendors = () => {
  const [stallHolders, setStallHolders] = useState([]);
  const [filteredStallHolders, setFilteredStallHolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unitNames, setUnitNames] = useState([]); // New state for unit names
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setIsDropdownOpen(false);

    if (location === 'All Locations') {
      setFilteredStallHolders(stallHolders);
    } else {
      const filtered = stallHolders.filter(stall => stall.location === location);
      setFilteredStallHolders(filtered);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = stallHolders.filter(stall =>
      (stall.firstName.toLowerCase().includes(term.toLowerCase()) ||
      stall.lastName.toLowerCase().includes(term.toLowerCase()) ||
      stall.stallNumber.includes(term)) &&
      (selectedLocation === 'All Locations' || stall.location === selectedLocation)
    );
    setFilteredStallHolders(filtered);
  };

  const handleEditClick = (stallId) => {
    navigate(`/edit-vendors/${stallId}`);
  };

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const user = interimAuth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(interimDb, 'users', user.uid));
        if (userDoc.exists()) {
          setLoggedInUser(userDoc.data());
        }
      }
    };

    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    const fetchUnitNames = async () => {
      const unitSnapshot = await getDocs(collection(stallholderDb, 'units'));
      const units = unitSnapshot.docs.map(doc => doc.data().unitName);
      setUnitNames(units);
    };

    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(stallholderDb, 'approvedVendors'));
      const data = querySnapshot.docs.map((doc) => {
        const stallInfo = doc.data().stallInfo || {};
        const dateOfRegistration = doc.data().dateOfRegistration
          ? doc.data().dateOfRegistration.toDate().toLocaleDateString()
          : '';

        return {
          id: doc.id,
          stallNumber: stallInfo.stallNumber || '',
          firstName: doc.data().firstName || '',
          lastName: doc.data().lastName || '',
          dateOfRegistration,
          location: stallInfo.location || '',
        };
      });

      setStallHolders(data);
      setFilteredStallHolders(data); // Initialize filtered list
    };

    fetchUnitNames();
    fetchData();
  }, []);

  const handleDelete = async (stallId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this vendor?');
    if (confirmDelete) {
      try {
        await deleteDoc(doc(stallholderDb, 'approvedVendors', stallId));
        setFilteredStallHolders(filteredStallHolders.filter(stall => stall.id !== stallId));
        setStallHolders(stallHolders.filter(stall => stall.id !== stallId)); // Update the original list too
      } catch (error) {
        console.error('Error deleting vendor:', error);
      }
    }
  };
  

  return (
    <DashboardContainer>
      <SideNav isSidebarOpen={isSidebarOpen} loggedInUser={loggedInUser} />
      <ToggleButton onClick={toggleSidebar}>
          <FaBars />
        </ToggleButton>
      <MainContent isSidebarOpen={isSidebarOpen}>
        <AppBar>
          <ToggleButton isSidebarOpen={isSidebarOpen} onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          <div>{loggedInUser?.name || 'User'}</div>
        </AppBar>

        <SummaryContainer>
          <SummaryText>
            <h3>Stall Holders List</h3>
            <p>Total: {filteredStallHolders.length}</p>
          </SummaryText>
          <FilterButton>
            <DropdownButton onClick={toggleDropdown}>
              {selectedLocation} <span style={{ marginLeft: '10px' }}>▼</span>
            </DropdownButton>
            {isDropdownOpen && (
              <DropdownMenu>
                <ul>
                  <li onClick={() => handleLocationSelect('All Locations')}>All Locations</li>
                  {unitNames.map((unitName, index) => (
                    <li key={index} onClick={() => handleLocationSelect(unitName)}>
                      {unitName}
                    </li>
                  ))}
                </ul>
              </DropdownMenu>
            )}
          </FilterButton>
        </SummaryContainer>

        <SearchBar onSearch={handleSearch} />

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Stall Number</th>
                <th>Date of Registration</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStallHolders.map((stallHolder) => (
                <tr key={stallHolder.id}>
                  <td>{`${stallHolder.firstName} ${stallHolder.lastName}`}</td>
                  <td>{stallHolder.stallNumber}</td>
                  <td>{stallHolder.dateOfRegistration}</td>
                  <td>{stallHolder.location}</td>
                  <td>
                  <ActionIcon onClick={() => handleEditClick(stallHolder.id)}>
                    <FaPencilAlt />
                  </ActionIcon>
                  <ActionIcon isDelete onClick={() => handleDelete(stallHolder.id)}>
                    <FaTrash />
                  </ActionIcon>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default OICListOfVendors;
