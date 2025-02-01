import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faTicketAlt, faClipboard, faCheck, faPlusCircle, faCogs } from '@fortawesome/free-solid-svg-icons';
import { query, where, serverTimestamp, getDocs, updateDoc, collection, addDoc, doc } from 'firebase/firestore';
import { rentmobileDb } from '../components/firebase.config'; // Import the correct firestore instance
import CarbonLogo from '../CarbonLogo/472647195_1684223168803549_1271657271156175542_n.jpg';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: \\${({ isSidebarOpen }) => (isSidebarOpen ? '230px' : '60px')};
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
  justify-content: \\${({ isSidebarOpen }) => (isSidebarOpen ? 'flex-start' : 'center')};
  padding: 10px;
  margin-bottom: 10px;
  margin-top: -10px;
  border-radius: 8px;
  font-size: 14px;
  color: \\${({ active }) => (active ? 'white' : '#333')};
  background-color: \\${({ active }) => (active ? '#007bff' : 'transparent')};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: \\${({ active }) => (active ? '#007bff' : '#f1f3f5')};
  }

  .icon {
    font-size: 1rem;
    color: #000;
    transition: margin-left 0.2s ease;
  }

  span:last-child {
    margin-left: 10px;
    display: \\${({ isSidebarOpen }) => (isSidebarOpen ? 'inline' : 'none')};
  }
`;

const ToggleButton = styled.div`
  display: \\${({ isSidebarOpen }) => (isSidebarOpen ? 'none' : 'block')};
  position: absolute;
  top: 5px;
  left: 15px;
  font-size: 1.8rem;
  color: #333;
  cursor: pointer;
  z-index: 200;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")};
  padding: 2rem;
  background-color: #fff;
  width: calc(100% - ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")});
  transition: margin-left 0.3s ease, width 0.3s ease;
  overflow-y: auto;
`;

const AppBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #ffffff;
  color: #333;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 1.5rem;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
`;

const Logo = styled.img`
  height: 40px;
  margin-right: 1rem;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
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
    display: \\${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
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
    display: \\${({ isSidebarOpen }) => (isSidebarOpen ? 'block' : 'none')};
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
  margin: 0 auto;
  font-family: 'Roboto', sans-serif;

  h2 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
  }

  .assign-collector-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: #f4f4f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .assign-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 14px;
    color: #555;
    margin-bottom: 5px;
  }

  select {
    padding: 12px 15px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #ffffff;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;

    &:focus {
      border-color: #4CAF50;
      box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
      outline: none;
    }
  }

  .assign-btn {
    padding: 12px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 15px;
    font-size: 16px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #45A049;
    }
  }

  .assignment-table {
    margin-top: 20px;
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 12px;
      text-align: left;
      border: 1px solid #ddd;
    }

    th {
      background-color: #4CAF50;
      color: white;
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
  const [stallholders, setStallholders] = useState([]);
  const [zoneAssignments, setZoneAssignments] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [collectorZones, setCollectorZones] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const navigate = useNavigate();

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleDropdownToggle = (dropdown) => {
    setIsDropdownOpen(prevState => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };

  const fetchStallholders = async () => {
    const stallholderCollection = collection(rentmobileDb, 'users');
    const stallholderSnapshot = await getDocs(stallholderCollection);
    const stallholderList = stallholderSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStallholders(stallholderList.filter(stallholder => stallholder.email));
  };

  const fetchCollectors = async () => {
    const collectorCollection = collection(rentmobileDb, 'ambulant_collector');
    const collectorSnapshot = await getDocs(collectorCollection);
    const collectorList = collectorSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const filteredCollectors = collectorList.filter(collector => collector.firstName && collector.lastName && collector.collector);
    setCollectors(filteredCollectors);
  };

  const fetchZones = async () => {
    const zoneSnapshot = await getDocs(collection(rentmobileDb, 'zone'));
    setZones(zoneSnapshot.docs.map(doc => doc.data().zone));
  };

  const fetchAssignments = async () => {
    const assignmentsCollection = collection(rentmobileDb, 'ambulant_collector');
    const assignmentSnapshot = await getDocs(assignmentsCollection);
    const assignments = assignmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCurrentAssignments(assignments);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchStallholders();
      await fetchCollectors();
      await fetchZones();
      await fetchAssignments();
    };

    fetchData();
  }, []);

  const handleAssign = async () => {
    if (selectedCollector && selectedZone) {
      const collectorDetails = collectors.find(collector =>
        `${collector.firstName} ${collector.lastName} ${collector.middleName || ''}`.trim() === selectedCollector
      );

      if (collectorDetails) {
        try {
          const collectorRef = doc(rentmobileDb, 'ambulant_collector', collectorDetails.id);
          await updateDoc(collectorRef, { zone: selectedZone });

          setAssignments(prevAssignments => [
            ...prevAssignments,
            { collector: `${collectorDetails.firstName} ${collectorDetails.lastName}`, zone: selectedZone }
          ]);

          setSelectedCollector('');
          setSelectedZone('');
        } catch (error) {
          console.error("Error updating zone: ", error);
        }
      } else {
        console.error("Collector details not found for:", selectedCollector);
      }
    } else {
      console.warn("Either collector or zone is not selected.");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event) => {
    // Implement click outside logic if needed
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



  const handleZoneChange = (id, newZone) => {
    setZoneAssignments(prevAssignments =>
      prevAssignments.map(assignment =>
        assignment.id === id ? { ...assignment, zone: newZone } : assignment
      )
    );
  };

  const handleCollectorZoneChange = (collectorId, newZone) => {
    setCollectorZones(prevZones => ({
      ...prevZones,
      [collectorId]: newZone,
    }));
  };

  const handleRowSelect = (email) => {
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(email)) {
        newSelected.delete(email);
      } else {
        newSelected.add(email);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allEmails = new Set(stallholders.map((holder) => holder.email));
      setSelectedRows(allEmails);
    } else {
      setSelectedRows(new Set());
    }
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

          <SidebarItem isSidebarOpen={isSidebarOpen} onClick={() => handleDropdownToggle('userManagement')}>
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span>User Management</span>
          </SidebarItem>

          {isDropdownOpen.userManagement && (
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

          <SidebarItem isSidebarOpen={isSidebarOpen} onClick={() => handleDropdownToggle('manageZone')}>
            <FontAwesomeIcon icon={faCogs} className="icon" />
            <span>Manage Zone</span>
          </SidebarItem>

          {isDropdownOpen.manageZone && (
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

          <SidebarItem isSidebarOpen={isSidebarOpen} onClick={() => handleDropdownToggle('manageSpace')}>
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span>Manage Space</span>
          </SidebarItem>

          {isDropdownOpen.manageSpace && (
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
                  <Title>
                    <Logo src={CarbonLogo} alt="Carbon Logo" />
                    <div>Dashboard</div>
                  </Title>
                </AppBar>

        <ToggleButton isSidebarOpen={isSidebarOpen} onClick={toggleSidebar}>
          <FaBars />
        </ToggleButton>

        <FormContainer title="Assign Collector to Zone">
          <div className="assign-collector-container">
            <div className="assign-form">
              <div className="form-group">
                <label>Select Collector:</label>
                <select
                  value={selectedCollector}
                  onChange={(e) => setSelectedCollector(e.target.value)}
                >
                  <option value="">-- Choose Collector --</option>
                  {collectors.map((collector) => (
                    <option key={collector.id} value={`${collector.firstName} ${collector.lastName} ${collector.middleName || ''}`}>
                      {`${collector.firstName} ${collector.lastName} ${collector.middleName || ''}`.trim()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Zone:</label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                >
                  <option value="">-- Choose Zone --</option>
                  {zones.map((zone, index) => (
                    <option key={index} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={handleAssign} className="assign-btn">
                Assign
              </button>
            </div>

            <div className="assignment-table">
              <h3>Current Assignments</h3>
              <table>
                <thead>
                  <tr>
                    <th>Collector</th>
                    <th>Zone</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssignments.map((collector) => (
                    <tr key={collector.id}>
                      <td>
                        <div className="collector-info">
                          {collector.Image && (
                            <img
                              src={collector.Image}
                              alt={`${collector.firstName} ${collector.lastName}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'path/to/fallback/image.png';
                              }}
                            />
                          )}
                          <span className="collector-name">
                            {`${collector.firstName} ${collector.lastName}`}
                          </span>
                        </div>
                      </td>
                      <td>{collector.zone}</td>
                    </tr>
                  ))}
                  {currentAssignments.length === 0 && (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>
                        No assignments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </FormContainer>

        <FormContainer>
          <h3>Zone Assignments</h3>
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedRows.size === stallholders.length}
                  />
                </th>
                <th>Email</th>
                <th>Assigned Collector</th>
                <th>Collector Number</th>
                <th>Current Zone</th>
              </tr>
            </thead>
            <tbody>
              {stallholders.map((holder) => (
                <tr key={holder.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(holder.email)}
                      onChange={() => handleRowSelect(holder.email)}
                    />
                  </td>
                  <td>{holder.email}</td>
                  <td>{holder.assignedCollector ? holder.assignedCollector : "N/A"}</td>
                  <td>{holder.collectorNumber ? holder.collectorNumber : "N/A"}</td>
                  <td>
                    <select
                      value={holder.currentZone || ''}
                      onChange={(e) => handleZoneChange(holder.id, e.target.value)}
                    >
                      <option value="">Select Zone</option>
                      <option value="Zone A">Zone A</option>
                      <option value="Zone B"></option>
                      <option value="Zone C">Zone C</option>
                      <option value="Zone D">Zone D</option>
                      {/* Add more zones as needed */}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormContainer>

        <FormContainer>
          <h3>List of Collectors</h3>
          <table>
            <thead>
              <tr>
                <th>Collector Name</th>
                <th>Collector First Name</th>
                <th>Collector Last Name</th>
                <th>Collector Number</th>
                <th>Assigned Zone</th>
              </tr>
            </thead>
            <tbody>
              {collectors.map(collector => (
                <tr key={collector.id}>
                  <td>{collector.firstName && collector.lastName ? `${collector.firstName} ${collector.lastName}` : 'N/A'}</td>
                  <td>{collector.firstName || 'N/A'}</td>
                  <td>{collector.lastName || 'N/A'}</td>
                  <td>{collector.collector || 'N/A'}</td>
                  <td>
                    <select
                      value={collectorZones[collector.id] || ''}
                      onChange={(e) => handleCollectorZoneChange(collector.id, e.target.value)}
                    >
                      <option value="">Select Zone</option>
                      <option value="Zone A">Zone A</option>
                      <option value="Zone B">Zone B</option>
                      <option value="Zone C">Zone C</option>
                      <option value="Zone D">Zone D</option>
                      {/* Add more zones as needed */}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;