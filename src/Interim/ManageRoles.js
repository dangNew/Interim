import React, { useState } from 'react'; // Removed unused useEffect
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars } from 'react-icons/fa'; // Importing a hamburger icon from react-icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faCog, faTicketAlt} from '@fortawesome/free-solid-svg-icons';

const VendorContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '50px')};
  background-color: #f0f0f0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s;
  position: fixed;
  height: 100vh;
  z-index: 100;
`;

const SidebarMenu = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  flex: 15px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
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
  position: absolute;
  top: 10px;
  left: ${({ isSidebarOpen }) => (isSidebarOpen ? '200px' : '5px')};
  font-size: 2rem;
  color: #333;
  cursor: pointer;
  z-index: 200;
  transition: left 0.3s ease;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #fff;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;

  label {
    font-size: 14px;
    margin-bottom: 5px;
  }

  input, select, textarea {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    width: 100%;
  }

  .checkbox-group {
    display: flex;
    gap: 1rem;
  }

  .inline-group {
    display: flex;
    justify-content: space-between;

    div {
      flex: 1;
      margin-right: 10px;
    }

    div:last-child {
      margin-right: 0;
    }
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #4caf50;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    align-self: flex-end;

    &:hover {
      background-color: #45a049;
    }
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


const AddUnit = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleStallNoFilterChange = (event) => {
    setStallNoFilter(event.target.value);
  };
  
  // Moved this code outside of `handleStallNoFilterChange`
  // Fetch the logged-in user data
  useEffect(() => {
    try {
      const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
      if (loggedInUserData) {
        // Assuming you are fetching all users somewhere, otherwise fetch it
        const currentUser = stallHolders.find(user => user.email === loggedInUserData.email);
        setLoggedInUser(currentUser || loggedInUserData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [stallHolders]); // Add stallHolders as a dependency to ensure it runs when they are fetched
  
  
  return (
    <>
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>

      <VendorContainer>
      <Sidebar ref={sidebarRef} isSidebarOpen={isSidebarOpen}>
        <Link to="/profile" style={{ textDecoration: 'none' }}>
        <ProfileHeader isSidebarOpen={isSidebarOpen}>
        {loggedInUser && loggedInUser.Image ? (
          <ProfileImage src={loggedInUser.Image} alt={`${loggedInUser.firstName} ${loggedInUser.lastName}`} />
        ) : (
          <FaUserCircle className="profile-icon" />
        )}
        <span className="profile-name">{loggedInUser ? `${loggedInUser.firstName} ${loggedInUser.lastName}` : 'Guest'}</span>
      </ProfileHeader>
      </Link>

       

        <SearchBarContainer isSidebarOpen={isSidebarOpen}>
          <FaSearch />
          <SearchInput type="text" placeholder="Search..." />
        </SearchBarContainer>
        
        <SidebarMenu>
  <Link to="/dashboard" style={{ textDecoration: 'none' }}>
    <SidebarItem isSidebarOpen={isSidebarOpen}>
      <span>🏠</span>
      <span>Dashboard</span>
    </SidebarItem>
  </Link>
  <Link to="/list" style={{ textDecoration: 'none' }}>
              <SidebarItem isSidebarOpen={isSidebarOpen}>
                <span>🛍️</span>
                <span>List of Vendors</span>
              </SidebarItem>
            </Link>

  <SidebarItem isSidebarOpen={isSidebarOpen} onClick={handleDropdownToggle}>
    <span>👤</span>
    <span>User Management</span>
    <span style={{ marginLeft: 'auto' }}>&gt;</span>
  </SidebarItem>

  {isDropdownOpen && (
    <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
      <Link to="/usermanagement" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <span>🔍</span>
            <span>View Users</span>
          </SidebarItem>
        </li>
      </Link>
      <Link to="/newuser" style={{ textDecoration: 'none' }}>
        <li>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <span>➕</span>
            <span>Add User</span>
          </SidebarItem>
        </li>
      </Link>
    </ul>
  )}

        <Link to="/viewunit" style={{ textDecoration: 'none' }}>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <span>➕</span>
            <span>Add New Unit</span>
          </SidebarItem>
        </Link>

        <Link to="/manage-roles" style={{ textDecoration: 'none' }}>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <span>👥</span>
            <span>Manage Roles</span>
          </SidebarItem>
        </Link>

        <Link to="/contract" style={{ textDecoration: 'none' }}>
          <SidebarItem isSidebarOpen={isSidebarOpen}>
            <span>📄</span>
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
            <span>⚙️</span>
            <span>Settings</span>
          </SidebarItem>
        </Link>
      </SidebarMenu>
              </Sidebar>

        <MainContent isSidebarOpen={isSidebarOpen}>
          <ProfileHeader>
            <h1>Add New Unit</h1>
          </ProfileHeader>
          <FormContainer>
            <div className="inline-group">
              <div>
                <label htmlFor="unitId">UNIT ID</label>
                <input id="unitId" type="text" placeholder="Unit ID" />
              </div>
              <div>
                <label htmlFor="unitName">UNIT NAME</label>
                <input id="unitName" type="text" placeholder="Unit Name" />
              </div>
            </div>

            <label htmlFor="location">Location</label>
            <input id="location" type="text" placeholder="Location" />

            <label htmlFor="contactNumber">Contact Number</label>
            <input id="contactNumber" type="text" placeholder="Contact Number" />

            <div className="checkbox-group">
              <label>
                <input type="checkbox" /> OIC (Office in Charge)
              </label>
              <label>
                <input type="checkbox" /> Collector
              </label>
            </div>

            <button type="submit">ADD UNIT</button>
          </FormContainer>
        </MainContent>
      </VendorContainer>
    </>
  );
};

export default AddUnit;
