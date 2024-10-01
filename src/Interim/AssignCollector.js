import React, { useState, useEffect, useRef } from 'react';
import { Link,  useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBars, FaSearch, FaUserCircle, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import { faHome, faShoppingCart, faUser, faSearch, faPlus, faUsers, faFileContract, faCog, faTicketAlt, faCheck} from '@fortawesome/free-solid-svg-icons';
import { rentmobileDb } from '../components/firebase.config';
import { interimDb } from '../components/firebase.config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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
  border: 1px solid #ddd;  /* ADD THIS */
  border-radius: 15px;
  background-color: #f8f9fa;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
    font-size: 16px; /* Adjusted for headings */
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px; /* ADD THIS */
    border: 1px solid #ddd;  /* ADD THIS */

    th, td {
      padding: 15px; 
      text-align: left;
      border-bottom: 2px solid #dee2e6;
      transition: background-color 0.2s ease;
    }

    th {
      background-color: #e9ecef;
      font-weight: bold;
      color: #495057; 
    }

    td {
      background-color: #fff;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9; 
    }

    tr:hover {
      background-color: #f1f3f5; 
    }
  }
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
    font-size: 12px;
  }

  th {
    background-color: #f8f9fa;
    font-weight: bold;
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

const AddZoneButton = styled.button`
  background-color: #007bff; // Bootstrap primary color
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 20px; // Space between button and form

  &:hover {
    background-color: #0056b3; // Darker shade on hover
  }
`;


const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stallholders, setStallholders] = useState([]);
  const [zoneAssignments, setZoneAssignments] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [collectorZones, setCollectorZones] = useState({}); // To hold the assigned zones for collectors
  const [availableZones, setAvailableZones] = useState(['Zone A', 'Zone B']);
  const navigate = useNavigate();

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

    // Filter out collectors that have no valid data in key fields
    const filteredCollectors = collectorList.filter(collector => collector.firstName && collector.lastName && collector.collector);
    setCollectors(filteredCollectors);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchStallholders();
      await fetchCollectors();
    };
    
    
  
    fetchData();
  }, []);

  

  const handleSaveAssignments = async () => {
    try {
      await Promise.all(zoneAssignments.map(async assignment => {
        const stallholderDoc = doc(rentmobileDb, 'user_ambulant', assignment.id);
        await updateDoc(stallholderDoc, { assignedZone: assignment.zone });
      }));
      alert('Zone assignments saved successfully!');
    } catch (error) {
      console.error('Error saving assignments: ', error);
      alert('Failed to save assignments.');
    }
  };
  useEffect(() => {
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

    fetchUserData();
  }, []);

  
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

const rotateAssignments = () => {
  // Get unique zones from stallholders
  const uniqueZones = [...new Set(stallholders.map(stallholder => stallholder.assignedZone))].filter(zone => zone);

  // If there are no zones, alert and provide guidance
  if (uniqueZones.length === 0) {
    alert('No zones available for rotation! Please assign zones to stallholders before rotating.');
    return;
  }

  const newAssignments = stallholders.map(stallholder => {
    const currentZoneIndex = uniqueZones.indexOf(stallholder.assignedZone);
    const nextZoneIndex = (currentZoneIndex + 1) % uniqueZones.length; // Rotate to the next zone
    const nextZone = uniqueZones[nextZoneIndex];

    return {
      ...stallholder,
      assignedZone: nextZone, // Update to the next zone
      // We can also define what the "next" zone is here if needed
    };
  });

  // Update state with new assignments
  setStallholders(newAssignments);
  alert('Assignments rotated successfully!');
};


const handleAssignCollector = async (collectorId) => {
  try {
    // Get the selected zone (assuming you have a state for the selected zone)
    const selectedZone = collectorZones[collectorId]; // Or however you determine the selected zone

    // Filter stallholders by the selected zone
    const stallholdersInZone = stallholders.filter(stallholder => stallholder.assignedZone === selectedZone);

    // Update all stallholders in the selected zone with the new collector
    await Promise.all(stallholdersInZone.map(async (stallholder) => {
      const stallholderRef = doc(rentmobileDb, 'user_ambulant', stallholder.id);
      await updateDoc(stallholderRef, { collectorId });
    }));

    alert(`Assigned Collector ${collectorId} to all stallholders in ${selectedZone} zone!`);
  } catch (error) {
    console.error('Error assigning collector: ', error);
    alert('Failed to assign collector.');
  }
};
const handleEdit = (stallholderId) => {
  // Implement the edit logic here
  console.log(`Editing stallholder with ID: ${stallholderId}`);
};

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

  <Link to="/Addunit" style={{ textDecoration: 'none' }}>
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
          <button onClick={rotateAssignments}>Rotate Assignments</button>
        </AppBar>

        <ProfileHeader>
          <h1>Zone Assignments</h1>
        </ProfileHeader>

        {/* Add the Add Zone button here */}
        <AddZoneButton onClick={() => navigate('/addzone')}>
          Add Zone
        </AddZoneButton>

        <button onClick={rotateAssignments}>Rotate Assignments</button>
        <FormContainer>
  <h3>Assign Stallholders to Zones</h3>
  <Table>
    <thead>
      <tr>
        <th>Email</th>
        <th>Current Zone</th>
        <th>Action</th>
        <th>Assigned Collector</th>
        <th>Collector Name</th>
        <th>Collector Number</th>
      </tr>
    </thead>
    <tbody>
      {stallholders.map(stallholder => {
        const assignedCollector = collectors.find(collector => collector.id === stallholder.collectorId);
        return (
          <tr key={stallholder.id}>
            <td>{stallholder.email}</td>
            <td>{stallholder.assignedZone || 'No Zone Assigned'}</td>
            <td>
              {/* Display Next Zone as text, the same as Current Zone */}
              <span>{stallholder.assignedZone || 'No Zone Assigned'}</span>
              {/* Add Edit Icon */}
              <FaEdit 
                style={{ cursor: 'pointer', marginLeft: '10px', color: '#007bff' }} 
                onClick={() => handleEdit(stallholder.id)} // Replace with your edit handler
              />
            </td>
            <td>
              <div>
                {collectors.map(collector => (
                  <button
                    key={collector.id}
                    onClick={() => handleAssignCollector(stallholder.id, collector.id)}
                    style={{
                      margin: '2px',
                      padding: '5px',
                      cursor: 'pointer',
                      backgroundColor: collector.id === stallholder.collectorId ? '#007bff' : '#e9ecef',
                      color: collector.id === stallholder.collectorId ? 'white' : 'black',
                      border: 'none',
                      borderRadius: '5px'
                    }}
                  >
                    {collector.firstName} {collector.lastName}
                  </button>
                ))}
              </div>
            </td>
            <td>{assignedCollector ? assignedCollector.firstName : 'N/A'}</td>
            <td>{assignedCollector ? assignedCollector.lastName : 'N/A'}</td>
            <td>{assignedCollector ? assignedCollector.collector : 'N/A'}</td>
          </tr>
        );
      })}
    </tbody>
  </Table>

  <button onClick={handleSaveAssignments}>Save Assignments</button>
</FormContainer>


<FormContainer>
  <h3>List of Collectors</h3>
  <Table>
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
              onChange={(e) => handleZoneChange(collector.id, e.target.value)} // Function to handle zone change
            >
              <option value="">Select Zone</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
              {/* Add more zones as needed */}
            </select>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
</FormContainer>


      </MainContent>
      </DashboardContainer>
  );
};

export default Dashboard;