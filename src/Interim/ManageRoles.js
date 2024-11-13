import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faCheck, faCog } from '@fortawesome/free-solid-svg-icons';

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
    font-size: 1rem;
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
    color: #6c757d;
  }

  .profile-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: black;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
  }

  hr {
    width: 100%;
    border: 0.5px solid #ccc;
    margin-top: 15px;
  }

  .profile-position {
    font-size: 1rem;
    font-weight: 600;
    color: #007bff;
    display: ${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
    margin-top: 5px;
  }
`;

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

const SidebarFooter = styled.div`
  padding: 10px;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: ${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
`;

const LogoutButton = styled(SidebarItem)`
  margin-top: 5px;
  background-color: #dc3545;
  color: white;
  align-items: center;
  margin-left: 20px;
  padding: 5px 15px;
  border-radius: 5px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #c82333;
    transform: scale(1.05);
  }
`;

const ManageRoles = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    // Redirect to login page or home page
  };

  useEffect(() => {
    try {
      const loggedInUserData = JSON.parse(localStorage.getItem('userData'));
      if (loggedInUserData) {
        setLoggedInUser(loggedInUserData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  return (
    <>
      <ToggleButton onClick={toggleSidebar}>
        <FaBars />
      </ToggleButton>

      <VendorContainer>
        <Sidebar isSidebarOpen={isSidebarOpen}>
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

            <Link to="/stalls" style={{ textDecoration: 'none' }}>
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
                <Link to="/View" style={{ textDecoration: 'none' }}>
                  <li>
                    <SidebarItem isSidebarOpen={isSidebarOpen}>
                      <FontAwesomeIcon icon={faSearch} className="icon" />
                      <span> View Collector</span>
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

export default ManageRoles;
