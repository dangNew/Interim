import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaSearch, FaUserCircle, FaFilter, FaPrint } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faCheck, faClipboard, faPlusCircle, faEye, faCogs } from '@fortawesome/free-solid-svg-icons';
import { FaSignOutAlt } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { rentmobileDb } from '../components/firebase.config';
import { interimDb } from '../components/firebase.config';
import ConfirmationModal from './ConfirmationModal'; // Import the modal component

const ROWS_PER_PAGE = 10;

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
  overflow: auto;
  max-height: 100vh;
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

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 50px; /* Added margin to avoid overlapping with AppBar */

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background-color: ${({ bgColor }) => bgColor || '#f4f4f4'};
  padding: 3rem;
  border-radius: 12px;
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
      color: #333;
      font-weight: bold;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    tr:nth-child(odd) {
      background-color: #ffffff;
    }

    tr:hover {
      background-color: #f1f3f5; /* Highlight row on hover */
    }
  }

  .view-btn {
    padding: 8px 12px;
    font-size: 14px;
    border: none;
    color: #ffffff;
    background-color: #007bff; /* Blue */
    cursor: pointer;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: background-color 0.3s ease;
  }

  .view-btn:hover {
    background-color: #0056b3;
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

const SearchBarCont = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  padding-left: 100px; /* Add more padding on the left */
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ced4da;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  margin: 30px 0; /* Remove auto centering */
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #6c757d;
  font-size: 1.2em;
`;

const SearchIn = styled.input`
  border: none;
  background: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
  font-size: 1em;
  color: #495057;

  ::placeholder {
    color: #adb5bd;
  }

  &:focus {
    color: #212529;
  }
`;
const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PrintButton = styled.button`
  background-color: #188423; /* Match the AppBar color */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  &:hover {
    background-color: #155724; /* Darker shade for hover */
  }

  svg {
    margin-right: 5px; /* Space between icon and text */
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 20px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  background-color: #e9ecef;
  border: none;
  border-radius: 5px;
  padding: 12px 20px;
  cursor: pointer;
  height: 35px;

  &:hover {
    background-color: #d3d3d3;
  }

  svg {
    margin-right: 2px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem; /* Space between buttons */
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px; /* Spacing between buttons */
  margin-top: 20px;
`;

const PageButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1.1rem; /* Larger font */
  min-width: 50px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05); /* Slightly enlarges on hover */
  }

  &:disabled {
    background-color: #c3c3c3;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    padding: 10px 14px;
    font-size: 1rem;
  }
`;

const CurrentPageIndicator = styled.span`
  margin: 0 8px;
  font-size: 1.2rem;
  color: #333;
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background-color: #007bff; /* Match the AppBar color */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  &:hover {
    background-color: #155724; /* Darker shade for hover */
  }

  svg {
    margin-right: 5px; /* Space between icon and text */
  }
`;

const DropdownContent = styled.div`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
`;

const DropdownItem = styled.div`
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;

  &:hover {
    background-color: #ddd;
  }
`;

const ViewButton = styled.button`
  background-color: #28a745; /* Green color */
  color: white;
  border: none;
  padding: 8px 16px; /* Increased padding for a larger button */
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem; /* Increased font size for better readability */

  &:hover {
    background-color: #218838; /* Darker green on hover */
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stallHolders, setStallHolders] = useState([]);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0); // State to store
  const [filteredStallHolders, setFilteredStallHolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [stallNoFilter, setStallNoFilter] = useState('');
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('Select Unit');
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleView = (stallHolder) => {
    setSelectedStallHolder(stallHolder);
    setIsModalOpen(true);
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setIsDropdownOpen(false);
    setFilteredStallHolders(unit === 'All' ? stallHolders : stallHolders.filter(stall => stall.location === unit));
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const querySnapshot = await getDocs(collection(interimDb, 'unit'));
        const unitData = querySnapshot.docs.map(doc => doc.data().name);
        setUnits(['All', ...unitData]); // Add "All" as the first option
      } catch (error) {
        console.error("Error fetching units:", error);
      }
    };

    fetchUnits();
  }, []);

  const totalPages = Math.ceil(filteredStallHolders.length / itemsPerPage);

  const currentStallHolders = filteredStallHolders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(rentmobileDb, 'approvedVendors'));

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
          location: stallInfo.location || '',
          areaMeters: stallInfo.stallSize || '',
          billing: stallInfo.ratePerMeter || '',
          date: dateOfRegistration,
        };
      });

      console.log(data);
      setStallHolders(data);
      setTotalUsers(data.length);

      let filteredData = data;

      if (selectedUnit !== 'Select Unit') {
        filteredData = filteredData.filter(stall => stall.location === selectedUnit);
      }

      setFilteredStallHolders(filteredData);
    };

    fetchData();
  }, [selectedUnit]);

  useEffect(() => {
    if (selectedUnit === 'All') {
      setFilteredStallHolders(stallHolders); // Show all stallholders when "All" is selected
    } else if (selectedUnit !== 'Select Unit') {
      setFilteredStallHolders(stallHolders.filter(stall => stall.location === selectedUnit));
    }
  }, [selectedUnit, stallHolders]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStallHolder, setSelectedStallHolder] = useState(null);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStallHolder(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    let filteredData = stallHolders.filter(stall =>
      stall.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (stallNoFilter) {
      filteredData = filteredData.filter(stall => stall.stallNumber === stallNoFilter);
    }
    if (selectedUnit !== 'Select Unit') {
      filteredData = filteredData.filter(stall => stall.location === selectedUnit);
    }

    setFilteredStallHolders(filteredData);
  }, [searchTerm, stallHolders, stallNoFilter, selectedUnit]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Print</title>
          <style>
            body { font-family: 'Inter', sans-serif; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th, td { padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6; }
            th { background-color: #e9ecef; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            h3 { text-align: center; }
          </style>
        </head>
        <body>
          <h3>CARBON MARKET</h3>
          <table>
            <thead>
              <tr>
                <th>Stall No.</th>
                <th>Stall Holder</th>
                <th>Unit</th>
                <th>Area (Meters)</th>
                <th>Rate Per Meter</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStallHolders.map(stall => `
                <tr>
                  <td>${stall.stallNumber}</td>
                  <td>${stall.firstName} ${stall.lastName}</td>
                  <td>${stall.location}</td>
                  <td>${stall.areaMeters}</td>
                  <td>${stall.billing}</td>
                  <td>${stall.date}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.print();
    newWindow.close();
  };

  useEffect(() => {
    try {
      const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
      if (loggedInUserData) {
        const currentUser = stallHolders.find(user => user.email === loggedInUserData.email);
        setLoggedInUser(currentUser || loggedInUserData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [stallHolders]);

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
          <SearchInput
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
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

          <SidebarItem isSidebarOpen={isSidebarOpen} onClick={toggleDropdown}>
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

          <SidebarItem isSidebarOpen={isSidebarOpen} onClick={toggleDropdown}>
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

          <SidebarItem isSidebarOpen={isSidebarOpen} onClick={toggleDropdown}>
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
        <AppBar>
          <ToggleButton onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          <div>LIST OF VENDORS</div>
        </AppBar>

        <TopBarContainer>
          <SearchBarCont>
            <SearchIcon />
            <SearchIn
              type="text"
              placeholder="Search Stall Holders..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </SearchBarCont>

          <ButtonContainer>
            <PrintButton onClick={handlePrint}>
              <FaPrint />
              Print
            </PrintButton>
            <DropdownContainer>
              <DropdownButton onClick={toggleDropdown}>
                {selectedUnit}
              </DropdownButton>
              <DropdownContent isOpen={isDropdownOpen}>
                {units.map((unit, index) => (
                  <DropdownItem key={index} onClick={() => handleUnitSelect(unit)}>
                    {unit}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </DropdownContainer>
          </ButtonContainer>
        </TopBarContainer>

        <FormContainer>
          <table>
            <thead>
              <tr>
                <th>Stall No.</th>
                <th>Stall Holder</th>
                <th>Unit</th>
                <th>Area (Meters)</th>
                <th>Rate Per Meter</th>
                <th>Date</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStallHolders.map((stall, index) => (
                <tr key={index}>
                  <td>{stall.stallNumber}</td>
                  <td>{stall.firstName} {stall.lastName}</td>
                  <td>{stall.location}</td>
                  <td>{stall.areaMeters}</td>
                  <td>{stall.billing}</td>
                  <td>{stall.date}</td>
                  <td>
                    <button className="view-btn" onClick={() => handleView(stall)}>
                      <FontAwesomeIcon icon={faEye} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormContainer>

        <PaginationContainer>
          <PageButton onClick={handlePrevPage} disabled={currentPage === 1}>
            Prev
          </PageButton>
          <CurrentPageIndicator>
            Page {currentPage} of {totalPages}
          </CurrentPageIndicator>
          <PageButton onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </PageButton>
        </PaginationContainer>

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          message="View Stall Holder"
          stallHolder={selectedStallHolder}
        />
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
