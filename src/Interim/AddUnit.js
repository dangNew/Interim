import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faCheck, faPlusCircle, faCogs } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { interimDb, rentmobileDb } from '../components/firebase.config'; // Import the correct firestore instance

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
  border: 1px solid #ddd;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
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
  background-color: #188423;
  color: white;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
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

const FormContainer = styled.div`
  margin-top: 2rem;
  padding: 3rem;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'Roboto', sans-serif;

  h3 {
    margin-bottom: 2rem;
    color: #343a40;
    font-size: 26px;
    font-weight: 700;
    text-align: center;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    th {
      background-color: #f8f9fa;
      font-weight: 700;
      color: #495057;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    tr:hover {
      background-color: #e9ecef;
      transition: background-color 0.3s ease;
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

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const InputField = styled.div`
  position: relative;
  margin-bottom: 1.5rem;

  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    color: #495057;
    transition: border-color 0.3s ease;

    &:focus {
      border-color: #188423;
      outline: none;
    }
  }

  label {
    position: absolute;
    top: -10px;
    left: 12px;
    background-color: #ffffff;
    color: #6c757d;
    font-size: 14px;
    padding: 0 5px;
    transition: all 0.3s ease;
    font-family: 'Roboto', sans-serif;
  }
`;

const SaveButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background-color: #218838;
  }
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [unitName, setUnitName] = useState('');
  const [location, setLocation] = useState('');
  const [dateRegistered, setDateRegistered] = useState(new Date().toISOString().split('T')[0]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSaveUnit = async () => {
    if (!unitName.trim() || !location.trim() || !dateRegistered) {
      alert('Please fill in all fields before saving.');
      return;
    }
    try {
      console.log('Saving unit with data:', {
        name: unitName,
        location: location,
        dateRegistered: dateRegistered,
      });

      const docRef = await addDoc(collection(rentmobileDb, 'unit'), {
        name: unitName,
        location: location,
        dateRegistered: dateRegistered,
      });

      console.log('Document written with ID: ', docRef.id);
      alert('Unit saved successfully!');

      setUnitName('');
      setLocation('');
      setDateRegistered(new Date().toISOString().split('T')[0]);
    } catch (e) {
      console.error('Error adding document: ', e);
      alert('Error saving unit: ' + e.message);
    }
  };

  useEffect(() => {
    const checkAndCreateCollection = async () => {
      const unitsCollection = collection(rentmobileDb, 'unit');
      const unitsSnapshot = await getDocs(unitsCollection);

      if (unitsSnapshot.empty) {
        try {
          await addDoc(unitsCollection, {
            name: 'Default Unit',
            location: 'Default Location',
            dateRegistered: new Date().toISOString().split('T')[0],
          });
          console.log('Default collection created with a default unit.');
        } catch (error) {
          console.error('Error creating default collection: ', error);
        }
      }
    };

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

    checkAndCreateCollection();
    fetchUserData();
  }, []);

  const handleClickOutside = (event) => {
    // Implement click outside logic if needed
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        <AppBar>
          <ToggleButton onClick={toggleSidebar}>
            <FaBars />
          </ToggleButton>
          <div>LIST OF VENDORS</div>
        </AppBar>

        <ToggleButton isSidebarOpen={isSidebarOpen} onClick={toggleSidebar}>
          <FaBars />
        </ToggleButton>

        <FormContainer>
          <h3>Add Unit</h3>

          <InputField>
            <input
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              placeholder=" "
              required
            />
            <label>Unit Name</label>
          </InputField>

          <InputField>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder=" "
              required
            />
            <label>Location</label>
          </InputField>

          <InputField>
            <input
              type="date"
              value={dateRegistered}
              onChange={(e) => setDateRegistered(e.target.value)}
              required
            />
            <label>Date Registered</label>
          </InputField>

          <SaveButton onClick={handleSaveUnit}>Save Unit</SaveButton>
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
