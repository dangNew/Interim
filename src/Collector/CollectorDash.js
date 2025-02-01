import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUserSlash, FaUser, FaWallet } from 'react-icons/fa';
import SidenavCollector from "./SidenavCollector";
import { rentmobileDb } from '../components/firebase.config';
import { collection, getDocs, query, where } from 'firebase/firestore';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f5f7;
`;

const MainContent = styled.div`
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")};
  padding-left: 10px;
  background-color: #fff;
  padding: 2rem;
  width: calc(
    100% - ${({ isSidebarOpen }) => (isSidebarOpen ? "230px" : "60px")}
  );
  transition: margin-left 0.3s ease, width 0.3s ease;
  overflow-y: auto;
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
  font-family: "Inter", sans-serif;
  font-weight: bold;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 1000px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  background-color: ${({ bgColor }) => bgColor || '#3b5998'}; /* Default to Soft Blue */
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #ccc;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #f8f9fa; /* Light Gray-White */
  }

  p {
    font-size: 2rem;
    margin: 0;
    font-weight: bold;
    color: #f8f9fa; /* Light Gray-White */
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

const CollectorTableContainer = styled(FormContainer)`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
`;

const CollectorTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

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
`;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [totalCollectors, setTotalCollectors] = useState(0);
  const [collectorsData, setCollectorsData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [totalCollectedToday, setTotalCollectedToday] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, 'ambulant_collector'));
        const collectorsCount = querySnapshot.size;
        console.log('Number of collectors fetched:', collectorsCount);

        setTotalCollectors(collectorsCount);

        // Set the collectors data in the state
        const collectorsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched Collectors Data:', collectorsData);
        setCollectorsData(collectorsData);
      } catch (error) {
        console.error('Error fetching collectors:', error);
      }
    };

    fetchCollectors();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(rentmobileDb, 'admin_users'));
        const allUsers = querySnapshot.docs.map(doc => doc.data());

        console.log('Fetched Users:', allUsers);
        const validUsers = allUsers.filter(user => user.email && user.firstName && user.lastName);
        setTotalUsers(validUsers.length);

        const activeUsersCount = validUsers.filter(user => user.status?.toLowerCase() === 'active').length;
        setActiveUsers(activeUsersCount);

        const inactiveUsersCount = validUsers.filter(user => user.status?.toLowerCase() === 'inactive').length;
        setInactiveUsers(inactiveUsersCount);

        setRecentUsers(validUsers.slice(-5));

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

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentsRef = collection(rentmobileDb, 'payments');
        const q = query(paymentsRef, where('status', '==', 'paid'), where('updatedBy', '==', loggedInUser?.email));
        const querySnapshot = await getDocs(q);
        let totalAmount = 0;

        querySnapshot.forEach((doc) => {
          const paymentData = doc.data();
          totalAmount += paymentData.amount;
        });

        setTotalCollectedToday(totalAmount);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    if (loggedInUser) {
      fetchPayments();
    }
  }, [loggedInUser]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMainContentClick = () => {
    setIsSidebarOpen(false);
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
      <div ref={sidebarRef}>
        <SidenavCollector
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          loggedInUser={loggedInUser}
        />
      </div>
      <MainContent
        isSidebarOpen={isSidebarOpen}
        onClick={handleMainContentClick}
      >
        <AppBar>
          <div className="title">OFFICE OF THE CITY MARKETS</div>
        </AppBar>
        <br></br>

        <StatsContainer>
          <StatBox bgColor="#5c6bc0">
            <h3>Total Collected Today</h3>
            <p>{totalCollectedToday}</p> {/* Display the total collected today */}
            <div className="icon-container">
              <FaWallet className="fading-icon" style={{
                fontSize: '30px',
                opacity: 0.5,
                animation: 'fade 2s infinite alternate'
              }} />
            </div>
          </StatBox>

          <StatBox bgColor="#66bb6a">
            <h3>Number of Vendors Paid</h3>
            <p>{inactiveUsers}</p> {/* Display the total user count */}
            <div className="icon-container">
              <FaUserSlash className="fading-icon" style={{
                fontSize: '30px',
                opacity: 0.5,
                animation: 'fade 2s infinite alternate'
              }} />
            </div>
          </StatBox>
        </StatsContainer>

        {/* Recently Registered Users Section */}
        <FormContainer>
          <h3>Recently Registered</h3>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user, index) => (
                <tr key={index}>
                  <td>{user.email || ''}</td>
                  <td>{user.firstName || ''}</td>
                  <td>{user.lastName || ''}</td>
                  <td>{user.contactNum || ''}</td>
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
